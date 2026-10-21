# Clean playfield and loading recovery

The preparation screen shows the game and a pause button. A compact hold-to-launch button appears only when the critter is loaded. Distance and compact weapon icons are shown during the throw. Build, Shop and Blueprints live in Pause; mode, rebuild, camera, speed, sound and settings live under Options. Existing control elements are moved into the dialog, retaining their handlers and state.

Automatic loading suggestions, basket guidance, empty-click toasts and explanatory playfield text are removed. Keyboard controls remain: Enter loads, Space winds/releases, Escape pauses; weapon controls are unchanged.

After a missed drop reaches the ground, jointed preparation bodies walk toward the pedestal under active horizontal movement and upright control, then make a physical jump onto it. There is no position teleport in recovery. Walk-cycle paws animate while returning. Point grabs interrupt the return immediately; seated critters remain draggable. Grabbing while winding cancels the hold rather than launching. Flight physics remains separate.

Verification: all 416 Node tests pass. Isolated Chrome checks cover quiet idle, pause/options, a missed drop, grabbing during return, recovery onto the pedestal, grabbing a seated critter, and portrait layout. No browser errors. The user's existing in-app preview was reloaded and visually verified. Desktop, portrait and expanded-pause screenshots are in this folder.
