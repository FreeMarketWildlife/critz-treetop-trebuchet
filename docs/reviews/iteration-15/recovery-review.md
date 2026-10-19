# Independent recovery and first-time-player review

Read-only production review; numerically replayed the five iteration14 nonrelease rows. Evidence: recovery-cases.json. No hidden-tab or browser observations by this reviewer.

All five rows used0.2winding. Identical equipment and physical loading at0.6 produced ready contact within0.252seconds after drop for all five; no snaps, anchors or force changes. This verifies a recoverable loading window, not subsequent launch quality.

| Soak index | Species/grip | What happened at0.2 | Medium first ready tick |
| --- | --- | --- | --- |
| 5 | Chipmunk/head | No postdrop contact; ends1.86m below moving cradle | 12 |
| 37 | Snake/head | Contact and COM ready at drop; loses contact before soak's delayed eligibility search | 0 |
| 40 | Armadillo/torso | No postdrop contact; falls58m below and25.8m left | 151 |
| 73 | Armadillo/head | No postdrop contact; bead escapes rail, falls51.7m below | 0 |
| 76 | Frog/torso | Initial contact but COM never within loading envelope; falls1.64m below | 149 |

The soak searches readiness only after60ticks (about0.1s); snake37therefore is a missed brief window, not proof that no valid pose existed. Do not call all five impossible configurations.

Concrete minimal fixes:

- Coach's lost-contact branch requires prior observed contact. A volunteer that never touched and has fallen58m still receives 'Lift over its center'. Detect below/out-of-reach geometry independently of contact history, offer same-volunteer retry and state actual separation; retain rail escape priority.
- Moving-load message compares COM OR fastest-part speed, but prints COM speed alone. This produced 'moving(0.0m/s relative)'. Print the maximum or explicitly distinguish body-part motion.
- At medium winding, a failed first attempt without observed contact currently has no dedicated retry button, though Reset remains available. Geometric fallen classification should offer retry for any winding.
- First-time instructions say 'Space/Enter' without explaining button focus; keyboard handlers are attached to winding button only. Say 'focus the winding button, then hold Space/Enter'.
- Winding meter has no visible named middle target; accessible range label exists. A quiet central target marker/readout would make timedrelease clearer without automating it.
- Shop summary correctly states next-reset application, but a purchase gives no prominent next action near the shop. A concise 'equipped for next setup; reset to use' confirmation can prevent expectation that current beam changes instantly.

State safety review: reset and Next construct candidate before banking/discarding; retry resets selected species without queue consumption; Next alone consumes once. Bank guard prevents repeat payout; failures before release create no shotId and earn nothing. Constructor failure preserves prior scene/queue. This is code inspection, not DOM integration coverage.

Meaningful verification: regression for never-contact fall at both low and medium winding; body-part-motion message when COMspeed0; replay five same-equipment medium recoveries; test snake0.2 early valid window without pretending it is stable; keyboard focused-button hold/release plus pointer cancel; browser buy/equip/reset feedback. Hidden-tab E2E remains unverified from this review.

Suggested geometry/text boundaries (recommendations, not implemented here):

- Preserve normal starting branch positions. Being 0.5 m below the cradle alone is not a failure: the unpicked volunteer legitimately waits on the launch branch. At y < branch.y - 0.8 m, when not held and not currently ready, say 'The volunteer fell below the launch branch. Retry this volunteer at medium winding.' This catches the two deep armadillo falls without classifying the initial shelf.
- Render loading workspace is finite: desktop x approximately -5.78 to 4.89 m in the interactive left panel, portrait x approximately -5.33 to 5.33 m. A fixed x threshold derived from branch endpoints would not be an honest claim of hand reach. Have renderer expose its interactive world bounds if exact 'out of view' detection is needed; otherwise say 'The volunteer is far from the cradle' at distance > 8 m and offer retry. Do not imply physically unreachable while force-driven hand has no actual maximum distance.
- For branch-resting missed loads, use c.y < cup.y - 0.5 and !held and !withinEnvelope and !contacting to say 'The volunteer is below the cradle. Re-grip from the branch or retry at medium winding.' This works whether contact was previously observed; fresh branch placement could show this useful instruction and retry without declaring failure.
- Current contact outside the COM envelope: 'A body part touched the cradle, but the load is off-center. Re-grip and center the volunteer before unlatching.' Avoid 'no contact' or generic low-winding wording here.
- Moving ready pose: 'Contact ready; body parts are moving relative to the cradle (X m/s). Unlatch now or adjust the load.' X=max(COM-relative, max-part-relative); do not print COM alone.
