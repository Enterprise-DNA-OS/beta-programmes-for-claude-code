# Move feedback history from Centercode

This guide covers one feedback form at a time. It does not promise to transfer a complete hosted beta community.

## Export the source

Centercode's [Quick Form Export guide](https://help.centercode.com/en/guide-to-using-quick-form-export) documents CSV and XLSX exports from feedback management. Open the relevant project and Feedback types, choose Export for the form, check the report parameters and save the CSV. Select the complete feedback scope you intend to move. Repeat for every form and programme.

The [feedback management guide](https://help.centercode.com/en/feedback-type-management-overview) describes attached files as a separate ZIP export. Preserve those separately in private storage. This importer does not download attachments or process ZIP or XLSX files. Convert XLSX to UTF-8 CSV before import and compare row counts.

Checked 27 October 2026. Recheck your account's available export permissions and actual headers. Custom form labels differ.

## Prepare the map once

Create the destination programme. Copy examples/feedback-map.json and set each value to the exact header in your export. The supplied CSV is a fictional fixture showing quoted commas and multiline text, not an official universal Centercode sample.

| Map key | Required | Destination |
|---|---|---|
| id | Yes | Stable original ticket id, scoped by programme and source namespace |
| title | Yes | Feedback title |
| description | No | Feedback description, empty if not mapped |
| kind | No | issue, idea or praise, case-insensitive; defaults to issue |
| severity | No | critical, high, medium or low; defaults to medium |
| submitted_on | No | YYYY-MM-DD, no future dates; defaults to import date |

If your source labels differ, make a checked working copy with the supported values before importing and keep the original export privately. Do not guess severity or infer approval. All raw columns in the supplied file are preserved under source_record. A missing mapped column fails. Invalid dates, unsupported values, duplicate ids and malformed rows abort the entire batch.

## Preview, reconcile, import

```bash
node scripts/beta.mjs import centercode imports/issues.csv --programme=BETA-1 --source=account-name/project-name/issues --map=imports/issues-map.json --actor=Operator --dry-run
node scripts/beta.mjs import centercode imports/issues.csv --programme=BETA-1 --source=account-name/project-name/issues --map=imports/issues-map.json --actor=Operator
```

The preview runs the same transaction and rolls it back. Check total rows, added rows and unchanged rows against the exported file. Keep the source namespace stable; changing it creates a separate source and can duplicate history. A different form uses a different namespace even if ticket ids overlap.

Unchanged source rows are skipped. A changed row fails for deliberate reconciliation, so local triage and test evidence cannot be silently overwritten. This is a snapshot import, not ongoing synchronisation. It cannot detect omitted forms or rows. A repeated source with a changed mapping should be reviewed in a fresh test database; it will not remap already imported rows.

## What comes across

Feedback ids, titles, descriptions, supported type and severity values, supplied dates and every original column in the supplied CSV are retained. Source statuses are preserved as raw history only. Every imported feedback record starts new with no owner, no participant link and no approval. Add participant evidence and workflows separately.

Participant profiles, agreement signatures, activity completion, survey answers, votes, discussion threads, attachments and historical test outcomes are not reconstructed from the feedback CSV. Unknown columns remain available as raw source fields. Enterprise DNA maps additional exports and builds any extra importer needed for your version.

## Before ending the subscription

Compare each form's row count, date range, representative descriptions and source ids. Keep the original files and separately exported attachments under your retention policy. Run one weekly review and one full fix/retest cycle alongside the existing process. Confirm how participant intake and build delivery will work in your own setup. Do not cancel access while required records or collection workflows remain there.

[Centercode reporting FAQ](https://help.centercode.com/en/reporting-faq) explains its export path and the projects/dimension/time-window reporting limit. This desk's insights command combines those dimensions over the supplied feedback records; it cannot recover data that was not exported.
