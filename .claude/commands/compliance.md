---
description: compliance for the beta programme desk
---

Read CLAUDE.md first. Explain each missing record using docs/compliance.md. These are evidence checks, not a certification.

Run:

```bash
node scripts/beta.mjs compliance 
```

Replace placeholders with the authorised values. Add --json when another step needs structured output. If a name is ambiguous, show the candidates and ask which one. Report the result and any blocked checks in plain language. Writes require an actor label; it is an audit label, not authentication. Draft files stay in drafts/. Never send, invite, distribute a build, delete data or publish anything.

