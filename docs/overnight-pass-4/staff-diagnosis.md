# Pass 4 staff-run review

Historical narrow-log revision-7 experiment, replaced by the wider final exit. Frozen map SHA256 02cb9421056fdaf69fc7faf6872cfa564e8260158e8740a276bfb11498cd416f. Used the initial presentation-frame weapon trigger checks (the final scripts/measure-playability.mjs now uses fixed physical ticks): first available frame at release+1.6, +2.3 and +3.0 seconds. All four cases reached finite natural rest before 70 wall seconds; none reached the world time cap. No source edits.

## Draw 0.5, anticipation False

Finished 64.524600 physical seconds / 65.816667 presentation seconds; max distance 42.381 m. Last centre speed >1 m/s 63.605851, quiet aftermath 0.918748 seconds. Leaves occupied 7.351 physical seconds. Slow airborne motion (<1 m/s) only 0.234 seconds. End x=27.359, y=-590.324, velocity effectively zero.

Significant-contact gaps (>3 s): 2.734→7.260 (4.526s), 7.260→12.604 (5.343s), 13.168→24.630 (11.462s), 24.630→29.588 (4.958s), 32.674→62.043 (29.369s).

Actual shot times after release: 1.616703, 2.314657, 3.013838 s.

## Draw 0.5, anticipation True

Finished 11.661604 physical seconds / 13.866667 presentation seconds; max distance 42.616 m. Last centre speed >1 m/s 10.387132, quiet aftermath 1.274472 seconds. Leaves occupied 0.000 physical seconds. Slow airborne motion (<1 m/s) only 0.764 seconds. End x=39.477, y=-23.974, velocity effectively zero.

Significant-contact gaps (>3 s): 2.748→7.187 (4.439s).

Actual shot times after release: 1.608116, 2.308524, 3.011385 s.

## Draw 0.75, anticipation False

Finished 64.814085 physical seconds / 66.100000 presentation seconds; max distance 83.092 m. Last centre speed >1 m/s 63.761634, quiet aftermath 1.052452 seconds. Leaves occupied 7.984 physical seconds. Slow airborne motion (<1 m/s) only 0.465 seconds. End x=69.420, y=-595.885, velocity effectively zero.

Significant-contact gaps (>3 s): 7.102→11.927 (4.824s), 13.000→33.393 (20.393s), 36.816→59.839 (23.023s).

Actual shot times after release: 1.615476, 2.315884, 3.015065 s.

## Draw 0.75, anticipation True

Finished 64.814085 physical seconds / 69.250000 presentation seconds; max distance 83.092 m. Last centre speed >1 m/s 63.742007, quiet aftermath 1.072078 seconds. Leaves occupied 8.000 physical seconds. Slow airborne motion (<1 m/s) only 0.460 seconds. End x=69.420, y=-595.885, velocity effectively zero.

Significant-contact gaps (>3 s): 7.102→11.927 (4.824s), 13.000→33.393 (20.393s), 36.816→59.839 (23.023s).

Actual shot times after release: 1.615476, 2.315884, 3.015065 s.

## Interpretation

The long cases lose horizontal motion in upper leaf fields, then fall through the lower world at the aerodynamic terminal speed (~13.767 m/s). There is real rotation and travel during the long empty intervals. At t50 the weak case is near y=-426 and at t60 near y=-563, with no active leaf damping or contact. The medium case reaches y=-455 at t50 and is actively rebounding off the root bank at t60. Quiet aftermath remains about one second, including the normal .8 s rest dwell. Do not truncate the flight or retune ground response to address this. A visible, authored lower landing/encounter lane addresses the actual pacing issue.

The anticipation A/B changes presentation-frame sampling of prepared inputs, so actual physical fire times differ in the weak case by milliseconds. That changes its terrain path and yields 64.5 vs11.7 second outcomes. This should not be attributed to camera physics. A strict comparison needs the same physical-tick action schedule.
