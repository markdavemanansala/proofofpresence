# D critical UI review

29 October 2026 · screenshot/document inspection only. Code and live financial source remain frozen.

## Ordinary payout: limited owner-operation presentation

**PASS within this limited scope. This is not a full ordinary-stage or three-role audit PASS.**

The root session explicitly supplied the completed owner-operation sidecar and owner confirmation
image while the three-role audit was still running. The immutable top-level proof remains STOPPED
after the operation sidecar; its cause is unproven. This review does not replace that status,
attribute its cause, or treat the in-progress `ui-d-status-ordinary.json` as completed evidence.

### Exact files inspected

Primary repository root: `/Users/hashmanansala/Documents/ChatGPT/Kleros projects`.

- Sidecar: `artifacts/ui-d/payout-2026-10-29T03-51-39.182Z-3960b430/ui-d-release-payouts.proof.json`.
  SHA256 independently recomputed and matched the supplied expected value:
  `2697495cdc9304e1166c88dc68e9537854e0c6962b5a45e0574be4f7251021f5`.
- Actual capture viewed with `view_image`:
  `artifacts/ui-d/payout-2026-10-29T03-51-39.182Z-3960b430/owner-confirmed.png`.
  SHA256: `fe1102a8db2a9235735e54c87ea84742edfe21cca073474d87a47efcd07c0fd9`.

The image visibly identifies the D fast-test event, owner wallet and confirmed kickback transaction
ending `e4fbd3` at block23740796. The sidecar binds event
`chiado-ui-70688861-87e2-4936-9e2e-bdc9a7c7a5fd-d`, contract
`0x8E1eCFb62465E1b333CBcf30763a2F8aCE2ABb88`, and full transaction
`0x07ff1e1718ffc9aaa7e9bb2c44d6656e8a955d0878ae1d731e0b2f5e89e4fbd3`.
The image is reviewed as its own hashed artifact adjacent to that sidecar; the sidecar does not
itself contain a screenshot hash field.

### Visual findings, checked against the sidecar

Here `D = 1,000,000,000,000wei = 0.000001XDAI`.

| Visible owner UI | Sidecar corroboration | Finding |
| --- | --- | --- |
| Sent `0.000001XDAI`, explained as direct successful attendance payments | Alice balance increases exactlyD; the raw log at index1 carries Alice's indexed address and aD value | Consistent aggregate payment display. This owner image does not independently show Alice's personal payment card. |
| Reserved case shares `0.000001XDAI` | `after.heldBack=D`; Bob case `heldShare=D` | The unresolved share is visibly retained rather than represented as paid. |
| Still owed `0XDAI` | `after.owedTotal=0`; Alice/Bob owed values0 | No failed-transfer debt is conflated with the held share. |
| Bob case `0x8f9cA…2b501`: matched controlled test dispute awaiting final result, reserved shareD, final ruling “Not final,” IDs2/1002 | Same Bob case has state2 and `finalRuling:null` | Unruled and held remain explicit after ordinary payout. |
| “Ordinary batch processed” and follow-up text about remaining cases, owed credits and later top-ups | PhaseFinalized with one pending challenge, heldD and challenge escrow still reserved | No global “all sent” or all-cases-complete claim was observed. |

The image also explains that a finalized phase does not establish that every case or payment is
complete. It distinguishes challenge escrow `0.00000003XDAI` from attendance payments and held
shares, and shows the controlled-test/no-independent-jury disclosure.

Additional read-only sidecar checks: Bob's before/after balance is unchanged; Alice's increasesD.
The three `protectedABC.before[i].financial` objects exactly equal their matching after objects
when compared independently of the block metadata. The sidecar records one UI wallet transaction
and one broadcast. These are corroborating document observations, not a new RPC/chain verification
or a substitute for the primary's source-bound financial evidence.

### Limits and outstanding stages

- No Alice or Bob personal capture was reviewed in this operation-only pass. In particular,
  Bob's personal Sent0 is not established by the owner aggregate SentD card.
- The in-progress ordinary three-role status file and the stopped top-level proof were not parsed
  or reclassified. Their completion/cause requires separate primary evidence and root notification.
- Delivered ruling1 while unsettled, and final settlement/payment to the same Bob, have not been
  reviewed here. Neither is inferred from ordinary payout.
- No UI source edit, deployment, browser/network/RPC interaction, signing, journal/private-key read,
  schedule change or primary-file write was performed. Only this isolated review document changed.

Await root's explicit availability notice before reviewing further captures or stage artifacts.

## Ordinary payout: completed three-role presentation review

**PASS for ordinary-role UI presentation only. Full financial-stage/recovery acceptance remains
separate and is not claimed here.** The root explicitly announced the three-role audit complete;
the earlier top-level financial UI run remains STOPPED/recovery aggregation pending.

### Pointer, proof and capture binding

Read the completed public pointer `artifacts/ui-d-status-ordinary.json`. It reports `passed`, phase
`ordinary`,86HTTP/auth reads,3nonce signatures,0financial signatures,0broadcasts and no failures.
Its referenced file is exactly:

`artifacts/ui-d/status-ordinary-2026-10-29T03-58-30-360Z-2178dda7/proof.json`

Independently computed proof SHA256:
`b9d69a2d4b901a841e6ec345f994927cf3ff06fa6c0dd432300df66f5de06552`.
The proof's status/phase/counts agree with the pointer. **The pointer has no SHA field**, so this
is a recorded digest of the referenced bytes, not a claimed comparison with a pointer-supplied
expected hash. The missing expected-digest field was reported to root.

All six files listed by the proof were opened with `view_image` and inspected. Their common
primary-relative directory is
`artifacts/ui-d/status-ordinary-2026-10-29T03-58-30-360Z-2178dda7/`.

| Actual capture | Independently computed SHA256 |
| --- | --- |
| `alice-spot.png` | `8677edf8ba6b4131b5dbc98df88347608314ca76b67e3008253f06d1b748ae40` |
| `alice-cases.png` | `7a85f7a73de079b6564b81ddb8748660311577af2f1c6a24ab09322f4c3653a0` |
| `bob-spot.png` | `54d475309f8cd855571586faea9942ca7269a8c9d3fa42b5f9d6cd676ef6d81e` |
| `bob-cases.png` | `abe0f254c0f8fd83faaf89f072148f4112c569c3c0cd243131efce62b969d65e` |
| `owner-manage.png` | `d679414977355cf9dd72eeba159236222cd8df930c6d76cb0f61fd3cd2756843` |
| `owner-cases.png` | `d742f7e8bd1fd61f36317718bf2ef46d0c3828bf8d248bb01e587d8c647406eb` |

### Findings from the actual images

- **Alice spot:** authenticated wallet `0x64ef8…Cd38c`; host approval and registration remain
  separate completed steps; financial attendance is confirmed. The payout fact explicitly says
  `0.000001XDAI directly paid` (D), while unused credit is `0XDAI`. “Payment recorded · top-ups may
  follow” avoids claiming all later outcomes complete. Her cases capture shows event SentD,
  reserved case sharesD and owed0, alongside Bob's still-unruled case.
- **Bob spot:** authenticated wallet `0x8f9cA…2b501`; financial attendance remains under challenge.
  The next action and dispute fact say matched controlled test dispute awaiting final result.
  His payout fact says **“No direct payout recorded”**, with a note showing direct attendance
  payments0, principal refunds0 and claims0. Unused credit is0, so neither an unused deposit nor
  an owed claim is presented as his paid attendance share.
- **Bob cases:** his case retains reserved shareD, resolver localID2, arbitrator disputeID1002
  and final ruling **“Not final.”** The matched/unruled wording is explicit. The case is not
  labelled settled and the held share is not labelled delivered.
- **Owner manage:** authenticated owner `0x348800…01cD7`; two people are registered/approved,
  only Alice has an Observed staff check-in. The contract inbox shows Alice's unused credit0
  and Bob's held case shareD. Historical received amounts stay distinct from these balances.
- **Owner cases:** SentD, reservedD, owed0, unused credit0 and challenge escrow0.00000003XDAI
  are separate. “Ordinary batch processed” is accompanied by the explicit warning that Finalized
  does not establish every case/payment complete. Bob remains matched/unruled at IDs2/1002.

All six captures identify the same D event, Chiado10200 and the exact15-minute test profile
`kleros-event-v8-test15m`, VERSION80015. The controlled-test/no-independent-jury notice remains
visible. No global “all sent” or all-cases-complete claim was observed.

**Scope clarity note:** the cases page's SentD card is an **event aggregate in all roles**, including
Bob's cases view. It must not be recorded as Bob's personal Sent0 card. His personal zero payment
is established by the separate `bob-spot.png` payout fact; the event aggregate correctly includes
Alice'sD. More explicit “Event sent” copy could improve clarity in a later authorized UI revision,
but no financial value disagreement was found in these captures and no code was changed.

### Proof corroboration and remaining limits

The proof's canonical payment projection contains one successful `attendance-payout` transfer:
Alice receivesD, transaction `0x07ff1e…e4fbd3`, block23740796/log1. It contains no Bob attendance
payment and no pending-credit withdrawal/claim payment. The summary records AliceD/Bob0,
heldD/owed0, and Bob state2 with final rulingnull; before/after audit snapshots retain those facts.
The role projections identify the correct own wallet with unused/owed0 for each role and owner
permissions only for the owner. These document facts corroborate the viewed UI; no new chain
query or financial verification was performed by this reviewer.

This closes the earlier **role-capture** review gap only. It does not reclassify the stopped
financial-run proof, complete recovery aggregation, establish a delivered ruling or prove final
settlement. Ruled/unsettled and settled same-Bob payment reviews still require root notification
and their own immutable proofs/captures.

## Delivered ruling1, unsettled: three-role presentation review

**PASS for ruled/unsettled role UI presentation only. This is not full financial-stage acceptance,
settlement GO or authorization to submit any transaction.** Root explicitly announced these
captures ready. The ruling operator's final check remains STOPPED, and receipt-only/ABC-interval
supplements are still primary-owned closing work; this screenshot review does not reclassify them.

### Exact proof and captures

Pointer: primary `artifacts/ui-d-status-ruled.json` reports passed/ruled,86HTTP/auth reads,
3nonce signatures,0financial signatures,0broadcasts and no failures. It references:

`artifacts/ui-d/status-ruled-2026-10-29T04-20-57-035Z-219650d8/proof.json`

Independently recomputed SHA256 **matches the expected digest supplied by root**:
`1f287634a61089d7a87e843576f650494f36691e5efa660013452a70c9aa4a7c`.
The pointer and proof agree on phase/status/counts. All six referenced files were opened with
`view_image`, rather than accepting their JSON status alone.

Common primary-relative capture directory:
`artifacts/ui-d/status-ruled-2026-10-29T04-20-57-035Z-219650d8/`.

| Actual capture | Independently computed SHA256 |
| --- | --- |
| `alice-spot.png` | `d4198055d0655cc07acaffc694af156b37835e5cb6ae0b968a9707b927b7497f` |
| `alice-cases.png` | `77b4c47c56b5936696fa3d6f74387f6cf75d5fc317efff5e4889acc1654cb43d` |
| `bob-spot.png` | `f963a3e3419171061161b49a323d8e2b54206077332dd2741b3a245cecb25f62` |
| `bob-cases.png` | `b1f1a194a311e0f500c10010d0ee5bfdb6b5b209b5f140d604519423bcc95597` |
| `owner-manage.png` | `d27f5e31d27083836fbc87c776e1eb763fcec40b2092301c583bc5bba73392d8` |
| `owner-cases.png` | `14485933e3845235a5f213513aede2b0dd8f63a54261e6817a7ee3a86744f20b` |

### Visual findings and corroboration

- **Bob spot:** the next-action heading and attendance-dispute fact now say **“Final result ·
  settlement pending.”** His payout remains **“No direct payout recorded”**; the accompanying
  canonical-payment note shows direct attendance0, principal refunds0 and claims0. Unused credit0
  remains separate. A delivered result has not been presented as Bob's successful payment.
- **Bob cases:** **“Final result available · settlement pending”** is explicit. The explanatory
  line says resolver finality is verified and the event contract still needs a confirmed settlement
  transaction. The case for the same `0x8f9cA…2b501` shows reserved shareD, final ruling
  **“1 · Attended,”** resolver localID2 and arbitrator disputeID1002. The settlement action is
  offered, not represented as already completed.
- **Alice spot/cases:** her personal payout remainsD directly paid, with unused credit0 and no
  personal attendance challenge. Event totals remain SentD/heldD/owed0. Her cases view shows
  the same Bob final1/unsettled case, rather than an extra payment or automatic settlement.
- **Owner manage:** Alice alone remains staff-observed. The informational inbox still separates
  Alice unused credit0 from Bob held shareD; the final resolver result has not erased that reserve.
- **Owner cases:** event SentD (Alice), reserved case shareD (Bob), still owed0, unused credit0 and
  challenge escrow0.00000003XDAI remain distinct. Final1 is shown with settlement pending and
  the ordinary-batch/Finalized limitations remain visible. No all-sent/all-cases-complete claim
  was observed.

All six captures retain the D event, Chiado10200, exact `kleros-event-v8-test15m` profile,
VERSION80015 and controlled-test/no-independent-jury disclosure. The earlier scope note still
applies: SentD on Bob's cases page is the event aggregate; his personal zero is shown in his spot
capture.

The immutable role proof corroborates these viewed distinctions: before/after Bob case state2,
finalRuling1, heldShareD; Alice paidD/Bob paid0; aggregate heldD/owed0; own-wallet unused/owed0.
Its canonical payment projection still contains only Alice's successful attendanceD from the
ordinary transaction and no Bob attendance, credit-withdrawal or claim payment. The role audit's
zero-financial-signature/broadcast count is distinct from the earlier ruling operation.

No new chain/RPC verification of the ruling transaction was performed by this reviewer. The
reported canonical ruling operation at block23741046 and its stopped final operator check remain
primary evidence, not a screenshot-audit PASS. Settlement and same-Bob delivered payment have
not been reviewed or inferred. Await an explicit settled-stage availability notice; no new ruling,
settlement, source, hosting, journal, key or schedule operation was performed here.

## Settled: three-role presentation review

**PASS for settled-role UI presentation only. This does not close the whole financial flow or
authorize a release.** Root explicitly supplied settled captures after the contract message.
The original settlement wrapper remains STOPPED after its passed operation sidecar; primary's
read-only final verification and ABC-interval closure are separate work, not reclassified here.

### Exact proof and captures

Pointer: primary `artifacts/ui-d-status-settled.json` reports passed/settled,86HTTP/auth reads,
3nonce signatures,0financial signatures,0broadcasts and no failures. The referenced immutable file:

`artifacts/ui-d/status-settled-2026-10-29T04-45-26-924Z-973b436d/proof.json`

Independently computed SHA256 **matches root's supplied expected digest**:
`8f74f78ae82cc084917ca7bd5dd9ada1451949eff464e375d8b983080993fd2c`.
Phase/status/counts agree between pointer and proof. All six referenced captures were opened
with `view_image` and inspected.

Common primary-relative capture directory:
`artifacts/ui-d/status-settled-2026-10-29T04-45-26-924Z-973b436d/`.

| Actual capture | Independently computed SHA256 |
| --- | --- |
| `alice-spot.png` | `503d7c3f67483d047adb5b88aa713e89de1b382e22b290a05fea3fd37f30da1a` |
| `alice-cases.png` | `78c8a4dab522327944bd810c27a60eaa406d0fd05f46b4fb9dd511ff27e17492` |
| `bob-spot.png` | `897a8f7604bf84016a3a0d3110cbc298abe5b2d54b341ef2ab8d575ae814d942` |
| `bob-cases.png` | `38a60b6911c8c83cc121f1d95d9c3fdf2b8a68eaa55f66118e6e5f096ec2a0bb` |
| `owner-manage.png` | `ffdc71b9772b926e377e509c9f676d4e3bd04d6070b7205854215ff0164bd8c0` |
| `owner-cases.png` | `93b05862e6d168f28f429edee100fbbce646472e569324d619034eea481f9e1b` |

### Findings from the actual images

- **Same Bob's spot:** wallet `0x8f9cA…2b501` remains selected. The next action and dispute fact
  say **“Challenge settled.”** Financial attendance is included, the payout fact says
  **`0.000001XDAI directly paid` (D)**, and unused credit remains0. Its note identifies direct
  attendanceD, principal refunds0 and claims0. Bob's absent staff check-in stays independently
  labelled; it has not been fabricated from his successful financial challenge.
- **Bob cases:** the same case is labelled **“Challenge settled,”** with final ruling1Attended,
  resolver localID2, arbitrator disputeID1002 and reserved share0. The case copy distinguishes
  event settlement from checking owed credits and delivery records. Event Sent is2D; that remains
  an aggregate, not Bob's personal2D payment.
- **Alice spot/cases:** her personal direct attendance payment remainsD, not a secondD or the
  combined event total. Her own dispute fact remains “No attendance challenge” and unused credit0.
  The event view shows two established attendees and Bob's settled case.
- **Owner manage:** both historical deposit receipts remainD. The informational inbox now shows
  unused credit0 for both wallets, without a held-share badge for Bob. Confirmed financial
  attendance is2 while trusted staff observations remain1; those independent facts were not merged.
- **Owner cases:** Sent is **`0.000002XDAI` (2D)**. Reserved case shares, still owed, challenge
  escrow, unused credit, contract balance and total protected reserves are all independently0.
  Bob's settled/final1 case and IDs2/1002 persist. The activity list has one visible confirmed
  “Settle final ruling” at block23741297 plus the earlier ordinary kickback at23740796.

The captures retain D event identity, Chiado10200, `kleros-event-v8-test15m`, VERSION80015 and
the controlled-test/no-independent-jury disclosure. No value disagreement or premature global
payment-completion claim was found. The settled/normal-payout controls appear visually subdued;
an image cannot prove their DOM `disabled` property or server rejection. No action was clicked or
attempted in this review. The audit proof records no financial signatures/broadcasts, so this
role-audit pass itself performed no repeat financial action.

### Attendance payment versus collateral

The hashed settled proof corroborates the UI with two distinct successful `attendance-payout`
records: AliceD through the original ordinary release, and **the same BobD** through
`resolveChallenge`, transaction
`0xc27fb4878a820914c134be76e693057c6a700948f1d56350aabdf62f04063a0e`, block23741297/log2.
Attendance Sent totals exactly2D; pending-credit withdrawals, principal refunds, claims and
unclassified payouts remain0 in that projection. Its scope explicitly excludes successful
challenge reimbursements/remainders, so the30,000,000,000wei collateral is not counted as Bob's
attendance payment or included in the displayed2D attendance total.

Cross-document arithmetic also agrees: Bob's balance in the reviewed ruled proof is
8,944,044,783,262wei and in the settled proof9,974,044,783,262wei, a difference of
1,030,000,000,000wei = D +30,000,000,000wei. This is corroborating document arithmetic, not an
independent RPC/receipt verification or a claim that the role UI exposes every native transfer.
Primary's separately reported exact-balance/collateral canonical proofs and settled161 checks
were not rerun by this reviewer.

This completes the three requested **role-presentation** reviews: ordinary, delivered/unsettled
and settled. It does not close the stopped wrappers, remaining receipt/ABC supplements or whole-flow
acceptance. No source, hosting, financial, journal, private-key, schedule or primary-file operation
was performed; only this isolated review document changed.
