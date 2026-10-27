# Verification

The smoke suite uses a new temporary data directory, a fresh schema and fictional seed records. It runs every CLI command and removes only its own temporary directory. For server testing, BETA_TEST_DATABASE_URL must point to a new dedicated database. The suite refuses an existing programmes relation.

The suite checks migration and seed repeatability, date validation, ambiguous-name failure, transactional CSV rollback, repeated imports, raw source retention, cross-programme restrictions, participant eligibility, build-specific retest closure, immutable decision snapshots, denied public-role access, JSON output, escaped HTML, three dashboards and three document types.

Local execution: Node 22 on Linux with PGlite. Windows and server Postgres results are recorded after the GitHub verification workflow runs. The Windows job uses Node 22 and the same smoke suite. The server job uses a disposable Postgres 17 service and the same suite. No live customer database is accessed.

npm run demo, npm run view and npm run docs are checked on fictional data. The generated reports are inspected in a headless browser. Reports and source exports stay outside git.

## Results from 27 October 2026

- Linux Node 22.23.4 with PGlite: PASS, all 40 CLI commands and the assertions above.
- Linux Node 22.23.4 with a disposable Postgres 17.10 server: PASS, the same 40-command suite. The server bound to loopback, used fictional test data and was stopped after the test.
- Windows: not executed. GitHub Actions rejected every job before starting a runner because the organisation's account payments or spending limit blocked jobs. [Verification run](https://github.com/Enterprise-DNA-OS/beta-programmes-for-claude-code/actions/runs/40596788334). No test step failed; none ran there. The Windows verification job remains available once the account block is resolved.
- npm run demo, npm run view and npm run docs: PASS. Three dashboard files and six demo documents generated. The week dashboard and exit review were inspected in a headless Chromium browser.
- README and documentation brand lint: PASS. No author placeholders or prohibited prose terms remain.
