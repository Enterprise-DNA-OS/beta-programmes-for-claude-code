---
description: retest queue for the beta programme desk
---

Read CLAUDE.md first. Find overdue and failed retests for the current fix build. Old-build evidence cannot close a new fix.

Run:

```bash
node scripts/beta.mjs retest-queue 
```

Replace placeholders with the authorised values. Add --json when another step needs structured output. If a name is ambiguous, show the candidates and ask which one. Report the result and any blocked checks in plain language. Writes require an actor label; it is an audit label, not authentication. Draft files stay in drafts/. Never send, invite, distribute a build, delete data or publish anything.

