---
description: renew agreement for the beta programme desk
---

Read CLAUDE.md first. Read the participant and programme. Record only actual acceptance evidence for the current agreement. Do not infer agreement from an old record.

Run:

```bash
node scripts/beta.mjs renew-agreement <programme> --participant= --agreement= --evidence= --accepted= --actor=
```

Replace placeholders with the authorised values. Add --json when another step needs structured output. If a name is ambiguous, show the candidates and ask which one. Report the result and any blocked checks in plain language. Writes require an actor label; it is an audit label, not authentication. Draft files stay in drafts/. Never send, invite, distribute a build, delete data or publish anything.

