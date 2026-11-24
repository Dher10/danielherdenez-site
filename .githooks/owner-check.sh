# owner-check.sh: the branch and identity check shared by pre-commit, pre-merge-commit and commit-msg.
# Not a hook (git runs only files named after a hook); each of those hooks sources it and calls owner_check <hook name>.
#   1. No commit on main or master: work happens on dev; main changes only through a merged PR.
#   2. Author and committer must be the owner, name and email.
# A merge commit made by `git merge` runs pre-merge-commit, not pre-commit (githooks(5)), so all three hooks call this.

OWNER_NAME="Daniel Herdenez"
OWNER_EMAIL="edherdenez@gmail.com"

owner_check() {
  HOOK_NAME="$1"

  BRANCH=$(git symbolic-ref --quiet --short HEAD 2>/dev/null)
  case "$BRANCH" in
    main|master)
      echo "$HOOK_NAME: blocked. Commits are never made on '$BRANCH'. Switch to dev." >&2
      return 1
      ;;
  esac

  AUTHOR_IDENT=$(git var GIT_AUTHOR_IDENT) || return 1
  COMMITTER_IDENT=$(git var GIT_COMMITTER_IDENT) || return 1
  AUTHOR_NAME=$(printf '%s\n' "$AUTHOR_IDENT" | sed -E 's/^(.*) <[^>]*>.*$/\1/')
  AUTHOR_EMAIL=$(printf '%s\n' "$AUTHOR_IDENT" | sed -E 's/^.*<([^>]*)>.*$/\1/')
  COMMITTER_NAME=$(printf '%s\n' "$COMMITTER_IDENT" | sed -E 's/^(.*) <[^>]*>.*$/\1/')
  COMMITTER_EMAIL=$(printf '%s\n' "$COMMITTER_IDENT" | sed -E 's/^.*<([^>]*)>.*$/\1/')

  if [ "$AUTHOR_EMAIL" != "$OWNER_EMAIL" ] || [ "$COMMITTER_EMAIL" != "$OWNER_EMAIL" ] \
    || [ "$AUTHOR_NAME" != "$OWNER_NAME" ] || [ "$COMMITTER_NAME" != "$OWNER_NAME" ]; then
    echo "$HOOK_NAME: blocked. Author and committer must be $OWNER_NAME <$OWNER_EMAIL>." >&2
    echo "  author:    $AUTHOR_NAME <$AUTHOR_EMAIL>" >&2
    echo "  committer: $COMMITTER_NAME <$COMMITTER_EMAIL>" >&2
    return 1
  fi
  return 0
}
