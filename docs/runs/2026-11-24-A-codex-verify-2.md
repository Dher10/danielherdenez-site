# FAIL

- Scope — Verified `1e248ca` at the tip of `dev` after reading the previous FAIL and the round 2 notes. Checked guard decisions with sample inputs. No commits, pushes, or GitHub requests were made.
- Abbreviated config write — Blocked by the existing regression for `git config --remove-s core`.
- Bash pipeline — Blocked by the existing regression for the previous wrong-checkout pipeline, with `main` and `dev` supplied as the starting branch.
- Branch certainty — Failed. With an in-memory Git runner, the guard allowed creation of a scratch branch when the branch lookup failed and when HEAD was detached. The commit control blocked in both cases. The code checks the current branch for selected subcommands, leaving some commands classified as writes outside that check.
- Config writes, `hooksPath` overrides, pushes to `main`, and merges outside the allowed workflow — Existing denial samples passed. Reviewed the decision logic and tested the branch-certainty invariant with harmless inputs. No new bypass was developed or exercised.
- Add, commit, and push chain — Accepted the existing `git add -A && git commit … && git push origin dev` sample.
- Heredoc messages — Accepted the existing Bash samples for `-m`, `-am`, and `-F -` with quoted heredocs.
- Fast-forward sync — Accepted the existing `git pull --ff-only origin main` and `git merge --ff-only origin/main` samples on `dev`.
- PR creation — Accepted the existing `gh pr create --base main --head dev` samples.
- Explicit checkout — Accepted the existing literal `git -C ../work commit` sample when the target was modeled as `dev`.
- Test totals — Targeted guard run passed all 157 tests. The broader guard-only run had 757 passes and eight setup errors caused by Windows denying pytest access to its temporary directories.
