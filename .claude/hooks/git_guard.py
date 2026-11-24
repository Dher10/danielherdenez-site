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
  - a commit whose author or committer is not Daniel Herdenez <edherdenez@gmail.com>, and a change of that identity;
  - changing `core.hooksPath` (reading it, `git config --get core.hooksPath`, is allowed), in the current `git config
    set|unset|edit|remove-section` syntax and the legacy one, through `-c` or `--config-env`, or through an `include.path`;
  - a mutating git command in a checkout the guard cannot name (`git -C $x`, `cd $x`, `cd -`, `popd`). The branch, config and
    tags are read in the checkout the command runs in: the session's `cwd` from the hook input, then each `cd`, `-C`,
    `--git-dir`, `--work-tree`, `GIT_DIR` and `GIT_WORK_TREE`;
  - git behind a wrapper that carries a string the parser cannot see into (`bash -c`, `sh -c`, `eval`,
    `powershell`/`pwsh -Command`, `cmd /c`, `python -c`, `node -e`, `Invoke-Expression`, ...) whenever the string
    mentions git, and git behind a program name built at run time (`x=git; $x push ...`). The session runs git
    directly instead, where the rules above can read it.

It also blocks every write through `gh` and to the GitHub API: `gh api` with any method but GET (`-X`/`--method`), with
`-f`, `-F`, `--field`, `--raw-field` unless the method is an explicit GET, with `--input`, or on `graphql`; every `gh`
family or verb that is not on the allowed list (READ_ONLY_GH: `run list/view/watch/download`,
`pr view/list/diff/checks/status/create`, `issue view/list/status`, `repo view/list`, `workflow list/view`, `auth status`,
`cache list`, `api` GET, `status`, `search`), so `gh pr merge` is blocked; `gh auth status` with the token option in any
spelling; and `curl`, `wget`, `Invoke-RestMethod`, `Invoke-WebRequest` (and their aliases) against api.github.com or
uploads.github.com with a non-GET method, a body or credentials. `gh` and the API behind a wrapper are blocked like git.

Git options are read the way git reads them: combined short flags (`-fu`) and unambiguous abbreviations (`--forc`).

What it does not see: a script file or a program that runs git or gh on its own, a function or alias a shell
defines, a gh alias already stored in the owner's gh config, a git alias that runs gh, a request whose URL or method is
built at run time, git or gh inside a PowerShell script block or parentheses, behind a prefix that takes its own
arguments (`timeout 5 gh ...`, `env -u X gh ...`), and any other tool. The git hooks in `.githooks/` and the GitHub
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
CONFIG_WRITING_FLAGS = {"--unset", "--unset-all", "--add", "--replace-all", "-e", "--edit", "--rename-section", "--remove-section"}
CONFIG_READING_FLAGS = {"--get", "--get-all", "--get-regexp", "--get-urlmatch", "-l", "--list", "--get-color", "--get-colorbool"}
CONFIG_VERBS = {"get", "set", "unset", "list", "edit", "rename-section", "remove-section", "get-color", "get-colorbool"}
CONFIG_VALUE_OPTIONS = {"-f", "--file", "--blob", "--type", "--default", "--value", "--url", "--comment"}
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


def strip_heredocs(command: str) -> str:
    """Drop the body of every here-document: it is text for a program (a commit message), not a command."""

    lines, out, terminator = command.split("\n"), [], None
    for line in lines:
        if terminator is not None:
            if line.strip() == terminator or (terminator in ("'@", '"@') and line.startswith(terminator)):
                terminator = None
            continue
        out.append(line)
        match = re.search(r"(?<!<)<<(?!<)-?\s*(['\"]?)([A-Za-z_][A-Za-z0-9_]*)\1", line)
        if match:
            terminator = match.group(2)
        elif re.search(r"@['\"]\s*$", line):  # a PowerShell here-string: `@'` ... `'@`
            terminator = line.rstrip()[-1] + "@"
    return "\n".join(out)


def segments(command: str) -> list[list[str]]:
    """The simple commands of a command line, as token lists (split on ; && || | and newlines, outside quotes)."""

    commands: list[list[str]] = []
    for line in strip_heredocs(command).split("\n"):
        try:
            lexer = shlex.shlex(line, posix=True, punctuation_chars=";&|")
            lexer.whitespace_split = True
            tokens = list(lexer)
        except ValueError:
            tokens = line.split()
        current: list[str] = []
        skip_target = False
        for token in tokens:
            if token and set(token) <= set(";&|"):
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


def _config_value(inv: Invocation, git: GitRunner, key: str, env_name: str | None = None) -> str | None:
    """The value git would use: the command's `-c`, the environment of the command, the process environment, the config."""

    if key in inv.config:
        return inv.config[key]
    if env_name and env_name in inv.env:
        return inv.env[env_name]
    if env_name and os.environ.get(env_name):
        return os.environ[env_name]
    try:
        return git("config", key) or None
    except Exception:  # noqa: BLE001
        return None


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


def _identity_problem(inv: Invocation, git: GitRunner) -> str | None:
    values = {
        "author name": _config_value(inv, git, "user.name", "GIT_AUTHOR_NAME"),
        "author email": _config_value(inv, git, "user.email", "GIT_AUTHOR_EMAIL"),
        "committer name": _config_value(inv, git, "user.name", "GIT_COMMITTER_NAME"),
        "committer email": _config_value(inv, git, "user.email", "GIT_COMMITTER_EMAIL"),
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
    pull_rebase = sub == "pull" and any(re.fullmatch(r"-[a-zA-Z]*r[a-zA-Z]*", f) for f in flags)
    if sub == "rebase" or pull_rebase or any(a == "--rebase" or (a.startswith("--rebase=") and a != "--rebase=false") for a in args):
        return "rebase rewrites history and is never allowed (AGENTS.md)"
    if sub in ("filter-branch", "filter-repo"):
        return f"git {sub} rewrites history and is never allowed (AGENTS.md)"
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


def _config_problem(inv: Invocation) -> str | None:
    """
    `git config` in both syntaxes: the current one, with a verb first (`git config set|unset|get|list|edit|rename-section|
    remove-section ...`), and the legacy one (`git config [--unset|--add|...] <key> [<value>]`). The options that take a value
    (`--file x`, `--type path`, `--comment note`) are skipped, so their value is never read as the key.
    """

    flags = inv.flags()
    positional = inv.positional(CONFIG_VALUE_OPTIONS)
    verb = positional[0] if positional and positional[0] in CONFIG_VERBS else None
    rest = positional[1:] if verb else positional
    if verb == "edit" or {"-e", "--edit"} & set(flags):
        return "git config edit opens the whole file, core.hooksPath and the identity included: it is not allowed (AGENTS.md)"
    if verb in ("rename-section", "remove-section") or {"--rename-section", "--remove-section"} & set(flags):
        section = (rest[0] if rest else "").lower().split(".")[0]
        if section in ("core", "user", "include") or section.startswith("includeif"):
            return f"renaming or removing the [{section}] section changes core.hooksPath or the identity: it is not allowed (AGENTS.md)"
        return None
    unsetting = verb == "unset" or bool({"--unset", "--unset-all"} & set(flags))
    if verb:
        writing = verb in ("set", "unset")
    else:
        reading = bool(CONFIG_READING_FLAGS & set(flags))
        writing = unsetting or bool(CONFIG_WRITING_FLAGS & set(flags)) or (len(rest) >= 2 and not reading)
    if not writing or not rest:
        return None  # `git config core.hooksPath`, `git config get core.hooksPath`: reading it is the documented check
    key = rest[0].lower()
    guarded = _guarded_key(key)
    if guarded:
        return guarded
    if key in ("user.name", "user.email"):
        expected = OWNER_NAME if key == "user.name" else OWNER_EMAIL
        if unsetting or len(rest) < 2 or rest[1] != expected:
            return f"the git identity is {OWNER_NAME} <{OWNER_EMAIL}> and is not changed (AGENTS.md)"
    return None


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
        if arg in VALUE_OPTIONS and inv.sub in MESSAGE_SUBCOMMANDS:  # `-c` and `-m` name a branch for switch, checkout, branch, reset
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
TRANSPARENT = {"env", "command", "exec", "nohup", "time", "sudo", "builtin", "nice", "&", "{", "}", "(", ")", "!", "then", "do", "else"}
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
    "foreach-object", "foreach", "%", "where-object", "xargs", "ssh", "wsl", "watch",
}


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


def _substitutions(tokens: list[str]) -> list[list[str]]:
    """The commands inside `$(...)` and backticks of a segment, quoted or not: the shell runs them, so the guard reads them too."""

    found: list[list[str]] = []
    for index, token in enumerate(tokens):
        for marker, closer in (("$(", ")"), ("`", "`")):
            if marker in token:
                text = " ".join([token.split(marker, 1)[1], *tokens[index + 1 :]]).split(closer)[0]
                found.extend(segments(text))
    return found


def _wrapper_problem(tokens: list[str], command: str) -> str | None:
    """A program that carries a string the parser cannot read, with git in it; or a program name built at run time."""

    rest = _strip_prefixes(tokens)
    while rest and re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*=.*", rest[0]):
        rest = rest[1:]
    if not rest:
        return None
    program, args = program_name(rest[0]), rest[1:]
    flags = [arg.lower() for arg in args]
    carries_git = any(MENTIONS_GIT.search(arg) for arg in args)
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


CHANGING_DIRECTORY = {"cd", "chdir", "set-location", "sl", "pushd", "push-location"}
LEAVING_DIRECTORY = {"popd", "pop-location"}
LOCATION_VALUE_OPTIONS = {"-path", "-literalpath", "-stackname"}


def _directory_change(tokens: list[str]) -> tuple[str | None, bool] | None:
    """
    For `cd dir`, `Set-Location -Path dir`, `pushd dir`: (dir, True), with `~` expanded; (None, False) when the guard cannot
    name the directory (`cd $x`, `cd -`, `popd`). None when the segment does not change directory.
    """

    rest = _strip_prefixes(tokens)
    if not rest:
        return None
    program = program_name(rest[0])
    if program in LEAVING_DIRECTORY:
        return None, False
    if program not in CHANGING_DIRECTORY:
        return None
    targets, skip = [], False
    for arg in rest[1:]:
        if skip:
            targets.append(arg)
            skip = False
        elif arg.lower() in LOCATION_VALUE_OPTIONS:
            skip = True
        elif arg.startswith("-") and arg != "-":
            continue  # `cd -P`, `Set-Location -PassThru`
        else:
            targets.append(arg)
    target = targets[0] if targets else "~"
    if target.startswith("~"):
        target = os.path.expanduser(target)
    return (target, True) if known_path(target) else (None, False)


def decide(command: str, git: GitRunner = run_git) -> str | None:
    """None if the command may run, else the reason it is blocked."""

    directories: list[str] = []  # the `cd`s before this segment, as `-C` options: git composes them the way the shell would
    directories_known = True
    pending = segments(command)
    while pending:
        tokens = pending.pop(0)
        pending.extend(_substitutions(tokens))
        moved = _directory_change(tokens)
        if moved is not None:
            target, known = moved
            if known:
                directories.extend(["-C", target])
            else:
                directories_known = False
            continue
        wrapped = _wrapper_problem(tokens, command)
        if wrapped:
            return wrapped
        command_tokens = _strip_prefixes(tokens)
        while command_tokens and re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*=.*", command_tokens[0]):
            command_tokens = command_tokens[1:]
        if command_tokens:
            program = program_name(command_tokens[0])
            github = (
                _gh_problem(command_tokens)
                if program == "gh"
                else _github_request_problem(command_tokens, command)
                if program in WEB_REQUEST_PROGRAMS
                else None
            )
            if github:
                return github
        inv = Invocation(_strip_prefixes(tokens))
        if not inv.is_git or not inv.sub:
            continue
        if not (directories_known and inv.location_known) and inv.sub not in READ_ONLY:
            return "the guard cannot tell which checkout this git command runs in (a path built at run time, `cd -`, `popd`): run it with a literal path (AGENTS.md)"
        location = [*directories, *inv.location]
        scoped = git if not location else (lambda *args, _location=location: git(*_location, *args))
        problem = _problem(inv, scoped)
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
