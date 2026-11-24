# FAIL — Unit A review

Reviewed on `dev` at `67db0e0`. Scope was `bba0864`, `67db0e0`, and the staged changes to `AGENTS.md` and the Unit A run report. Tests used sample input or a disposable Windows checkout. GitHub requests were read-only.

## Findings

### 1. Major — The guard misses current Git config write syntax

**Location** `.claude/hooks/git_guard.py:355`, `.claude/settings.json:24` and `:49`, `AGENTS.md:46`.

**Evidence (static)** Compare the config branch and both deny lists with Git's current config synopsis. The guard treats the first positional argument as the key and returns allow when the key is unrecognized. Git's current syntax puts a verb before the key. That means the modern forms for setting and unsetting a value fall outside the checks protecting `core.hooksPath`. The older direct spelling and inline `git -c` override have existing passing regression tests. [Git config synopsis](https://git-scm.com/docs/git-config#_synopsis)

**Suggested fix** Parse both current and legacy config forms. For mutations, resolve the verb, scope, and key before applying policy. Test the supported write forms alongside read-only config lookups for both shell tools.

### 2. Major — The guard checks the branch of the hook process instead of the target checkout

**Location** `.claude/hooks/git_guard.py:83`, `:181`, `:240`, `:399`, and `:415`.

**Evidence** Passed a harmless `git -C scratch-checkout status` invocation to the parser. It returned `sub='status'`, empty arguments, and no retained checkout path. Branch and config lookups use bare Git subprocesses in the hook's working directory. The guard can use the wrong branch to decide whether a commit or the documented fast-forward sync is allowed when the target checkout differs.

**Suggested fix** Resolve the effective Git directory, worktree, and command location for every policy lookup. Reject mutations if that context cannot be determined. Test with two disposable checkouts on different branches.

### 3. Major — Native merge commits miss the local branch gate

**Location** `.githooks/pre-commit:10`, `.githooks/commit-msg:16` and `:43`, `AGENTS.md:52`.

**Evidence (static)** Compare the tracked hook list with Git's hook dispatch. An automatic merge commit uses `pre-merge-commit`, which the repository does not ship. Git's sample hook invokes `pre-commit` when installed, but the documented `core.hooksPath` points to `.githooks`. The remaining `commit-msg` hook checks email and attribution, then accepts the merge subject without checking the branch or names. The Claude guard can cover a direct merge it recognizes. Terminal and Codex users rely on the Git hooks for this local check. [Git hook dispatch](https://git-scm.com/docs/githooks#_pre_merge_commit)

**Suggested fix** Share the branch and full identity check with a versioned `pre-merge-commit` hook. Add disposable-repo coverage for automatic merges and confirm that the documented fast-forward sync still works.

### 4. Major — The server rules do not enforce the Daniel-only merge policy

**Location** `AGENTS.md:36` and `:43`, `docs/runs/2026-11-21-A-git-guardrails.md:119`, `.claude/hooks/git_guard.py:37`.

**Evidence** Read ruleset `27921035` through the GitHub API. It has PR, deletion, non-fast-forward, and required-check rules with an empty bypass list. It has no actor restriction on who can update `main` through a passing PR. The guard checks recognized shell invocations and documents gaps for scripts and aliases. The ruleset response establishes branch conditions and merge method, so the Daniel-only workflow still depends on which credentials have merge authority. The review did not exercise a merge or inspect who holds those credentials. [Main ruleset](https://github.com/Dher10/danielherdenez-site/rules/27921035)

**Suggested fix** Verify and enforce separation between Daniel's merge credentials and agent credentials at GitHub. Document Daniel-only merging as a workflow policy wherever actor enforcement depends on permissions outside this ruleset.

### 5. Minor — CI leaves the checkout credential available to later steps

**Location** `.github/workflows/ci.yml:10`, `:23`, and `:30`.

**Evidence (static)** The workflow declares `contents: read` and references no repository secrets. The checkout step leaves `persist-credentials` at its default of `true`. Later steps execute repository and dependency code while authenticated Git access is still available to them. The workflow has no later step that needs it. [Checkout v7 inputs](https://github.com/actions/checkout#usage)

**Suggested fix** Set `persist-credentials: false` in the checkout step. Keep the existing read permission for checkout.

### 6. Minor — The versioned hooks lack executable mode for POSIX checkouts

**Location** `.githooks/pre-commit:1`, `.githooks/commit-msg:1`, `.githooks/pre-push:1`, `AGENTS.md:56`.

**Evidence** `git ls-files --stage --eol -- .githooks` reports `100644` for all three hooks. Git for Windows invoked them successfully in the disposable checkout. Git on POSIX ignores hooks without the executable bit, so the documented one-time setup by itself leaves the hooks inactive there. [Git hook executable requirement](https://git-scm.com/docs/githooks#_description)

**Suggested fix** Record all three hook files as executable in the Git index. Verify that a fresh POSIX checkout runs them using the documented setup.

## Verification

- **Git for Windows 2.56.1.** A fresh disposable checkout with `core.autocrlf=true` had all three hook files at `i/lf w/lf` with `text eol=lf`. Using Git to invoke the scripts, `pre-commit` accepted the expected identity on `dev` and rejected `main` and a foreign author email. `commit-msg` accepted a conventional message with a body and rejected standard `Co-Authored-By`, `Generated with`, and `Claude-Session` samples. `pre-push` accepted a fast-forward to `dev` and creation under `experiment/*`. It rejected `main`, a branch outside the allowlist, a non-fast-forward update, branch deletion, tag creation, and tag deletion. Pre-push records were LF-delimited samples sent to the hook's stdin.
- **Claude guard.** All 572 existing tests passed after running pytest with a dedicated temporary directory and access to Windows temp files. Coverage includes Bash, PowerShell and cmd wrappers, the inline Git config override, environment override samples, `--no-verify`, `gh pr merge`, and GitHub API writes. Additional decision-only checks blocked both requested push refspecs, `dev:main` and `HEAD:refs/heads/main`. The documented sync, PR creation, and read-only ruleset query were allowed. Alias and script resolution remain explicitly out of scope for the current parser. Other parser findings above are from source inspection.
- **CI.** Workflow and job are named `ci`. Pushes to `dev` and pull requests to `main` trigger it. The runner is pinned to `ubuntu-24.04`, and the workflow grants only `contents: read`. The GitHub API confirmed the successful `ci` check for `67db0e0`. Its app is GitHub Actions, ID `15368`, matching the required check's integration. [CI run](https://github.com/Dher10/danielherdenez-site/actions/runs/45193147070)
- **GitHub rulesets.** The list and individual GET requests confirmed that all three rulesets are active with empty bypass lists. `main` requires a PR with zero approvals, allows only merge commits, requires the GitHub Actions `ci` check with strict up-to-date status, and blocks force pushes and deletion. `dev` blocks force pushes and deletion. The tag ruleset covers all tags and blocks updates and deletions. Creation remains permitted by the server, consistent with the requested tag settings. [Main](https://github.com/Dher10/danielherdenez-site/rules/27921035) · [Dev](https://github.com/Dher10/danielherdenez-site/rules/27921117) · [Tags](https://github.com/Dher10/danielherdenez-site/rules/27921286)
