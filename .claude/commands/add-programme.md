---
description: add programme for the beta programme desk
---

Read CLAUDE.md first. Read the relevant programme, participant or feedback record first. Use the operator's supplied facts and preserve the recorded evidence.

Run:

```bash
node scripts/beta.mjs add-programme --code= --name= --owner= --objective= --ends= --agreement= --actor=
```

Replace placeholders with the authorised values. Add --json when another step needs structured output. If a name is ambiguous, show the candidates and ask which one. Report the result and any blocked checks in plain language. Writes require an actor label; it is an audit label, not authentication. Draft files stay in drafts/. Never send, invite, distribute a build, delete data or publish anything.

