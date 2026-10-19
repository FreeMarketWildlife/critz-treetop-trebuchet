# Iteration 21 save/load/reset audit

Independent source and in-memory helper review of HEAD `ccb45e9e`, after reading ACTIVE-TASK. No browser, production edits, real localStorage writes or commits. Reproduce with `node docs/reviews/iteration-21/save-audit.mjs`; JSON includes source hashes and explicit observed cases.

## Concrete issues needing repair

**High: corrupt or unsupported primary silently overwritten after startup fallback.** With Save consent ON, startup catches malformed JSON or version 0 and uses a fresh economy, but keeps persistence enabled. The next bank or equipment action writes that fresh economy over the invalid original. Neither raw original nor a recovery copy is retained; the warning does not require an explicit replacement choice. Reproduced for malformed JSON and a structurally complete unsupported-version state. Recommendation: switch persistence/checkbox/consent OFF after failed startup restore, preserve raw bytes, clearly expose recovery choices. Do not invent a migration for unknown versions. If replacing invalid data is authorized, quarantine its raw string first; quota failure must leave it intact.

**High: valid backup unavailable when primary is invalid.** A valid version-1 envelope containing two valid economies becomes inaccessible through Restore when primary JSON is malformed or its economy validation fails. `readProgressBackup` parses/validates primary without a fallback; UI hides the button on thrown error. The envelope does not itself require a valid primary to recover. Recommendation: validate both envelope alternatives/version independently, tolerate invalid/missing primary for selecting a valid candidate, preserve invalid raw primary before replacement. If both envelope states are valid but primary is corrupt, the UI needs an explicit understandable candidate policy (e.g. last intended save with the other retained), rather than silently restoring on startup.

**Medium: opt-in cannot replace unreadable previous data deliberately.** Enabling Save calls inspectProgressChoice, which throws on malformed/unsupported previous save; checkbox returns OFF and no Keep current action is exposed. Safe preservation is preferable to overwrite, but the player cannot enable saving through normal UI until storage is repaired externally. Offer explicit Keep this session with recovery/quarantine as above. A corrupt recovery envelope similarly hides Restore; main save can remain usable, but error copy should identify backup unavailable if queried.

## Passing paths and limits

- Both normal differing-save choices preserve the other version, and Restore swaps back exactly. No points/bells merge or rewards invented.
- Interrupted primary replacement (successful envelope write, failed primary write) reloads old primary; readProgressBackup correctly exposes intended active version, and explicit Restore recovers it.
- Invalid storage access/quota failures throw before caller memory changes in helper transactions. Backup-write failure does not replace primary. Existing UI finish handler disables persistence/checkbox and keeps current session on failed commit/consent.
- Successful startup restore remains ordinary save loading. Missing primary starts fresh. Current version-1 saves retain original shot IDs; unsupported formats are rejected, not migrated.
- Bank first updates memory/ledger, marks scene banked, then attempts save. A failed write keeps earned rewards and idempotence in the current session; reloading necessarily returns older persisted rewards. Existing message says session-only. The audit measured 20 bells in memory versus 11 on reload after a quota failure. This is an explicitly unsaved session, not successful durability.
- Reset builds a candidate before banking/installing; invalid candidate throws without replacing live scene or consuming queue. Successful reset/Next banks only a released unbanked shot; install's second bank is guarded. Retry does not consume volunteers; Next consumes once after candidate construction. These are source-reviewed paths, not new browser end-to-end claims.
- Restore while a shot is banked may intentionally restore a ledger without its shot ID; existing in-memory banked flag remains true, preventing that same scene from earning it again. Preserve that guard when refactoring restore. Unbanked live shot remains collectable under its existing ID after explicit restore; that is a branch choice, not a merged ledger.
- Stored economy covers wallet, ownership/equipped state and paid shot IDs only. It does not resume a partially wound/loaded/in-flight physical scene, queue or uncollected reward. Product copy could clarify: `Saves collected rewards and owned equipment; current launch is session only.`
- Save consent storage can fail independently from economy write. finishProgressChoice writes primary before consent; failed consent leaves both versions recoverable and memory untouched, while handler attempts OFF. Cross-tab updates have no conflict locking; a separate tab may change primary between inspection/commit or overwrite saves through ordinary autosave. No multi-tab durability guarantee is justified.

## Proposed concise copy

- Invalid startup: `Saved progress could not be read. Saving is off; your stored data is kept. Restore a backup or choose to save this session.`
- Explicit replacement: `Keep this session and preserve unreadable save` (only if implementation actually quarantines bytes first).
- Interrupted/backup recovery: `Restore recovered progress` with a second action to swap to the other valid version if present.

No fixes applied in this audit. The first two issues are deterministic failures demonstrated by the companion script, not hypothetical risks.

## Focused repair following audit

The owner authorized repairs after the findings above. Current source disables persistence, checkbox and consent on unreadable/unsupported startup restore; subsequent bank/reset/Next cannot overwrite stored bytes through automatic saving. Backup candidates validate independently of corrupt primary and remain reachable. Explicit replacement or Restore first appends exact unreadable raw primary bytes to `critz-prototype-economy-unreadable-v1`; a failed quarantine write blocks replacement. Recovery then preserves the fresh session as the normal swappable backup. Unknown versions remain opaque; no migration or reward merge.

Enabling Save against unreadable data exposes Keep this session and disables Restore previous (unreadable). Existing Restore backup remains available when valid. Quarantined raw strings are retained for future/manual repair; this prototype does not claim to interpret them or expose an unknown-format playable restore. Eight helper tests pass, including corrupt/future primary recovery, fresh-session swap-back, exact-byte quarantine, interrupted-primary reload recovery and quota failures. Companion JSON/script now records postrepair behavior; the earlier findings text remains causal history. Browser verification belongs to the integrating owner.

Final focused hardening: startup warning now survives scene reset in the existing fixed-height guidance and progress-status area until explicit save/recovery succeeds. Product copy distinguishes collected rewards/owned gear from session-only launch/queue. Invalid existing backup envelopes are quarantined as exact raw strings before explicit overwrite; valid envelopes containing a third displaced alternative are also archived raw. Archive-write failure blocks replacement. Ten helper tests pass, including A/B envelope plus fresh C → recover A ↔ C with B preserved in the displaced-envelope archive. Only the current single alternate is playable through Swap; opaque and older archives are preserved for manual/future repair, not claimed as migrated playable saves.


Final integration: twelve helper tests now pass. Ordinary save-failure warnings also survive reset until successful persistence. A valid envelope with unrelated/corrupt/missing primary offers its intended active alternative; the normal matching-active primary offers the other backup. See findings.md for explicit synthetic browser checks and real earned save preservation. Earlier test counts above record the repair sequence.
