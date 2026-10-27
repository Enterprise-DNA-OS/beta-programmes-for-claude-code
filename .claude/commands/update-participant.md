---
description: update participant for the beta programme desk
---

Read CLAUDE.md first. Read show-participant first. Only extend the retention review date when the operator provides a continuing lawful purpose. Record that purpose in the note.

Run:

```bash
node scripts/beta.mjs update-participant <participant> --notice= --retain-until= --note= --actor=
```

Replace placeholders with the authorised values. Add --json when another step needs structured output. If a name is ambiguous, show the candidates and ask which one. Report the result and any blocked checks in plain language. Writes require an actor label; it is an audit label, not authentication. Draft files stay in drafts/. Never send, invite, distribute a build, delete data or publish anything.

