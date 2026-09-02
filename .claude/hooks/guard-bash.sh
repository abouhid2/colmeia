#!/bin/sh
# PreToolUse guard for Bash in the Colmeia repo.
# Reads the hook payload on stdin, blocks a few commands that are hard to undo
# or that violate a rule the owner never wants broken. Exit 2 blocks the call
# and shows the message on stderr to Claude. Any other exit lets it through.
#
# Fails open on purpose: if jq is missing or the payload is unexpected, the
# command runs. A broken guard must not brick the session.

JQ=$(command -v jq || echo /usr/bin/jq)
[ -x "$JQ" ] || exit 0

CMD=$("$JQ" -r '.tool_input.command // ""' 2>/dev/null) || exit 0
[ -n "$CMD" ] || exit 0

block() {
  printf '%s\n' "$1" >&2
  exit 2
}

case "$CMD" in
  *"git push"*"--force"*|*"git push"*" -f "*|*"git push"*" -f")
    block "Blocked: force push. Rewriting published history is not something to do unattended. Ask the owner." ;;
esac

case "$CMD" in
  *"--no-verify"*)
    block "Blocked: --no-verify. The hooks exist to catch what you cannot see. Fix the failure instead." ;;
esac

case "$CMD" in
  *"git commit"*)
    case "$CMD" in
      *Co-Authored-By*|*Co-authored-by*|*"Generated with"*|*"claude.ai/code"*|*"Claude Code"*)
        block "Blocked: AI attribution in a commit message. Colmeia commits never carry Co-Authored-By, 'Generated with', or a session URL. Rewrite the message without it." ;;
    esac ;;
esac

case "$CMD" in
  *"db:reset"*|*"db:drop"*|*"rm -rf /"*)
    block "Blocked: destructive database or filesystem command. Ask the owner first." ;;
esac

exit 0
