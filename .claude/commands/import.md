---
description: import for the beta programme desk
---

Read CLAUDE.md first. Read docs/replace-centercode.md. Verify the account, programme, feedback form and column map. Preview with --dry-run, reconcile row counts, then import the authorised file.

Run:

```bash
node scripts/beta.mjs import centercode <csv> --programme= --source= --map= --actor= [--dry-run]
```

Replace placeholders with the authorised values. Add --json when another step needs structured output. If a name is ambiguous, show the candidates and ask which one. Report the result and any blocked checks in plain language. Writes require an actor label; it is an audit label, not authentication. Draft files stay in drafts/. Never send, invite, distribute a build, delete data or publish anything.

