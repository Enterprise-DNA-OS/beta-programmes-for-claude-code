# Verification

The smoke suite uses a new temporary data directory, a fresh schema and fictional seed records. It runs every CLI command and removes only its own temporary directory. For server testing, BETA_TEST_DATABASE_URL must point to a new dedicated database. The suite refuses an existing programmes relation.

The suite checks migration and seed repeatability, date validation, ambiguous-name failure, transactional CSV rollback, repeated imports, raw source retention, cross-programme restrictions, participant eligibility, build-specific retest closure, immutable decision snapshots, denied public-role access, JSON output, escaped HTML, three dashboards and three document types.

Local execution: Node 22 on Linux with PGlite. Windows and server Postgres results are recorded after the GitHub verification workflow runs. The Windows job uses Node 22 and the same smoke suite. The server job uses a disposable Postgres 17 service and the same suite. No live customer database is accessed.

npm run demo, npm run view and npm run docs are checked on fictional data. The generated reports are inspected in a headless browser. Reports and source exports stay outside git.
