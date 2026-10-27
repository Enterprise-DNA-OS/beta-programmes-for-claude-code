# Beta Programmes for Claude Code

This is a beta programme operator's desk. The business name and report styling live in brand.json. Ask the operator for their programme and rules before writing real records. The demo contains fictional data.

## One route per job

| Job | Command recipe |
|---|---|
| help | /help |
| programmes | /programmes |
| participants | /participants |
| activities | /activities |
| show | /show |
| show feedback | /show-feedback |
| show participant | /show-participant |
| update participant | /update-participant |
| renew agreement | /renew-agreement |
| beta week | /beta-week |
| cohort readiness | /cohort-readiness |
| activity chase | /activity-chase |
| feedback triage | /feedback-triage |
| retest queue | /retest-queue |
| exit review | /exit-review |
| attention | /attention |
| compliance | /compliance |
| insights | /insights |
| history | /history |
| add programme | /add-programme |
| add participant | /add-participant |
| enrol | /enrol |
| add activity | /add-activity |
| assign | /assign |
| complete | /complete |
| add | /add |
| triage | /triage |
| duplicate | /duplicate |
| fix | /fix |
| request retest | /request-retest |
| record retest | /record-retest |
| resolve | /resolve |
| withdraw | /withdraw |
| log | /log |
| record decision | /record-decision |
| import | /import |
| export | /export |
| weekly review | /weekly-review |
| draft test plan | /draft-test-plan |
| draft exit brief | /draft-exit-brief |
| Change a field or rule | /customise |
| Add a read-only report | /new-view |

## Working rules

Read the CLI before answering. Use show, show-feedback and show-participant for full details. Use case-insensitive names or codes; ambiguous matches exit with a candidate list. Every CLI command supports --json.

Read before writing. Actor labels record responsibility; they do not authenticate a person. This is a single-organisation tool for trusted internal operators. No shared public access is configured.

Never send messages, invite participants, distribute builds or release software. Draft to drafts/. Never delete a record without explicit authorisation. Never invent agreement acceptance, privacy notices, test results or decision rationale.

The database is the record. CSV imports require the operator's column map and stable source namespace. Never assume imported status means tested, approved or ready. Preserve source data and use the import preview first. A changed source row aborts for reconciliation.

The exit decision is a dated snapshot. It is not permission to deploy and is not automatically current after new feedback. See docs/compliance.md for the local gate and privacy record checks. Do not claim that this tool certifies a legal obligation or product safety.

Keep real data, source exports and reports out of git. Use npm test for isolated temporary data. Never seed a working database. Schema changes go into the next numbered migration and are tested before application.

## Files

- scripts/beta.mjs: one CLI.
- supabase/migrations: numbered Postgres and PGlite migrations.
- scripts/lib: shared database, CSV and document helpers from the rebuild template.
- views.json and documents.json: read-only report definitions.
- .claude/commands: the same recipes for Claude Code, Codex, OpenCode and Cursor.

Built and run by Enterprise DNA through Omni by Enterprise DNA.

