"""Tests for the versioned git hooks in .githooks/ (pre-commit, pre-merge-commit, commit-msg, pre-push).

Real git in throwaway repositories under pytest's tmp_path. The hooks are copied into each repository's own `.git/hooks`
(the default hooks directory), so the tests never change `core.hooksPath` anywhere. Global and system config are turned
off, so the owner's machine settings do not leak in. The identity is given through the environment.

The cases come from Unit A's review (docs/runs/2026-11-23-A-codex-review.md): findings 3 (an automatic merge commit
skipped the branch gate) and 6 (the hooks were not executable in the index).
"""

from __future__ import annotations

import importlib.util
import os
from pathlib import Path
import shutil
import stat
import subprocess

import pytest

REPO = Path(__file__).resolve().parents[2]
HOOKS = REPO / ".githooks"
HOOK_NAMES = ("pre-commit", "pre-merge-commit", "commit-msg", "pre-push")

spec = importlib.util.spec_from_file_location("git_guard", Path(__file__).resolve().parent / "git_guard.py")
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)
OWNER_NAME, OWNER_EMAIL = guard.OWNER_NAME, guard.OWNER_EMAIL


def environment(name=OWNER_NAME, email=OWNER_EMAIL, committer_name=None):
    env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
    env.update(
        GIT_CONFIG_GLOBAL=os.devnull,
        GIT_CONFIG_NOSYSTEM="1",
        GIT_AUTHOR_NAME=name,
        GIT_AUTHOR_EMAIL=email,
        GIT_COMMITTER_NAME=committer_name or name,
        GIT_COMMITTER_EMAIL=email,
    )
    return env


def git(repo, *args, env=None, check=True):
    return subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True, env=env or environment(), check=check)


def commit(repo, name, message="feat: add a file", **env):
    (repo / name).write_text(name, encoding="utf-8")
    git(repo, "add", name)
    return git(repo, "commit", "-q", "-m", message, "-m", "Body line.", env=environment(**env) if env else None, check=False)


@pytest.fixture
def repo(tmp_path):
    """A repository with a commit on main and dev one commit ahead on a side branch, made before the hooks are installed."""

    path = tmp_path / "repo"
    git(tmp_path, "init", "-q", "-b", "main", str(path))
    commit(path, "base.txt")
    git(path, "branch", "dev")
    git(path, "switch", "-q", "-c", "topic")
    commit(path, "topic.txt")
    git(path, "switch", "-q", "main")
    commit(path, "main-only.txt")  # main and topic diverge, so merging topic needs a merge commit
    for source in HOOKS.iterdir():
        shutil.copy(source, path / ".git" / "hooks" / source.name)
    return path


def head(repo):
    return git(repo, "rev-parse", "HEAD").stdout.strip()


# Finding 3: an automatic merge commit runs pre-merge-commit, not pre-commit.
def test_an_automatic_merge_commit_on_main_is_blocked(repo):
    before = head(repo)

    result = git(repo, "merge", "--no-ff", "--no-edit", "topic", check=False)  # Codex's case

    assert result.returncode != 0, result.stdout + result.stderr
    assert "main" in result.stderr
    assert head(repo) == before


def test_an_automatic_merge_commit_with_another_name_is_blocked_on_dev(repo):
    git(repo, "switch", "-q", "dev")
    git(repo, "merge", "-q", "--ff-only", "main")
    before = head(repo)

    result = git(repo, "merge", "--no-ff", "--no-edit", "topic", env=environment(committer_name="Someone Else"), check=False)

    assert result.returncode != 0 and "Someone Else" in result.stderr, result.stderr
    assert head(repo) == before


def test_a_merge_commit_by_the_owner_on_dev_passes(repo):
    git(repo, "switch", "-q", "dev")

    result = git(repo, "merge", "--no-ff", "--no-edit", "topic", check=False)

    assert result.returncode == 0, result.stderr
    assert git(repo, "log", "-1", "--format=%P").stdout.count(" ") == 1  # two parents: a real merge commit


def test_the_documented_fast_forward_sync_still_works(repo):
    git(repo, "switch", "-q", "dev")

    result = git(repo, "merge", "--ff-only", "main", check=False)  # what `git pull --ff-only origin main` does locally

    assert result.returncode == 0, result.stderr
    assert head(repo) == git(repo, "rev-parse", "main").stdout.strip()


def test_commit_msg_checks_the_name_and_the_branch_too(repo):
    git(repo, "switch", "-q", "dev")
    msg = repo / "MSG"
    msg.write_text("feat: add a thing\n\nBody line.\n", encoding="utf-8")
    hook = repo / ".git" / "hooks" / "commit-msg"

    run = lambda env: subprocess.run(["sh", str(hook), str(msg)], cwd=repo, capture_output=True, text=True, env=env)  # noqa: E731

    assert run(environment()).returncode == 0
    assert run(environment(name="Someone Else")).returncode != 0
    git(repo, "switch", "-q", "main")
    assert run(environment()).returncode != 0


def test_a_plain_commit_on_main_is_still_blocked_and_on_dev_passes(repo):
    assert commit(repo, "x.txt").returncode != 0
    git(repo, "switch", "-q", "dev")
    assert commit(repo, "y.txt").returncode == 0


# The fed-input layer of the run report (layer 1), kept as tests so it runs again after every hook change.
@pytest.mark.parametrize(
    "message,passes",
    [
        ("feat: add the backlog file\n\nBody line.", True),
        ("ci(workflow): pin the runner\n\nBody line.", True),
        ("docs: note the reviewers\n\nCodex reviews, Claude Code writes, Antigravity runs QA.", True),
        ("fix: regenerate the sitemap\n\nThe sitemap is generated by the build script.", True),
        ("Merge branch 'main' into dev", True),
        ("feat: x\n\nBody.\n\nCo-Authored-By: Claude <noreply@anthropic.com>", False),
        ("feat: x\n\nBody.\n\nco-authored-by: A Person <a@example.com>", False),
        ("feat: x\n\nBody.\n\n\U0001f916 Generated with [Claude Code](https://claude.com/claude-code)", False),
        ("feat: x\n\nBody.\n\nGenerated with Copilot", False),
        ("feat: x\n\nBody.\n\nClaude-Session: abc", False),
        ("feat: x\n\nBody.\n\nCodex-Session: abc", False),
        ("feat: x\n\nBody.\n\nAssisted-by: GPT-5", False),
        ("feat: x\n\nBody.\n\nSigned-off-by: Claude <claude@example.com>", False),
        ("feat: x\n\nWritten with help from noreply@openai.com.", False),
        ("Feat: Add things\n\nBody.", False),
        ("update: add things\n\nBody.", False),
        ("fix: correct the header.\n\nBody.", False),
        ("fix: no body", False),
        ("docs: record unit A ci result\n\nBody.", False),  # the capital A of this unit's own report commit
    ],
)
def test_commit_msg_accepts_and_rejects_messages_as_the_report_lists(repo, message, passes):
    git(repo, "switch", "-q", "dev")
    msg = repo / "MSG"
    msg.write_text(message + "\n", encoding="utf-8")
    result = subprocess.run(["sh", str(repo / ".git" / "hooks" / "commit-msg"), str(msg)], cwd=repo, capture_output=True,
                            text=True, env=environment())

    assert (result.returncode == 0) == passes, (message, result.stderr)


ZERO = "0" * 40


@pytest.mark.parametrize(
    "line,passes",
    [
        ("refs/heads/dev {new} refs/heads/dev {old}", True),  # fast-forward
        ("refs/heads/dev {new} refs/heads/dev {new}", True),
        ("refs/heads/experiment/spike {new} refs/heads/experiment/spike " + ZERO, True),
        ("", True),
        ("refs/heads/dev {new} refs/heads/main {old}", False),
        ("HEAD {new} refs/heads/main " + ZERO, False),
        ("refs/heads/dev {new} refs/heads/master {old}", False),
        ("refs/heads/dev {old} refs/heads/dev {new}", False),  # non-fast-forward: a force push
        ("refs/heads/dev {new} refs/heads/dev " + "1" * 40, False),  # a remote tip unknown locally
        ("(delete) " + ZERO + " refs/heads/dev {old}", False),
        ("(delete) " + ZERO + " refs/heads/experiment/spike {old}", False),
        ("refs/tags/v1.0.0 {new} refs/tags/v1.0.0 " + ZERO, False),
        ("(delete) " + ZERO + " refs/tags/v1.0.0 {old}", False),
        ("refs/heads/feature/x {new} refs/heads/feature/x " + ZERO, False),
        ("refs/heads/dev {new} refs/heads/dev {old}\nrefs/heads/dev {new} refs/heads/main {old}", False),
    ],
)
def test_pre_push_accepts_and_rejects_refs_as_the_report_lists(repo, line, passes):
    git(repo, "switch", "-q", "dev")
    commit(repo, "ahead.txt")
    new, old = head(repo), git(repo, "rev-parse", "HEAD~1").stdout.strip()
    stdin = line.format(new=new, old=old) + "\n" if line else ""
    # bytes, as git sends them: in text mode Python on Windows would turn each \n into \r\n
    result = subprocess.run(["sh", str(repo / ".git" / "hooks" / "pre-push"), "origin", "https://example.invalid/r.git"],
                            cwd=repo, input=stdin.encode(), capture_output=True, env=environment())

    assert (result.returncode == 0) == passes, (line, result.stderr.decode(errors="replace"))


def test_pre_commit_rejects_each_foreign_identity_field(repo):
    git(repo, "switch", "-q", "dev")
    hook = repo / ".git" / "hooks" / "pre-commit"
    for env in (environment(email="someone@example.com"), environment(name="Someone Else"),
                environment(committer_name="Someone Else"), environment(name="Claude", email="noreply@anthropic.com")):
        assert subprocess.run(["sh", str(hook)], cwd=repo, capture_output=True, env=env).returncode != 0
    assert subprocess.run(["sh", str(hook)], cwd=repo, capture_output=True, env=environment()).returncode == 0


# Finding 6: git on POSIX ignores a hook that is not executable.
def test_every_hook_is_executable_in_the_index():
    staged = subprocess.run(["git", "-C", str(REPO), "ls-files", "-s", "--", ".githooks"], capture_output=True, text=True, check=True).stdout
    modes = {line.split("\t")[1].removeprefix(".githooks/"): line.split()[0] for line in staged.splitlines()}

    for name in HOOK_NAMES:
        assert modes.get(name) == "100755", (name, modes)


@pytest.mark.skipif(os.name == "nt", reason="Windows has no executable bit; this runs on a POSIX machine")
def test_a_fresh_posix_clone_checks_the_hooks_out_executable(tmp_path):
    clone = tmp_path / "clone"
    subprocess.run(["git", "clone", "-q", str(REPO), str(clone)], check=True, env=environment())

    for name in HOOK_NAMES:
        assert os.stat(clone / ".githooks" / name).st_mode & stat.S_IXUSR, name
