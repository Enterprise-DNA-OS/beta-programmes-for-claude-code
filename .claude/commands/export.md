---
description: export for the beta programme desk
---

Read CLAUDE.md first. Export to a new file in a private directory. This contains all raw source records and is not a redacted participant report.

Run:

```bash
node scripts/beta.mjs export --out=<new.json>
```

Replace placeholders with the authorised values. Add --json when another step needs structured output. If a name is ambiguous, show the candidates and ask which one. Report the result and any blocked checks in plain language. Writes require an actor label; it is an audit label, not authentication. Draft files stay in drafts/. Never send, invite, distribute a build, delete data or publish anything.

