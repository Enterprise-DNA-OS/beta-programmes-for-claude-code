---
description: record decision for the beta programme desk
---

Read CLAUDE.md first. Run show and exit-review first. Record the operator's decision and rationale. The go decision checks current evidence but never releases software.

Run:

```bash
node scripts/beta.mjs record-decision <programme> --decision=hold|go --rationale= --actor=
```

Replace placeholders with the authorised values. Add --json when another step needs structured output. If a name is ambiguous, show the candidates and ask which one. Report the result and any blocked checks in plain language. Writes require an actor label; it is an audit label, not authentication. Draft files stay in drafts/. Never send, invite, distribute a build, delete data or publish anything.

