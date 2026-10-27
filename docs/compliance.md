# Privacy evidence and beta decision rules

Checked 27 October 2026. These checks support an operator's review. They do not establish that an organisation meets every privacy obligation, that an agreement is enforceable or that a product is safe to release.

| Check | Rule source | What the desk checks |
|---|---|---|
| NZ-IPP3 | [NZ Privacy Commissioner, Principle 3](https://www.privacy.org.nz/privacy-principles/3/) | A participant has a reference to the collection notice. The operator must check its actual content and delivery. |
| NZ-IPP9 | [NZ Privacy Commissioner, Principle 9](https://www.privacy.org.nz/privacy-principles/9/) | The operator-set retention review date has not passed. There is no universal statutory number of days in this rule. |
| Storage | [NZ Privacy Commissioner, Principle 5](https://www.privacy.org.nz/privacy-principles/5/) | Default public database access is denied and output files are private where supported. This is an implementation measure, not a legal sufficiency assessment. |
| LOCAL-AGREEMENT | Programme policy, not legislation | Acceptance evidence and date match the current agreement version, the notice is recorded, the retention review is current and the participant has not withdrawn. |
| LOCAL-EXIT | Programme policy, not legislation | Participants and activities exist. Every activity is assigned. Assignments are completed. No ineligible participants, open high/critical issues or fixed-but-unclosed reports remain. |

Use participant aliases where they suffice. Do not put real participant contact details in demo data or git. The NZ notice check addresses direct collection only. Indirect collection and other jurisdictions require the operator's own review and configuration; this is not a complete implementation of all privacy principles.

A passed retention date creates a review finding. The programme operator must decide whether a continuing lawful purpose exists or whether data needs deletion or anonymisation. update-participant records an authorised review. It is not permission to keep records indefinitely. Withdrawal records a participation stop; it does not delete source exports, reports, audit notes or backups. The default exit gate holds withdrawn enrolments for review. Changing that policy requires an explicit /customise change.

The desk stores reference strings for notices, agreements and evidence. It does not fetch, validate or sign those documents. In particular, an accepted_on value and an actor label are not proof of identity. For shared operation, provision authenticated access separately, limit database roles and use secured backups. Owner credentials bypass row restrictions by design. No public API policies are supplied.

Fix verification uses the latest completed retest for the current build and requires all pending retests on that build to finish. A changed build makes older results unusable for closing the issue. A go decision stores the current counts as an immutable dated snapshot. Later data changes can change readiness. No decision sends invitations, distributes software or deploys a release.

The 14-day quiet-participant threshold is a local operating policy. Activity deadlines and retention review dates come from the operator. They are not statutory deadlines. Customise them through a migration and verify the resulting reports.
