---
description: exit review for the beta programme desk
---

Read CLAUDE.md first. Review current blockers. A prior decision is historical and does not authorise release. Check all current records again.

Run:

```bash
node scripts/beta.mjs exit-review 
```

Replace placeholders with the authorised values. Add --json when another step needs structured output. If a name is ambiguous, show the candidates and ask which one. Report the result and any blocked checks in plain language. Writes require an actor label; it is an audit label, not authentication. Draft files stay in drafts/. Never send, invite, distribute a build, delete data or publish anything.

