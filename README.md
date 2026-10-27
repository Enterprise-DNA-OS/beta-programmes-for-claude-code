# Beta Programmes for Claude Code

Own the evidence behind your next beta exit decision. A database for participant readiness, weekly activities, feedback triage and fix verification, built by Enterprise DNA. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free, MIT. Run the database and command recipes. | Your tester fields, exit rules, Centercode mapping and agreed connections. A web front end or different stack if wanted. | Installed, connected and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |

[Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_campaign=centercode)

## What the desk does

A product operator checks participant eligibility, assigns activities, records outcomes, triages feedback, requests retests and records an exit decision. A fixed issue cannot close without the latest completed retest passing on the current build and no pending retests on that build. Cross-programme links are rejected. A go decision requires participants, activities, no unassigned activities, no unfinished assignments, no ineligible participants, no open high or critical issues and no unclosed fixes. Those are local rules you can change through /customise.

[Centercode's current pricing page](https://www.centercode.com/pricing) asks buyers to talk to sales. It publishes no numeric paid-plan price, checked 27 October 2026. Compare your quote with the records and workflows you actually need. This free desk handles the internal beta work. Participant collection screens, build distribution, automated invitations and external issue-tracker connections are work to scope for your version. It does not reproduce Centercode's hosted service.

## Quick start

Node 20 or newer. No database server needed for the embedded demo.

```bash
npm install
npm run demo
node scripts/beta.mjs cohort-readiness
node scripts/beta.mjs feedback-triage
node scripts/beta.mjs insights --since=2026-01-01 --until=2026-12-31 --json
npm run view
npm run docs
npm test
```

The demo uses fictional people and relative dates with deliberately overdue work. Use a fresh DATA_DIR and npm run migrate without seeding for your own records, or set DATABASE_URL to a dedicated Postgres database. Read [verification](docs/verification.md) for tested environments. One local process uses an embedded database at a time. Use a secured Postgres service for concurrent operators.

## Commands

- `help`
- `programmes`
- `participants`
- `activities`
- `show`: `<programme>`
- `show-feedback`: `<feedback>`
- `show-participant`: `<participant>`
- `update-participant`: `<participant> --notice= --retain-until= --note= --actor=`
- `renew-agreement`: `<programme> --participant= --agreement= --evidence= --accepted= --actor=`
- `beta-week`
- `cohort-readiness`
- `activity-chase`
- `feedback-triage`
- `retest-queue`
- `exit-review`
- `attention`
- `compliance`
- `insights`: `[--since=YYYY-MM-DD --until=YYYY-MM-DD]`
- `history`: `<programme>`
- `add-programme`: `--code= --name= --owner= --objective= --ends= --agreement= --actor=`
- `add-participant`: `--code= --name= --segment= --platform= --notice= --retain-until= --actor=`
- `enrol`: `<programme> --participant= --agreement= --evidence= --accepted= --actor=`
- `add-activity`: `<programme> --code= --name= --instructions= --due= --actor=`
- `assign`: `<activity> --participant= --actor=`
- `complete`: `<assignment-id> --outcome=completed|blocked --note= --actor=`
- `add`: `<programme> --code= --title= --description= --kind=issue|idea|praise --severity=critical|high|medium|low [--participant=] --actor=`
- `triage`: `<feedback> --owner= --severity= --note= --actor=`
- `duplicate`: `<feedback> --of= --note= --actor=`
- `fix`: `<feedback> --build= --note= --actor=`
- `request-retest`: `<feedback> --tester= --due= --actor=`
- `record-retest`: `<retest-id> --outcome=passed|failed --evidence= --date= --actor=`
- `resolve`: `<feedback> --note= --actor=`
- `withdraw`: `<participant> --note= --actor=`
- `log`: `<programme> --note= --actor=`
- `record-decision`: `<programme> --decision=hold|go --rationale= --actor=`
- `import`: `centercode <csv> --programme= --source= --map= --actor= [--dry-run]`
- `export`: `--out=<new.json>`
- `weekly-review`
- `draft-test-plan`: `<programme>`
- `draft-exit-brief`: `<programme>`

Prefix each with node scripts/beta.mjs. All support --json. Forty CLI commands, forty matching recipes, plus /customise and /new-view.

## Bring your feedback history

Centercode supports CSV exports for each feedback type. Its columns are configurable. Save each form's export, inspect its headers, and create the column map once. The example is synthetic, not an asserted universal Centercode format.

```bash
node scripts/beta.mjs import centercode examples/centercode-feedback.csv --programme=BETA-1 --source=demo-account/issues --map=examples/feedback-map.json --actor=Operator --dry-run
node scripts/beta.mjs import centercode examples/centercode-feedback.csv --programme=BETA-1 --source=demo-account/issues --map=examples/feedback-map.json --actor=Operator
node scripts/beta.mjs export --out=exports/beta.json
```

One command loads one configured feedback export. All rows apply together or none do. Stable source ids prevent duplicates on a repeat run. Changed rows stop the batch for reconciliation. Raw columns remain attached to each feedback record. Imported feedback starts new and without a participant link, irrespective of its source status. Reconcile every form and count before switching. [Mapping and boundaries](docs/replace-centercode.md).

## Ten questions to ask

Centercode's own reporting guide describes a limit when combining projects, a feedback dimension and a date window, with an export as a workaround. The first two questions do that over imported data. The others combine this desk's own evidence. They are not a claim that the vendor can never answer a similar question.

1. Which programmes have high severity issues reported in this date window?
2. Which tester platforms produced those unresolved issues?
3. Which participants have overdue activities and no recent activity?
4. Which fixes are waiting on an overdue retest?
5. Which current fixes failed their latest retest?
6. Which programmes have participants whose agreement or privacy records need attention?
7. Which unresolved issues still have no owner?
8. Which programmes have finished activities but still have release blockers?
9. Which programmes are ready for an exit decision under our recorded rules?
10. Which feedback is marked as duplicate and what original does it refer to?

The insights command answers all ten. The date window applies to the first two; the remaining questions show current operational state.

## Your first hour: ten things to ask for

1. Put our name, logo and colours in brand.json.
2. Add our beta programme and its current agreement version.
3. Record the participant aliases we need, with notice references and retention review dates.
4. Enrol them with evidence of actual agreement acceptance.
5. Create this week's activities and assign eligible participants.
6. Preview a Centercode feedback export with our column names.
7. Reconcile its rows and preserve a private copy of the source export.
8. Triage open issues and request retests for fixed builds.
9. Read the exit review and record a reasoned decision.
10. Add our own exit criterion through /customise.

## Documents and read-only views

The week, cohort and feedback views show the current evidence. npm run docs renders a test plan, triage brief and exit review for every programme. All use brand.json and escape record text. /draft-test-plan and /draft-exit-brief write private Markdown drafts. Nothing sends or releases software.

## Boundaries

This is an internal operator desk for one organisation. It has no participant login, mobile or offline capture, live collection forms, public portal, attachments store, build hosting or live integrations. Those features need separate delivery. Read [why no front end](docs/why-no-front-end.md).

Privacy checks identify missing notices and overdue retention reviews. They do not decide legal compliance or erase personal data. Withdrawn participants remain visible, cannot receive new work and hold the default exit gate for operator review. Agreements are evidence references, not digital signatures. Retest tester names are recorded labels, not verified identities.

Row access is closed to public roles. A database owner can bypass it. Secure credentials, backups and any hosted access before shared use. Exports include source records and other private fields. Generated files use restrictive permissions where supported; Windows also needs suitable folder permissions. The JSON export covers ten domain relations, but is not a tested restore tool. Use native database backups for recovery.

MIT. Built by Enterprise DNA.

