"""PreToolUse hook for the Bash and PowerShell tools: the git safety rules of AGENTS.md ("Git guardrails").

Ported from PitchCraft (pitchcraft-agent/.claude/hooks/git_guard.py), where its QA runs found and closed the
bypasses listed below. Changes for this repo: the working branch is `dev` (not `v2`), `gh pr create` is allowed (the
agent may open the PR dev -> main), and the fast-forward sync of `main` into `dev` is allowed.

Claude Code runs this before every Bash and PowerShell call (`.claude/settings.json` has one matcher for each)
and gives it the call as JSON on stdin (`{"tool_name": "Bash", "tool_input": {"command": "..."}}`). Exit code 0
lets the call through; exit code 2 blocks it and sends the reason (stderr) back to the session. Nothing here
edits anything.

It blocks:
  - a push to any branch other than `dev` or `experiment/*`;
  - any operation on `main` / `master` or on a tag (reading them is allowed: `git log main`, `git tag --list`), except
    the fast-forward sync `git pull --ff-only origin main` / `git merge --ff-only origin/main` while on `dev`;
  - `--force`, `--force-with-lease`, a `+refspec`, `rebase`, `reset --hard`, `--no-verify`, `filter-branch`;
  - deleting or renaming `dev` or `main` (`git branch -d/-D/-m`);
  - changing a remote (`git remote add`, `set-url`, `remove`, `rename`, ...);
  - `commit --amend` when HEAD is already on a remote;
  - a commit whose author or committer is not the owner (GIT_AUTHOR_*/GIT_COMMITTER_*, author.*/committer.*, user.*), and
    `-c` or `--config-env` of any identity key;
  - every git config write, in any spelling (round 2, fail closed): `git config` passes only as a read, with a read verb
    or action and every other option an exact name from CONFIG_READ_OPTIONS. Abbreviations (`--remove-s`), `set`, `unset`,
    `edit`, sections, any scope: blocked. Agents never write git config; Daniel does it by hand. `-c core.hooksPath`,
    `-c include.path` and GIT_CONFIG_* naming hooksPath are blocked on any command;
  - a git write (anything but a read: commit, merge, push, pull, tag, branch -d, reset, an alias...) whose checkout and branch
    the guard cannot be sure of (round 2, fail closed): inside a command substitution, on a line with a pipe, a subshell or
    a block, after a cd/pushd/popd/Set-Location, an export or `$env:` assignment, `source`, an alias or a function on the
    same line, in a checkout named at run time (`-C $x`), with a ref built at run time (`git push origin $b`), with an
    environment variable or `-c` key outside a short list, or with a subcommand the guard does not know (an alias). The
    checkout is the session's `cwd` from the hook input plus the command's own literal `-C`, `--git-dir`, `--work-tree`,
    `GIT_DIR`, `GIT_WORK_TREE`. A commit or merge on a detached HEAD is blocked too;
  - a command line the guard cannot follow when it mentions git: a quote, bracket or here-document left open, or a
    here-document or here-string whose body the shell expands;
  - git behind a wrapper that carries a string the parser cannot see into (`bash -c`, `sh -c`, `eval`,
    `powershell`/`pwsh -Command`, `cmd /c`, `python -c`, `node -e`, `Invoke-Expression`, `xargs`, `trap`, ...) whenever the
    string mentions git, git behind a runner's own arguments (`timeout 5 git`, `env -u X git`), a shell or interpreter
    reading its commands from stdin on a line that mentions git (`echo "git push" | bash`, `bash <<EOF`), and git behind a
    program name built at run time (`x=git; $x push ...`). The session runs git directly instead, where the rules can read it.

It also blocks every write through `gh` and to the GitHub API: `gh api` with any method but GET (`-X`/`--method`), with
`-f`, `-F`, `--field`, `--raw-field` unless the method is an explicit GET, with `--input`, or on `graphql`; every `gh`
family or verb that is not on the allowed list (READ_ONLY_GH: `run list/view/watch/download`,
`pr view/list/diff/checks/status/create`, `issue view/list/status`, `repo view/list`, `workflow list/view`, `auth status`,
`cache list`, `api` GET, `status`, `search`), so `gh pr merge` is blocked; `gh auth status` with the token option in any
spelling; and `curl`, `wget`, `Invoke-RestMethod`, `Invoke-WebRequest` (and their aliases) against api.github.com or
uploads.github.com with a non-GET method, a body or credentials. `gh` and the API behind a wrapper are blocked like git.

Git options are read the way git reads them: combined short flags (`-fu`) and unambiguous abbreviations (`--forc`).

What it does not see: a script file or a program that runs git or gh on its own, a function or alias defined in an earlier
call or in the shell profile, a gh alias already stored in the owner's gh config, a request whose URL or method is built at
run time, and any other tool. The git hooks in `.githooks/` and the GitHub
rulesets on `main` and `dev` are the other lines for those cases.

The decision is `decide(command, git)`; `git(*args)` runs git and returns its output (the tests pass a fake).
Every line of the rules above is a test in `.claude/hooks/test_git_guard.py`.
"""

from __future__ import annotations

import json
import os
import re
import shlex
import subprocess
import sys
from collections.abc import Callable

OWNER_NAME = "Daniel Herdenez"
OWNER_EMAIL = "edherdenez@gmail.com"
WORKING_BRANCH = "dev"
ALLOWED_PUSH_BRANCH = re.compile(r"^(dev|experiment/.+)$")
PROTECTED_BRANCHES = ("main", "master")

# Subcommands that only read: naming `main` or a tag in them is fine (`git diff main...HEAD`, `git show v1.0.0`).
READ_ONLY = {
    "status", "diff", "log", "show", "rev-parse", "rev-list", "merge-base", "cat-file", "ls-tree", "ls-files",
    "blame", "shortlog", "describe", "name-rev", "for-each-ref", "show-ref", "ls-remote", "range-diff", "grep",
    "whatchanged", "diff-tree", "diff-index", "count-objects", "check-ignore", "config", "help", "version", "remote",
    "stash", "add",
}
# Subcommands that create commits (their identity must be the owner's).
COMMITTING = {"commit", "merge", "revert", "cherry-pick", "am"}
# `git config` passes only as a read: a read verb or a read action, and every other option an exact name from this list (no
# abbreviation: `--remove-s` is not on it). Everything else is a write, whatever its spelling; agents never write git config.
CONFIG_READ_VERBS = {"get", "list", "get-color", "get-colorbool"}
CONFIG_READ_ACTIONS = {"--get", "--get-all", "--get-regexp", "--get-urlmatch", "-l", "--list", "--get-color", "--get-colorbool"}
CONFIG_READ_OPTIONS = {
    "--global", "--system", "--local", "--worktree", "-f", "--file", "--blob", "--type", "--no-type", "--bool", "--int",
    "--bool-or-int", "--path", "--expiry-date", "-z", "--null", "--name-only", "--show-origin", "--show-scope", "--includes",
    "--no-includes", "--default", "--all", "--regexp", "--value", "--fixed-value", "--url", "--show-names", "--no-show-names",
}
CONFIG_VERBS = {"get", "set", "unset", "list", "edit", "rename-section", "remove-section", "get-color", "get-colorbool"}
CONFIG_VALUE_OPTIONS = {"-f", "--file", "--blob", "--type", "--default", "--value", "--url", "--comment"}
# `-c` and `--config-env` keys that set who a commit is from
IDENTITY_KEYS = {"user.name", "user.email", "author.name", "author.email", "committer.name", "committer.email"}
# the `-c` keys a git write may carry: display settings; any other key could change what the write does
WRITE_CONFIG_ALLOWED = ("color.", "pager.", "advice.", "i18n.", "core.pager", "core.quotepath", "core.editor")
# the environment variables a git write may carry; any other (GIT_CONFIG_*, GIT_INDEX_FILE, HOME, ...) could change what it reads
WRITE_ENV_ALLOWED = {
    "GIT_AUTHOR_NAME", "GIT_AUTHOR_EMAIL", "GIT_AUTHOR_DATE", "GIT_COMMITTER_NAME", "GIT_COMMITTER_EMAIL", "GIT_COMMITTER_DATE",
    "GIT_EDITOR", "GIT_SEQUENCE_EDITOR", "GIT_PAGER", "PAGER", "GIT_TERMINAL_PROMPT", "GIT_DIR", "GIT_WORK_TREE", "LANG",
    "LC_ALL", "TZ",
}
# every git subcommand the guard knows; another word is an alias or an external command, which the guard cannot read
GIT_SUBCOMMANDS = READ_ONLY | {
    "commit", "merge", "revert", "cherry-pick", "am", "push", "pull", "fetch", "checkout", "switch", "branch", "tag", "reset",
    "restore", "rm", "mv", "clean", "worktree", "init", "clone", "notes", "submodule", "update-ref", "symbolic-ref", "apply",
    "gc", "prune", "repack", "maintenance", "sparse-checkout", "bisect", "fsck", "reflog", "replace", "format-patch", "archive",
    "bundle", "mergetool", "difftool", "rebase", "replay", "filter-branch", "filter-repo", "update-index", "read-tree",
    "write-tree", "commit-tree", "hash-object", "mktag", "mktree", "rerere", "verify-commit", "verify-tag", "check-attr",
    "check-ref-format", "check-mailmap", "column", "request-pull", "annotate", "show-branch", "cherry", "pack-refs", "var",
    "interpret-trailers", "fast-export", "fast-import", "multi-pack-index", "commit-graph", "hook", "refs", "backfill",
    "credential", "bugreport", "diagnose", "send-email", "stripspace",
}
# `git branch` lists (and writes nothing) when every option is one of these and it names no branch, or it says it lists
BRANCH_LISTING_FLAGS = {
    "--show-current", "-r", "--remotes", "-a", "--all", "-l", "--list", "-v", "-vv", "--verbose", "--contains", "--no-contains",
    "--merged", "--no-merged", "--points-at", "--format", "--sort", "--color", "--no-color", "--column", "--no-column", "-i",
    "--ignore-case", "--abbrev", "--no-abbrev", "-q", "--quiet", "--omit-empty",
}
BRANCH_LISTING_MARKERS = {"-l", "--list", "--show-current", "--contains", "--no-contains", "--merged", "--no-merged", "--points-at"}
REMOTE_CHANGING = {"add", "set-url", "remove", "rm", "rename", "set-head", "set-branches", "prune"}
BRANCH_REMOVING_FLAGS = {"-d", "-D", "--delete", "-m", "-M", "--move"}
PUSH_OPTIONS_WITH_VALUE ={"-o", "--push-option", "--repo", "--receive-pack", "--exec"}
TAG_LISTING_FLAGS = {"-l", "--list", "-n", "--contains", "--no-contains", "--points-at", "--sort", "--format", "--merged",
                     "--no-merged", "-v", "--verify", "--column", "--no-column", "-i", "--ignore-case"}

GitRunner = Callable[..., str]
REDIRECTION = re.compile(r"^\d*(>>?|<)")  # `>out`, `2>`, `2>/dev/null`, `<in`: not arguments of the command


def run_git(*args: str) -> str:
    result = subprocess.run(["git", *args], capture_output=True, text=True, check=True)
    return result.stdout.strip()


# --- reading the command -------------------------------------------------------------------------------------


SUBSTITUTION = "$SUB"  # what a substitution leaves in the line; it starts with `$`, so a path or a word holding it is "built at run time"
HEREDOC = re.compile(r"<<(-?)[ \t]*(['\"]?)([A-Za-z_][A-Za-z0-9_]*)\2")


class Shape:
    """A command line as the shell groups it: the top-level code, the code of each substitution, and what makes it hard to follow."""

    def __init__(self) -> None:
        self.text = ""  # the top-level code: here-document bodies dropped, newlines inside quotes folded, substitutions as $SUB
        self.substitutions: list[str] = []  # the code inside each `$(...)`, backticks, `<(...)`, `>(...)`, `@(...)`
        self.pipe = False  # `a | b`: each side runs in its own process
        self.group = False  # `( ... )` or `{ ... }`: a subshell, a block, a script block, a function body
        self.unbalanced = False  # a quote, bracket, substitution or here-document left open
        self.opaque = False  # a here-document or here-string whose body the shell expands (`$(...)` or backticks in it)


def _skip_heredoc_bodies(command: str, index: int, heredocs: list[tuple[str, bool, bool]], result: Shape) -> int:
    for terminator, expands, dash in heredocs:
        while True:
            if index >= len(command):
                result.unbalanced = True
                return len(command)
            end = command.find("\n", index)
            end = len(command) if end < 0 else end
            line = command[index:end].rstrip("\r")
            index = end + 1
            if (line.lstrip("\t") if dash else line) == terminator:
                break
            if expands and re.search(r"\$\(|`", line):
                result.opaque = True
    return min(index, len(command))


def _skip_here_string(command: str, index: int, result: Shape) -> int:
    """A PowerShell here-string, `@'` or `@"` at the end of a line, up to the line that starts with `'@` or `"@`."""

    quote = command[index + 1]
    position = command.find("\n", index)
    while position >= 0:
        start = position + 1
        end = command.find("\n", start)
        line = command[start : len(command) if end < 0 else end]
        if line.startswith(quote + "@"):
            return start + 2
        if quote == '"' and re.search(r"\$\(", line):
            result.opaque = True
        position = end
    result.unbalanced = True
    return len(command)


def shape(command: str) -> Shape:
    """
    Read the command line the way the shell groups it: quotes, substitutions, subshells, blocks, pipes and here-documents.
    Text inside quotes stays one word even across lines; a here-document body is dropped (it is text for a program, such as
    a commit message); the code inside a substitution is set aside and read on its own.
    """

    result = Shape()
    buffer: list[str] = []
    stack: list[tuple[str, list[str] | None]] = []  # open contexts, innermost last: (kind, the buffer a substitution returns to)
    heredocs: list[tuple[str, bool, bool]] = []  # the here-documents opened on the current line: (terminator, expanded, `<<-`)
    index, length = 0, len(command)

    def inside_substitution() -> bool:
        return any(kind in ("$(", "`") for kind, _ in stack)

    def open_substitution(kind: str) -> None:
        nonlocal buffer
        stack.append((kind, buffer))
        buffer = []

    def close_substitution() -> None:
        nonlocal buffer
        _, parent = stack.pop()
        result.substitutions.append("".join(buffer))
        buffer = parent if parent is not None else []
        buffer.append(SUBSTITUTION)

    while index < length:
        char, pair = command[index], command[index : index + 2]
        kind = stack[-1][0] if stack else ""
        if pair == "\\\n" and kind != "'":  # a line continuation
            buffer.append(" ")
            index += 2
            continue
        if char == "\n":
            buffer.append(" " if kind in ("'", '"') else "\n")
            index += 1
            if heredocs:
                index = _skip_heredoc_bodies(command, index, heredocs, result)
                heredocs = []
            continue
        if kind == "'":
            buffer.append(char)
            if char == "'":
                stack.pop()
            index += 1
            continue
        if kind == '"':
            if char == "\\" and index + 1 < length:
                buffer.append(pair)
                index += 2
            elif char == '"':
                buffer.append(char)
                stack.pop()
                index += 1
            elif pair == "$(":
                open_substitution("$(")
                index += 2
            elif char == "`":
                open_substitution("`")
                index += 1
            else:
                buffer.append(char)
                index += 1
            continue
        # code: the top level, a group, the inside of a substitution
        if char == "\\" and index + 1 < length:
            buffer.append(pair)
            index += 2
        elif char == "#" and (index == 0 or command[index - 1] in " \t\n;&|({"):  # a comment, to the end of the line
            end = command.find("\n", index)
            index = length if end < 0 else end
        elif char in "'\"":
            stack.append((char, None))
            buffer.append(char)
            index += 1
        elif pair in ("$(", "@(", "<(", ">("):
            open_substitution("$(")
            index += 2
        elif char == "`":
            if kind == "`":
                close_substitution()
            else:
                open_substitution("`")
            index += 1
        elif pair == "${":  # a variable, `${name}` or `${env:NAME}`
            end = command.find("}", index)
            end = length - 1 if end < 0 else end
            buffer.append(command[index : end + 1])
            index = end + 1
        elif char in "({":
            stack.append((char, None))
            buffer.append(char)
            if not inside_substitution():
                result.group = True
            index += 1
        elif char in ")}":
            if kind == ("(" if char == ")" else "{"):
                stack.pop()
                buffer.append(char)
            elif char == ")" and kind == "$(":
                close_substitution()
            else:
                result.unbalanced = True
                buffer.append(char)
            index += 1
        elif char == "|":
            if pair == "||":
                buffer.append(pair)
                index += 2
                continue
            if not inside_substitution():
                result.pipe = True
            buffer.append(char)
            index += 1
        elif command.startswith("<<<", index):  # a here-string: one word, not a here-document
            buffer.append("<<<")
            index += 3
        elif pair == "<<" and HEREDOC.match(command, index):
            match = HEREDOC.match(command, index)
            heredocs.append((match.group(3), not match.group(2), bool(match.group(1))))
            buffer.append("<HEREDOC")  # a redirection: the splitter drops it, and reading a substitution does not reopen it
            index = match.end()
        elif pair in ("@'", '@"') and not command[index + 2 :].split("\n", 1)[0].strip():
            index = _skip_here_string(command, index, result)
            buffer.append("''")
        else:
            buffer.append(char)
            index += 1
    if stack or heredocs:
        result.unbalanced = True
    while stack:  # a substitution left open is still read
        if stack[-1][0] in ("$(", "`"):
            close_substitution()
        else:
            stack.pop()
    result.text = "".join(buffer)
    return result


def _split(text: str, punctuation: str = ";&|") -> list[list[str]]:
    """The simple commands of shaped text, as token lists (split on the punctuation and on newlines, outside quotes)."""

    commands: list[list[str]] = []
    for line in text.split("\n"):
        try:
            lexer = shlex.shlex(line, posix=True, punctuation_chars=punctuation)
            lexer.whitespace_split = True
            tokens = list(lexer)
        except ValueError:
            tokens = line.split()
        current: list[str] = []
        skip_target = False
        for token in tokens:
            if token and set(token) <= set(punctuation):
                if current:
                    commands.append(current)
                current = []
                skip_target = False
            elif skip_target:
                skip_target = False  # the file a bare `>` or `2>` writes to
            elif REDIRECTION.match(token):
                skip_target = bool(re.fullmatch(r"\d*(>>?|<)", token))  # `>out.txt` has its target inside; `>` has it next
            else:
                current.append(token)
        if current:
            commands.append(current)
    return commands


def segments(command: str) -> list[list[str]]:
    """The simple commands of the top level of a command line (the code of a substitution is read on its own)."""

    return _split(shape(command).text)


# Long options the rules below look for. Git accepts any unambiguous abbreviation (`--forc`, `--no-ver`, `--amen`), so an
# abbreviation of one of these is read as the option itself (the shortest one it could be).
DANGEROUS_LONG = (
    "--force", "--force-with-lease", "--force-if-includes", "--no-verify", "--amend", "--hard", "--mirror", "--delete",
    "--tags", "--follow-tags", "--prune", "--rebase", "--all",
)


def canonical_option(arg: str) -> str:
    name, equals, value = arg.partition("=")
    if name.startswith("--") and len(name) >= 4 and name not in DANGEROUS_LONG:
        candidates = [option for option in DANGEROUS_LONG if option.startswith(name)]
        if candidates:
            return min(candidates, key=len) + equals + value
    return arg


def program_name(token: str) -> str:
    """`C:\\Program Files\\Git\\cmd\\git.exe` -> `git`: the program a command word runs, without directory and extension."""

    name = re.split(r"[\\/]", token)[-1].lower()
    return re.sub(r"\.(exe|cmd|bat|com|ps1)$", "", name)


def known_path(path: str) -> bool:
    """Whether the guard can name a directory from its text: not one built at run time (`$x`, `$(...)`, backticks, `%X%`)."""

    return bool(path) and path != "-" and not re.search(r"[$`%]", path)


class Invocation:
    """One `git ...` simple command: its environment, its global options, its subcommand and its arguments."""

    def __init__(self, tokens: list[str]):
        self.env: dict[str, str] = {}
        self.config: dict[str, str] = {}
        self.sub = ""
        self.args: list[str] = []
        # where git runs: the -C, --git-dir and --work-tree options (and GIT_DIR, GIT_WORK_TREE), passed on to every lookup
        self.location: list[str] = []
        self.location_known = True
        index = 0
        while index < len(tokens) and re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*=.*", tokens[index]):
            name, _, value = tokens[index].partition("=")
            self.env[name] = value
            index += 1
        if index >= len(tokens) or program_name(tokens[index]) != "git":
            self.is_git = False
            return
        self.is_git = True
        index += 1
        while index < len(tokens) and tokens[index].startswith("-"):
            token = tokens[index]
            if token == "-c" and index + 1 < len(tokens):
                key, _, value = tokens[index + 1].partition("=")
                self.config[key.lower()] = value
                index += 2
            elif token == "--config-env" and index + 1 < len(tokens):  # `--config-env key=ENVVAR`: the value comes from a variable
                self.config[tokens[index + 1].partition("=")[0].lower()] = "$" + tokens[index + 1].partition("=")[2]
                index += 2
            elif token.startswith("--config-env="):
                key = token.split("=", 1)[1].partition("=")[0]
                self.config[key.lower()] = "$" + token.split("=", 2)[-1]
                index += 1
            elif token in ("-C", "--git-dir", "--work-tree") and index + 1 < len(tokens):
                self._locate(token, tokens[index + 1])
                index += 2
            elif token.startswith(("--git-dir=", "--work-tree=")):
                name, _, value = token.partition("=")
                self._locate(name, value)
                index += 1
            elif token == "--namespace" and index + 1 < len(tokens):
                index += 2
            else:
                index += 1
        for variable, option in (("GIT_DIR", "--git-dir"), ("GIT_WORK_TREE", "--work-tree")):
            if variable in self.env and option not in self.location:  # the option wins over the variable, as in git
                self._locate(option, self.env[variable])
        if index < len(tokens):
            self.sub = tokens[index]
            self.args = [canonical_option(arg) for arg in tokens[index + 1 :]]

    def _locate(self, option: str, path: str) -> None:
        if not known_path(path):
            self.location_known = False
        self.location.extend([option, path])

    def flags(self) -> list[str]:
        """The arguments that are options (they start with `-`), up to a `--`."""

        found = []
        for arg in self.args:
            if arg == "--":
                break
            if arg.startswith("-"):
                found.append(arg)
        return found

    def positional(self, with_value: set[str] | None = None) -> list[str]:
        with_value = with_value or set()
        found, skip = [], False
        for arg in self.args:
            if skip:
                skip = False
            elif arg in with_value:
                skip = True
            elif not arg.startswith("-") or arg == "-":
                found.append(arg)
        return found


# --- the rules -------------------------------------------------------------------------------------------------


def _ref_name(ref: str) -> str:
    for prefix in ("refs/heads/", "refs/remotes/origin/", "remotes/origin/", "origin/"):
        if ref.startswith(prefix):
            return ref[len(prefix) :]
    return ref


def _is_protected(ref: str) -> bool:
    return _ref_name(ref) in PROTECTED_BRANCHES


def _tag_names(git: GitRunner) -> set[str]:
    try:
        return {line.strip() for line in git("tag", "--list").splitlines() if line.strip()}
    except Exception:  # noqa: BLE001 - a repository without tags, or git missing: nothing to protect by name
        return set()


def _current_branch(git: GitRunner) -> str:
    try:
        return git("branch", "--show-current")
    except Exception:  # noqa: BLE001
        return ""


def _push_problem(inv: Invocation, git: GitRunner) -> str | None:
    flags = inv.flags()
    for flag in flags:
        if flag == "--force" or flag.startswith("--force-with-lease") or flag == "--force-if-includes" or re.fullmatch(r"-[a-zA-Z]*f[a-zA-Z]*", flag):
            return "a force push is never allowed (AGENTS.md)"
        if re.fullmatch(r"-[a-zA-Z]*d[a-zA-Z]*", flag):
            return "git push -d can move or delete refs beyond dev (AGENTS.md)"
        if flag in ("--all", "--mirror", "--tags", "--follow-tags", "--delete", "-d", "--prune"):
            return f"git push {flag} can move or delete refs beyond dev (AGENTS.md)"
    positional = inv.positional(PUSH_OPTIONS_WITH_VALUE)
    refspecs = positional[1:]
    if "tag" in refspecs[:1]:
        return "pushing a tag is not allowed: tags are frozen (AGENTS.md)"
    destinations: list[tuple[str, str]] = []
    for refspec in refspecs:
        if refspec.startswith("+"):
            return "a +refspec is a force push (AGENTS.md)"
        if refspec.startswith(":"):
            return "pushing an empty source deletes a remote ref (AGENTS.md)"
        source, _, destination = refspec.partition(":")
        destinations.append((source, destination or source))
    if not destinations:  # `git push` or `git push origin`: the current branch
        branch = _current_branch(git)
        destinations.append((branch, branch))
    for source, destination in destinations:
        if source == "HEAD" and destination == "HEAD":
            destination = _current_branch(git)
        destination = _ref_name(destination)
        if destination.startswith(("refs/tags/", "tags/")):
            return "pushing a tag is not allowed: tags are frozen (AGENTS.md)"
        if _is_protected(destination):
            return f"{destination!r} is the release branch: only the owner touches it (AGENTS.md)"
        if not ALLOWED_PUSH_BRANCH.match(destination):
            return f"git push is allowed only to dev or experiment/*, not to {destination or '(no branch)'!r} (AGENTS.md)"
    return None


def _identity_value(inv: Invocation, git: GitRunner, role: str, field: str) -> str | None:
    """The name or email git would use for the author or committer: GIT_<ROLE>_<FIELD>, then <role>.<field>, then user.<field>."""

    variable = f"GIT_{role.upper()}_{field.upper()}"
    if variable in inv.env:
        return inv.env[variable]
    if os.environ.get(variable):
        return os.environ[variable]
    for key in (f"{role}.{field}", f"user.{field}"):
        try:
            value = git("config", key)
        except Exception:  # noqa: BLE001 - the key is not set
            continue
        if value:
            return value
    return None


def _identity_problem(inv: Invocation, git: GitRunner) -> str | None:
    values = {
        f"{role} {field}": _identity_value(inv, git, role, field) for role in ("author", "committer") for field in ("name", "email")
    }
    for index, arg in enumerate(inv.args):  # --author="Name <email>"
        given = arg.split("=", 1)[1] if arg.startswith("--author=") else inv.args[index + 1] if arg == "--author" and index + 1 < len(inv.args) else None
        if given is not None:
            match = re.fullmatch(r"\s*(.*?)\s*<(.*)>\s*", given)
            values["author name"], values["author email"] = (match.group(1), match.group(2)) if match else (given, None)
    for what, value in values.items():
        expected = OWNER_NAME if "name" in what else OWNER_EMAIL
        if value != expected:
            return f"the {what} is {value!r}; commits are made as {OWNER_NAME} <{OWNER_EMAIL}> (AGENTS.md)"
    return None


def _pushed(git: GitRunner) -> bool | None:
    try:
        return bool(git("branch", "-r", "--contains", "HEAD").strip())
    except Exception:  # noqa: BLE001
        return None


def _problem(inv: Invocation, git: GitRunner) -> str | None:
    sub, args, flags = inv.sub, inv.args, inv.flags()

    # whatever the subcommand
    if any(f == "--force" or f.startswith("--force-with-lease") or f == "--force-if-includes" for f in flags):
        return "--force and --force-with-lease are never allowed (AGENTS.md)"
    if any(re.fullmatch(r"-[a-zA-Z]*f[a-zA-Z]*", f) for f in flags) and sub in ("push", "checkout", "switch", "branch", "clean", "tag", "reset", "worktree"):
        return f"git {sub} -f is a force and is never allowed (AGENTS.md)"
    if "--no-verify" in args or (sub == "commit" and any(re.fullmatch(r"-[a-zA-Z]*n[a-zA-Z]*", f) for f in flags)):
        return "--no-verify skips the hooks and is never allowed (AGENTS.md)"
    if any("hookspath" in value.lower() for name, value in inv.env.items() if name.upper().startswith("GIT_CONFIG")):
        return "overriding core.hooksPath through the environment skips the hooks (AGENTS.md)"
    if "core.hookspath" in inv.config:
        return "overriding core.hooksPath skips the hooks (AGENTS.md)"
    if any(_guarded_key(key) for key in inv.config):  # `-c include.path=...`
        return next(_guarded_key(key) for key in inv.config if _guarded_key(key))
    for key in inv.config:
        if key in IDENTITY_KEYS:
            return f"-c {key} overrides the identity on the command line; commits are made as {OWNER_NAME} <{OWNER_EMAIL}> from the config Daniel set (AGENTS.md)"
    pull_rebase = sub == "pull" and any(re.fullmatch(r"-[a-zA-Z]*r[a-zA-Z]*", f) for f in flags)
    if sub == "rebase" or pull_rebase or any(a == "--rebase" or (a.startswith("--rebase=") and a != "--rebase=false") for a in args):
        return "rebase rewrites history and is never allowed (AGENTS.md)"
    if sub in ("filter-branch", "filter-repo", "replay"):
        return f"git {sub} rewrites history and is never allowed (AGENTS.md)"
    if sub not in GIT_SUBCOMMANDS:
        return f"git {sub} is not a git command the guard knows (an alias, an external command or a name built at run time): run the git command itself (AGENTS.md)"
    if sub == "reset" and "--hard" in args:
        return "reset --hard is never allowed (AGENTS.md)"

    if sub == "push":
        return _push_problem(inv, git)

    if sub == "commit" and "--amend" in args:
        pushed = _pushed(git)
        if pushed is None or pushed:
            return "commit --amend on a commit that is already on a remote rewrites history (AGENTS.md)"

    if sub == "config":
        return _config_problem(inv)

    if sub == "remote":
        action = (inv.positional() or [""])[0]
        if action in REMOTE_CHANGING:
            return f"git remote {action} changes where the work is sent and is not allowed (AGENTS.md)"
        return None

    if sub == "branch" and any(flag in BRANCH_REMOVING_FLAGS for flag in flags):
        names = {_ref_name(arg) for arg in inv.positional()}
        if names & set(PROTECTED_BRANCHES):  # `-m` takes a branch here, not a message: positional(), not positional_and_refs()
            return f"{sorted(names & set(PROTECTED_BRANCHES))[0]!r} is the release branch: it is not deleted or renamed (AGENTS.md)"
        if WORKING_BRANCH in names:
            return "'dev' cannot be deleted or renamed (AGENTS.md)"

    if sub == "tag":
        positional = inv.positional()
        if any(flag in ("-d", "--delete", "-f", "--force", "-a", "-s", "-m") for flag in flags):
            return "tags are frozen: creating, moving or deleting a tag is not allowed (AGENTS.md)"
        listing = bool({"-l", "--list", "--contains", "--no-contains", "--points-at", "--merged", "--no-merged"} & set(flags))
        if positional and not listing:  # `git tag v9` creates one; `git tag -l 'v1*'` lists with a pattern
            return "tags are frozen: creating, moving or deleting a tag is not allowed (AGENTS.md)"
        if flags and not set(flags) <= TAG_LISTING_FLAGS:
            return "tags are frozen (AGENTS.md)"
        return None

    if sub in COMMITTING:
        problem = _identity_problem(inv, git)
        if problem:
            return problem

    if sub in READ_ONLY:
        return None

    if _is_main_sync(inv, git):
        return None

    # a mutating subcommand: it must not name main, master or a tag (a commit names no ref: its message is text)
    tags = _tag_names(git)
    for arg in (positional_and_refs(inv) if sub != "commit" else []):
        if _is_protected(arg):
            return f"{arg!r} is the release branch: only the owner touches it (AGENTS.md)"
        if arg in tags or arg.startswith(("refs/tags/", "tags/")):
            return f"{arg!r} is a tag: tags are frozen (AGENTS.md)"
    if sub in COMMITTING | {"pull", "cherry-pick", "revert", "am", "reset", "commit", "merge"}:
        try:
            branch = git("branch", "--show-current")
        except Exception:  # noqa: BLE001 - the branch of the target checkout cannot be read: fail closed
            return "the current branch of the target checkout cannot be read, so the commit is not allowed (AGENTS.md)"
        if not branch:
            return f"HEAD is detached in the target checkout: git {sub} runs on a named branch, dev (AGENTS.md)"
        if _is_protected(branch):
            return f"the current branch is {branch!r}: nothing is committed or merged there (AGENTS.md)"
    return None


def _guarded_key(key: str) -> str | None:
    """Why a config key is not written by an agent, or None. Section and key names ignore case; `includeIf.<cond>.path` too."""

    key = key.lower()
    if key == "core.hookspath":
        return "core.hooksPath is not changed (AGENTS.md)"
    if key == "include.path" or (key.startswith("includeif.") and key.endswith(".path")):
        return "an include.path can bring in a file that sets core.hooksPath: it is not changed (AGENTS.md)"
    return None


CONFIG_WRITE = (
    "agents never write git config (Daniel changes it by hand): this `git config` is not a read the guard knows. Reads pass: "
    "`git config get <key>`, `git config --get <key>`, `git config --list` (AGENTS.md)"
)


def _config_problem(inv: Invocation) -> str | None:
    """
    `git config` passes only when it is a read, in either syntax: a read verb (`get`, `list`) or a read action (`--get`,
    `--get-all`, `--get-regexp`, `--list`, ...) or the legacy `git config <key>`, with every other option an exact name from
    CONFIG_READ_OPTIONS. Any other spelling, an abbreviation included (`--remove-s`, `--unset-a`), is blocked as a write.
    """

    names = [flag.partition("=")[0] for flag in inv.flags()]
    if any(name not in CONFIG_READ_ACTIONS | CONFIG_READ_OPTIONS for name in names):
        return CONFIG_WRITE
    positional = inv.positional(CONFIG_VALUE_OPTIONS)
    verb = positional[0] if positional else ""
    if verb in CONFIG_READ_VERBS:
        return None
    if verb not in CONFIG_VERBS and (CONFIG_READ_ACTIONS & set(names) or len(positional) <= 1):
        return None  # `git config --get core.hooksPath`, `git config core.hooksPath`: the documented check
    return CONFIG_WRITE


def _is_main_sync(inv: Invocation, git: GitRunner) -> bool:
    """The fast-forward sync of main into dev (AGENTS.md): it reads main and moves only dev, and only forward."""

    if _current_branch(git) != WORKING_BRANCH or inv.flags() != ["--ff-only"]:
        return False
    if inv.sub == "pull":
        return inv.positional() == ["origin", "main"]
    if inv.sub == "merge":
        return inv.positional() == ["origin/main"]
    return False


# The subcommands whose `-m`, `-c`, `-C`, `-F` take a message, a commit or a file; for the others they take a ref.
MESSAGE_SUBCOMMANDS = {"commit", "merge", "revert", "cherry-pick", "am", "tag", "stash", "notes"}
VALUE_OPTIONS = {"-m", "--message", "-F", "--file", "-C", "-c", "--author", "--date", "--reuse-message"}


def positional_and_refs(inv: Invocation) -> list[str]:
    """Every argument that could be a ref, including the two sides of `a..b`, `a...b` and `a:b` (not the value of -m and the like)."""

    found: list[str] = []
    skip = False
    for arg in inv.args:
        if skip:
            skip = False
            continue
        # `-c` and `-m` name a branch for switch, checkout, branch, reset; `-am` ends with the option that takes the message
        if inv.sub in MESSAGE_SUBCOMMANDS and (arg in VALUE_OPTIONS or re.fullmatch(r"-[a-zA-Z]*[mFCc]", arg)):
            skip = True
            continue
        if arg.startswith("-") and arg != "-":
            continue
        for piece in re.split(r"\.\.\.?|:", arg):
            if piece:
                found.append(piece)
    return found


# --- gh and the GitHub REST API -------------------------------------------

# family -> the verbs that only read; None means the family takes no verb. A family or verb that is not here is blocked,
# so a new `gh` command stays blocked until it is added with a test.
READ_ONLY_GH: dict[str, set[str] | None] = {
    "api": None,  # GET only: see _gh_api_problem
    "status": None,
    "search": None,
    "help": None,
    "version": None,
    "run": {"list", "view", "watch", "download"},
    "pr": {"view", "list", "diff", "checks", "status", "create"},  # create: the agent opens the PR dev -> main; never merge
    "issue": {"view", "list", "status"},
    "repo": {"view", "list"},
    "workflow": {"list", "view"},
    "auth": {"status"},
    "cache": {"list"},
}
# the flags that go before the verb and take a value (`gh pr -R owner/repo view`); the value is not a word of the command
GH_VALUE_FLAGS = {"-R", "--repo", "--hostname"}
GITHUB_API = re.compile(r"(?:api|uploads)\.github\.com", re.IGNORECASE)
CREDENTIAL = re.compile(r"authorization|bearer|\bgh[pousr]_[A-Za-z0-9]|github_pat_", re.IGNORECASE)
# `user:password@` or `token@` right before the host of the GitHub API (`https://user:pw@api.github.com/...`, or without the
# scheme): curl and the like send it as basic-auth credentials, so it is a credential whether or not an option says so.
USERINFO = re.compile(r"[^/\s]+@(?:api|uploads)\.github\.com", re.IGNORECASE)
WRITING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
# curl takes any unambiguous prefix of a long option, so `--req` and `--dat` count
CURL_LONG_WRITING = ("--request", "--data", "--data-raw", "--data-binary", "--data-ascii", "--data-urlencode", "--json", "--form",
                     "--form-string", "--upload-file", "--user", "--oauth2-bearer", "--aws-sigv4", "--digest", "--negotiate")
CURL_VALUE_SHORT = set("oHAewmbcKxEyYzrQUCPD")  # short options that take a value; the rest of a cluster is that value
POWERSHELL_WRITING = ("method", "custommethod", "body", "infile", "form", "authentication", "token", "credential", "usedefaultcredentials")
WEB_REQUEST_PROGRAMS = {"curl", "wget", "invoke-restmethod", "irm", "invoke-webrequest", "iwr", "http", "https", "xh"}


def _gh_api_problem(args: list[str]) -> str | None:
    method, sends_data = None, False
    index = 0
    while index < len(args):
        arg = args[index]
        if arg == "--input" or arg.startswith("--input="):
            return "gh api --input sends a body and is not allowed (AGENTS.md)"
        if arg == "--method":
            method = (args[index + 1] if index + 1 < len(args) else "").upper()
            index += 1
        elif arg.startswith("--method="):
            method = arg.split("=", 1)[1].upper()
        elif arg.startswith("--field=") or arg.startswith("--raw-field="):
            sends_data = True
        elif arg in ("--field", "--raw-field"):
            sends_data = True
            index += 1
        elif arg.startswith("-") and not arg.startswith("--") and len(arg) > 1:
            # a cluster of short flags is read the way pflag reads it: `-iX DELETE` is `-i -X DELETE`; a flag that takes a
            # value ends the cluster (the rest of it, or the next argument, is that value)
            cluster = arg[1:]
            for position, flag in enumerate(cluster):
                attached = cluster[position + 1 :]
                if flag == "X":
                    method = (attached or (args[index + 1] if index + 1 < len(args) else "")).lstrip("=").upper()
                    index += 0 if attached else 1
                    break
                if flag in "fF":
                    sends_data = True
                    index += 0 if attached else 1
                    break
                if flag in "HqtEp":  # --header, --jq, --template, ... take a value
                    index += 0 if attached else 1
                    break
        index += 1
    if any(arg.lstrip("/").lower() == "graphql" for arg in args if not arg.startswith("-")):
        return "gh api graphql is a POST and can carry a mutation: it is not allowed (AGENTS.md)"
    effective = method or ("POST" if sends_data else "GET")
    if effective != "GET":
        return f"gh api with the {effective} method writes to GitHub and is not allowed (AGENTS.md)"
    return None


def _is_show_token(flag: str) -> bool:
    """
    Whether a word is the option that makes `gh auth status` print the token, in any spelling.

    The option is judged by its name, after normalizing: the `=value` part is dropped whatever the value is (`=true`,
    `=True`, `=1`, `=false`, `=garbage`: a boolean flag accepts `=value`, and a value the guard does not know is no reason to
    let the option through), the name is compared without case and with `_` read as `-`, and the short form `-t` is found
    in a cluster of short flags (`-th`, `-ht`, `-t=true`).
    """

    if not flag.startswith("-") or flag == "-":
        return False
    name = flag.partition("=")[0]
    if name.startswith("--"):
        return name[2:].lower().replace("_", "-") == "show-token"
    return "t" in name[1:].lower()


def _gh_problem(tokens: list[str]) -> str | None:
    rest = tokens[1:]
    words, skip = [], False
    for token in rest:  # the family and the verb are the first two words that are not a flag or the value of one
        if skip:
            skip = False
        elif token in GH_VALUE_FLAGS:
            skip = True
        elif not token.startswith("-"):
            words.append(token)
    if not words:
        if set(rest) <= {"--help", "-h", "--version"}:
            return None
        return "gh with only flags is not on the list of read-only commands (AGENTS.md)"
    family = words[0]
    if family not in READ_ONLY_GH:
        return f"gh {family} is not on the list of read-only commands (AGENTS.md)"
    if family == "api":
        return _gh_api_problem(rest[rest.index("api") + 1 :])
    if family == "auth" and any(_is_show_token(flag) for flag in rest):
        return "gh auth status --show-token prints the token and is not allowed (AGENTS.md)"
    verbs = READ_ONLY_GH[family]
    if verbs is not None and (len(words) < 2 or words[1] not in verbs):
        return f"gh {family} {words[1] if len(words) > 1 else '(no verb)'} writes or is not on the list of read-only commands (AGENTS.md)"
    return None


NON_GET = "a non-GET request to the GitHub API is not allowed (AGENTS.md)"
BODY = "a request to the GitHub API with a body or credentials is not allowed (AGENTS.md)"
CREDENTIALS = "a request to the GitHub API with credentials is not allowed (AGENTS.md)"


def _curl_problem(args: list[str]) -> str | None:
    index = 0
    while index < len(args):
        arg = args[index]
        if arg.startswith("--"):
            name, equals, value = arg.partition("=")
            matches = [option for option in CURL_LONG_WRITING if len(name) >= 4 and option.startswith(name)]
            if "--request" in matches and len(matches) == 1:
                value = value if equals else (args[index + 1] if index + 1 < len(args) else "")
                if value.upper() != "GET":
                    return NON_GET
            elif matches:
                return BODY
        elif arg.startswith("-") and len(arg) > 1:
            cluster = arg[1:]
            for position, flag in enumerate(cluster):
                if flag == "X":
                    value = cluster[position + 1 :] or (args[index + 1] if index + 1 < len(args) else "")
                    if value.lstrip("=").upper() != "GET":
                        return NON_GET
                    break
                if flag in "dFTu":
                    return BODY
                if flag in CURL_VALUE_SHORT:
                    break
        index += 1
    return None


def _wget_problem(args: list[str]) -> str | None:
    for arg in args:
        name = arg.split("=", 1)[0].lower()
        if name.startswith("--") and len(name) >= 4:
            if any(option.startswith(name) for option in ("--method", "--post-data", "--post-file", "--body-data", "--body-file")):
                return NON_GET
            if any(option.startswith(name) for option in ("--http-user", "--user", "--password", "--http-password")):
                return BODY
    return None


def _powershell_web_problem(args: list[str], shortest: int = 1) -> str | None:
    """PowerShell takes any unambiguous prefix of a parameter name, so `-Meth`, `-Bo` and `-Cred` count; `shortest` is the fewest letters of one."""

    lowered = [arg.lower() for arg in args]
    for index, arg in enumerate(lowered):
        if len(arg) < shortest + 1 or not arg.startswith("-") or arg.startswith("--"):
            continue
        name, colon, given = arg[1:].partition(":")
        for parameter in POWERSHELL_WRITING:
            if parameter.startswith(name):
                if parameter in ("method", "custommethod"):
                    given = given if colon else (lowered[index + 1] if index + 1 < len(lowered) else "")
                    if given.strip("'\"") == "get":
                        break
                return NON_GET
    return None


def _github_request_problem(tokens: list[str], command: str) -> str | None:
    """A request from curl, wget, Invoke-RestMethod and the like to the GitHub API that is not a plain read."""

    if not GITHUB_API.search(command):
        return None
    program, args = program_name(tokens[0]), tokens[1:]
    if any(CREDENTIAL.search(arg) or USERINFO.search(arg) for arg in args):
        return CREDENTIALS
    if program in ("curl", "wget"):
        # in Windows PowerShell 5.1 `curl` and `wget` are Invoke-WebRequest, whose parameters read like PowerShell's
        # (a one-letter flag is curl's: `-m 10` is a timeout, and PowerShell would call it ambiguous)
        return (_curl_problem(args) if program == "curl" else _wget_problem(args)) or _powershell_web_problem(args, shortest=2)
    if program in ("invoke-restmethod", "irm", "invoke-webrequest", "iwr"):
        return _powershell_web_problem(args)
    if any(arg in WRITING_METHODS for arg in args):  # httpie: `http DELETE api.github.com/...`
        return NON_GET
    return None


# --- git behind a wrapper ----------------------------------------------------------------------------------------

# Words that only pass the command along: `env git push`, `& git push`, `{ git push }`, `time git push`.
TRANSPARENT = {
    "env", "command", "exec", "nohup", "time", "sudo", "builtin", "nice", "&", "{", "}", "(", ")", "!", "then", "do", "else",
    "if", "elif", "while", "until",
}
# Programs that run the command after their own arguments (`timeout 5 git push`, `env -u X git push`): when the guard cannot
# reach the git or gh behind them, it blocks the line.
RUNNERS = {
    "env", "sudo", "doas", "nice", "time", "timeout", "stdbuf", "ionice", "taskset", "chrt", "unbuffer", "nohup", "flock",
    "script", "chronic", "exec", "command", "builtin",
}
MENTIONS_GIT = re.compile(r"(?<![A-Za-z0-9_])(?:git|gh)(?![A-Za-z0-9_])|(?:api|uploads)\.github\.com", re.IGNORECASE)  # git, gh or the GitHub API
POSIX_SHELLS = {"bash", "sh", "zsh", "dash", "ksh", "fish", "csh", "tcsh", "busybox", "wsl"}
POWERSHELLS = {"powershell", "pwsh", "powershell_ise"}
# program -> the flags that make its next argument code (`-c`, `-e`); a script file or `-m module` is not a string it reads
INTERPRETER_CODE_FLAGS = {
    "python": {"-c"}, "python3": {"-c"}, "py": {"-c"}, "pypy": {"-c"}, "pypy3": {"-c"},
    "node": {"-e", "--eval", "-p", "--print"}, "nodejs": {"-e", "--eval", "-p", "--print"}, "bun": {"-e", "--eval", "-p", "--print"},
    "deno": {"eval"}, "perl": {"-e", "-E"}, "ruby": {"-e"}, "php": {"-r"},
}
# Programs that run what they are given whatever the flags: any mention of git in them is a wrapper.
ALWAYS_WRAPPERS = {
    "eval", "iex", "invoke-expression", "invoke-command", "icm", "start-process", "saps", "start-job", "sajb",
    "foreach-object", "foreach", "%", "where-object", "xargs", "ssh", "wsl", "watch", "trap",
}
# Programs that read commands from stdin when they get no script (`echo "git push" | bash`, `bash <<EOF`)
STDIN_INTERPRETERS = POSIX_SHELLS | POWERSHELLS | {"cmd"} | set(INTERPRETER_CODE_FLAGS)


def _strip_prefixes(tokens: list[str]) -> list[str]:
    """The command a segment runs, after the words that only pass it along and a PowerShell `$result =`."""

    index = 0
    while index < len(tokens):
        token = tokens[index].lower()
        previous = tokens[index - 1].lower() if index else ""
        if token in TRANSPARENT or (token.startswith("-") and previous in ("env", "sudo", "nice", "time")):
            index += 1
        elif token.startswith("$") and tokens[index + 1 : index + 2] in (["="], ["+="]):  # `$out = git push ...`
            index += 2
        elif len(token) > 1 and token[0] in "({" and token.lstrip("({"):  # `(git status)`, `{git push}`
            tokens = [*tokens[:index], tokens[index].lstrip("({"), *tokens[index + 1 :]]
        else:
            break
    rest = tokens[index:]
    while rest and rest[-1] in (")", "}"):
        rest = rest[:-1]
    if len(rest) > 1 and rest[-1].endswith((")", "}")) and index < len(tokens):
        rest[-1] = rest[-1].rstrip(")}") or rest[-1]
    return rest


def _wrapper_problem(tokens: list[str], command: str) -> str | None:
    """A program that carries a string the parser cannot read, with git in it; or a program name built at run time."""

    rest = _strip_prefixes(tokens)
    while rest and re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*=.*", rest[0]):
        rest = rest[1:]
    if not rest:
        return None
    program, args = program_name(rest[0]), rest[1:]
    flags = [arg.lower() for arg in args]
    # a substitution in the arguments (`bash -c "$(...)"`) carries whatever it prints: git, if the line mentions git anywhere
    carries_git = any(MENTIONS_GIT.search(arg) for arg in args) or (
        any(SUBSTITUTION in arg for arg in args) and bool(MENTIONS_GIT.search(command))
    )
    wrapped = None
    if program in POSIX_SHELLS and carries_git and any(re.fullmatch(r"-[a-z]*c[a-z]*", flag) for flag in flags):
        wrapped = f"{program} -c"
    elif program == "cmd" and carries_git and any(flag in ("/c", "/k", "/r") for flag in flags):
        wrapped = "cmd /c"
    elif program in POWERSHELLS:
        if any(re.fullmatch(r"-e(c|nc|ncodedcommand)?", flag) for flag in flags):
            return f"{program} -EncodedCommand hides the command from the guard (AGENTS.md)"
        if carries_git and "-file" not in flags:
            wrapped = f"{program} -Command"
    elif program in INTERPRETER_CODE_FLAGS and carries_git and set(flags) & INTERPRETER_CODE_FLAGS[program]:
        wrapped = f"{program} {sorted(set(flags) & INTERPRETER_CODE_FLAGS[program])[0]}"
    elif program in ALWAYS_WRAPPERS and carries_git:
        wrapped = program
    elif program == "find" and carries_git and set(flags) & {"-exec", "-execdir", "-ok", "-okdir"}:
        wrapped = "find -exec"
    if wrapped:
        return f"git or gh inside {wrapped} cannot be read by the guard: run it directly (AGENTS.md)"
    if re.search(r"^\$|\$\(|`", rest[0]) and rest[1:2] != ["="] and MENTIONS_GIT.search(command):
        return "a command word built at run time next to git cannot be read by the guard: run git directly (AGENTS.md)"
    return None


# --- fail closed: a git write whose checkout and branch the guard cannot be sure of ---------------------------------------

# Commands that change the directory, the environment or what a name runs, for the rest of the line
STATE_PROGRAMS = {
    "cd", "chdir", "set-location", "sl", "pushd", "push-location", "popd", "pop-location", "export", "declare", "typeset",
    "unset", "setx", "source", ".", "alias", "unalias", "function", "set-alias", "sal", "new-alias", "nal", "shopt", "local",
    "readonly", "hash", "enable",
}
# PowerShell item commands change the environment, an alias or a function when they name one of these drives
ITEM_PROGRAMS = {
    "set-item", "si", "new-item", "ni", "remove-item", "ri", "del", "erase", "rm", "clear-item", "cli", "copy-item", "cp",
    "copy", "move-item", "mv", "move", "rename-item", "rni",
}
STATE_DRIVES = ("env:", "alias:", "function:")
ENVIRONMENT_ASSIGNMENT = re.compile(r"\$\{?env:[A-Za-z_][A-Za-z0-9_]*\}?\s*[+]?=(?!=)|\[(?:system\.)?environment\]::setenvironmentvariable", re.IGNORECASE)
ASSIGNMENT = re.compile(r"([A-Za-z_][A-Za-z0-9_]*)=.*")


def _changes_state(tokens: list[str]) -> bool:
    """Whether a segment changes the directory, the environment, an alias or a function for the commands after it."""

    rest = _strip_prefixes(tokens)
    if not rest:
        return False
    program = program_name(rest[0])
    if program in STATE_PROGRAMS:
        return True
    if program in ITEM_PROGRAMS and any(arg.lower().lstrip("-").startswith(STATE_DRIVES) for arg in rest[1:]):
        return True
    if rest[0].lower().startswith(("$env:", "${env:", "[environment]::", "[system.environment]::")):
        return True
    # `GIT_DIR=x` or `HOME=x` on its own line: an exported name passes the new value to every later command
    assignments = [ASSIGNMENT.fullmatch(token) for token in rest]
    return all(assignments) and any(match.group(1).isupper() for match in assignments if match)


def _is_write(inv: Invocation) -> bool:
    """Whether a git command can create, move or delete a commit, a ref or a tag (or is a subcommand the guard does not know)."""

    if inv.sub in READ_ONLY:
        return False  # `git config` writes are blocked on their own, wherever they run
    names = {flag.partition("=")[0] for flag in inv.flags()}
    if inv.sub == "branch":
        return not (names <= BRANCH_LISTING_FLAGS and (not inv.positional() or names & BRANCH_LISTING_MARKERS))
    if inv.sub == "tag":
        listing = {"-l", "--list", "--contains", "--no-contains", "--points-at", "--merged", "--no-merged"}
        return not (names <= TAG_LISTING_FLAGS and (not inv.positional() or names & listing))
    return True


def _write_problem(inv: Invocation) -> str | None:
    """What a git write may not carry: an unknown environment variable or `-c` key, or a ref built at run time."""

    for name in inv.env:
        if name not in WRITE_ENV_ALLOWED:
            return f"{name}=... can change what git {inv.sub} reads, and the guard cannot follow it: run it without (AGENTS.md)"
    for key in inv.config:
        if not key.startswith(WRITE_CONFIG_ALLOWED):
            return f"git -c {key} on a git {inv.sub} can change what it does, and the guard cannot follow it: run it without (AGENTS.md)"
    for arg in positional_and_refs(inv):
        if re.search(r"[$`]|%[A-Za-z_][A-Za-z0-9_]*%", arg):
            return f"{arg!r} is built at run time: the guard cannot tell which ref git {inv.sub} acts on. Use the literal name (AGENTS.md)"
    return None


UNCLEAR = (
    "the guard cannot follow this command line (a quote, bracket, substitution or here-document left open, or a here-document "
    "whose body the shell expands): run git as a plain command (AGENTS.md)"
)


def _hidden_problem(tokens: list[str], command_tokens: list[str], command: str) -> str | None:
    """git or gh the parser cannot reach: behind a runner's own arguments, or sent to a shell's stdin."""

    words = [program_name(token) for token in tokens]
    program = program_name(command_tokens[0])
    if program not in ("git", "gh") and any(word in ("git", "gh") for word in words[1:]):
        first = next(index for index, word in enumerate(words) if word in ("git", "gh"))
        runner = next((word for word in words[:first] if word in RUNNERS), None)
        if runner:
            return f"git or gh behind {runner} cannot be read by the guard: run it directly (AGENTS.md)"
    if program in STDIN_INTERPRETERS and MENTIONS_GIT.search(command):
        args = command_tokens[1:]
        if "-" in args or not [arg for arg in args if not arg.startswith(("-", "/"))]:
            return f"{program} reads its commands from stdin here, and git in them cannot be read by the guard: run git directly (AGENTS.md)"
    return None


def _segment_problem(tokens: list[str], nested: bool, unclear: str | None, command: str, git: GitRunner) -> str | None:
    """The reason one simple command is blocked, or None. `unclear` says why a git write on this line has no certain target."""

    if _changes_state(tokens):
        return None  # the change itself is allowed; it makes the git writes on the line uncertain (`unclear`)
    wrapped = _wrapper_problem(tokens, command)
    if wrapped:
        return wrapped
    command_tokens = _strip_prefixes(tokens)
    while command_tokens and ASSIGNMENT.fullmatch(command_tokens[0]):
        command_tokens = command_tokens[1:]
    if command_tokens:
        program = program_name(command_tokens[0])
        problem = (
            _gh_problem(command_tokens)
            if program == "gh"
            else _github_request_problem(command_tokens, command)
            if program in WEB_REQUEST_PROGRAMS
            else None
        ) or _hidden_problem(tokens, command_tokens, command)
        if problem:
            return problem
    inv = Invocation(_strip_prefixes(tokens))
    if not inv.is_git or not inv.sub:
        return None
    writes = _is_write(inv)
    if writes and not inv.location_known:
        return "the guard cannot tell which checkout this git command runs in (a path built at run time): run it with a literal path (AGENTS.md)"
    scoped = git if not inv.location else (lambda *args, _location=inv.location: git(*_location, *args))
    problem = _problem(inv, scoped)
    if problem or not writes:
        return problem
    where = "inside a command substitution" if nested else unclear
    if where:
        return (
            f"the guard cannot tell which checkout and branch this git {inv.sub} acts on ({where}): run it as a plain command "
            "of its own, with `git -C <literal path>` for another checkout (AGENTS.md)"
        )
    return _write_problem(inv)


def decide(command: str, git: GitRunner = run_git) -> str | None:
    """
    None if the command may run, else the reason it is blocked.

    The rules are checked on every simple command of the line, the ones inside substitutions included. A git write (commit,
    merge, push, pull, tag, branch -d, reset, an unknown subcommand, ...) then passes only when its checkout and branch are
    certain: it is not inside a substitution, the line has no pipe, subshell or block, and nothing on the line changes the
    directory, the environment, an alias or a function. The checkout is the session's `cwd`, plus the command's own literal
    `-C`, `--git-dir`, `--work-tree`, `GIT_DIR` and `GIT_WORK_TREE`.
    """

    top = shape(command)
    shapes: list[tuple[Shape, bool]] = [(top, False)]
    for found, _ in shapes:  # grows while it runs: each substitution, and the substitutions inside it
        shapes.extend((shape(text), True) for text in found.substitutions)
    mentions_git = bool(MENTIONS_GIT.search(command))
    if mentions_git and any(found.unbalanced or found.opaque for found, _ in shapes):
        return UNCLEAR
    parts: list[tuple[list[str], bool]] = []
    for found, nested in shapes:
        # split twice: as the shell runs the line, and again at every bracket, so git at the start of a block
        # (`if ($x) { git push }`) is read as a command too
        for punctuation in (";&|", ";&|(){}"):
            for tokens in _split(found.text, punctuation):
                if (tokens, nested) not in parts:
                    parts.append((tokens, nested))
    texts = " ".join(found.text for found, _ in shapes)
    moved = any(_changes_state(tokens) for tokens, _ in parts) or bool(ENVIRONMENT_ASSIGNMENT.search(texts))
    unclear = (
        "in a pipeline" if top.pipe
        else "inside a subshell or a block" if top.group
        else "after a cd, popd, alias or environment change on the same line" if moved
        else None
    )
    for tokens, nested in parts:
        problem = _segment_problem(tokens, nested, unclear, command, git)
        if problem:
            return problem
    return None


def main() -> int:
    try:
        event = json.load(sys.stdin)
    except (ValueError, OSError):
        return 0
    command = (event.get("tool_input") or {}).get("command") if isinstance(event, dict) else None
    if not isinstance(command, str):
        return 0
    # Claude Code gives the session's working directory as `cwd`; the hook process itself may run elsewhere, so every
    # lookup (branch, config, tags) is made in that directory.
    cwd = event.get("cwd")
    git = (lambda *args: run_git("-C", cwd, *args)) if isinstance(cwd, str) and cwd else run_git
    reason = decide(command, git)
    if reason:
        print(f"Blocked by .claude/hooks/git_guard.py: {reason}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
