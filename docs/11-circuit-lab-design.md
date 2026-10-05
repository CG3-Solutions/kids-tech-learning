# Circuit Lab: Design

The Circuit Lab lets children build real electronic circuits on screen: pick parts, snap them onto a board, switch on and see what happens. It teaches 100 original projects (`12-circuit-lab-projects.md`), placed on the STEM study map (`10-stem-study-map.md`).

## Content rules

- **Original work.** The projects teach the same beginner ideas as snap-together electronics kits: loops, switches, series and parallel, LEDs, conductors, sensors, sound, logic and alarms. Ideas like these belong to everyone. But every project title, layout, wording and part name here is our own.
  - We do not copy any kit's manual, project numbering, drawings or brand names.
  - We do not claim compatibility with any kit unless its maker gives permission.
- **Original parts.** The sound chips are our own generic designs (melody, siren, sound effects); their behaviour is defined below.
- **Safety first.** Three projects show dangers, marked ⚠️. The short circuit and the LED without a resistor are simulated safely, and both say plainly: never try this with real parts. The fan launch warns to keep it away from faces.
  - We never connect to, or suggest connecting to, mains electricity.

## The kit

| Part | Pins | Child sets | Lab shows | Kit holds |
|---|---|---|---|---|
| 🔋 Battery pack (3 V) | + − | | short circuit warning | 1 |
| 🎚️ Slide switch | a b | off / on | | 2 |
| 🔘 Push button | a b | up / down | | 2 |
| 🔀 Two-way switch | com up down | up / down | | 2 |
| 💡 Bulb | a b | | off / dim / on / flash | 2 |
| 🔴 LED (red, yellow, green) | + − | | off / dim / on / flash / damage | 3 |
| 〰️ Resistor (100 Ω, 1 kΩ, 10 kΩ) | a b | | | 3 |
| 🌗 Light sensor | a b | bright / dim / dark / lit by the lamp | | 1 |
| 🌀 Motor with fan | + − | | off / slow / spin / reverse | 1 |
| 🔈 Speaker | a b | | quiet / soft / sound (+ which sound) | 1 |
| 🥁 Buzzer disc | a b | quiet / clap | quiet / sound | 1 |
| 🎵 Melody chip | + − trig out | | | 1 |
| 🚨 Siren chip | + − trig out m1 m2 | | police / fire / ambulance / robot | 1 |
| 👾 Sound-effects chip | + − trig out | | 8 space sounds | 1 |
| 👆 Touch plate | a b | no / yes | | 1 |
| 🧪 Test clips | a b | air, spoon, coin, foil, key, pencil, salt water, tap water, wet/dry soil, finger, paper, plastic, rubber, wood | | 1 |
| 🔺 Transistor (NPN) | c b e | | | 1 |

Plus connectors, 1–6 posts long, which are just wire. (Flying leads, which can join posts that aren't in a line, are planned.)

Every part's electrical model is written in `web/src/content/lab/parts.js` (`model`). Here are the ones that matter most:
- **Bulb:** about 10 Ω. Below 60 mA it doesn't glow; 60–220 mA is dim; above that it's on.
- **LED:** 1.8 V (red), 1.85 V (yellow) or 2.0 V (green). Below 0.3 mA it's off, 0.3–4 mA dim, 4–30 mA on, and above 30 mA it shows damage.
- **Light sensor:** 100 Ω when bright, 1 kΩ when dim, 1 MΩ when dark. *Lit by the lamp* means it sees only the circuit's own bulb (a beam or a reflection), so switching the bulb off makes it dark.
- **Chips:**
  - A chip's trigger is HIGH above 1.5 V. It has 470 kΩ to − inside, so tap water (50 kΩ) or a finger (200 kΩ) can trigger it.
  - A 10 kΩ pull-up resistor with a sensor to − makes a NOT trigger: the alarm rings when the sensor lets go.
  - **Melody** plays a 6 s tune and finishes it even after the trigger drops, which makes a time delay.
  - **Siren** sounds only while the trigger is HIGH; its mode pins choose the sound.
  - **Sound effects** steps through 8 sounds, one per trigger.
  - A chip's output is push-pull: HIGH joins it to the chip's + and LOW to its −, each through 1 Ω. So it can drive a speaker and an LED together, and the current really comes through the chip's supply.
- **Buzzer disc as a sensor:** a clap makes pin a 2 V above pin b for 0.2 s. Children use the clap button, or the microphone if they turn it on. The microphone is off by default, and sound is processed only on the device.
- **Short circuit:** more than 1 A from the battery. The board switches off and explains what happened.

## Circuit notation

Every project's reference circuit and checks are short text. People can read them, tests check them, and the engine runs them (`web/src/content/lab/netlist.js`).

```
battery B1 p n | slide S1 p a | lamp L1 a b | motor M1 b n
checks: "S1=off -> L1=off M1=off", "S1=on -> L1=dim M1=slow"
```

- **Parts:** each one is written as `type ID net net …`. The same net name means "joined by wire". `-` leaves an optional pin unconnected.
- **Values:** a resistor's value and an LED's colour come after its pins: `resistor R1 a b 1000`, `led D1 b n green`.
- **Checks:** written as `inputs -> outputs`.
  - `short=yes` checks the whole board for a short circuit.
  - A speaker can name its sound: `SPK1=sound:fire`.

## How a build is marked: by behaviour, not by shape

When the child presses **Test**, the lab runs every check on the child's own circuit: it sets the inputs, simulates, and compares the outputs. Any circuit that behaves correctly passes, even a layout different from ours or a cleverer one. Inventor briefs (unit 11) are marked only this way. The last brief, "your own invention", passes when at least one input changes at least one output.

If a check fails, the lab says which, in plain words: *"With S1 ON the bulb should glow, but it's off. Is the loop complete?"* It can highlight the part, or show a ghost of the next part as a hint.

## The simulation engine (release 2, built)

The code is in `web/src/lib/circuit/`:
- **`engine.js`: the circuit solver.**
  - Nodal analysis with every part in Norton form (conductances and current sources), solved by Gaussian elimination. The battery's − net is 0 V.
  - LEDs and the transistor (off, active or saturated) are piecewise models. The solver guesses their states, solves, checks and repeats until nothing changes.
  - A chip that is playing is solved twice, with its output HIGH and with it LOW. A light that differs between the two is *flashing*; a speaker with signal through it is *making sound*. Driving each chip alone tells which sound a speaker hears, so two chips together give a *mix*.
  - `evaluate(circuit, inputs)` returns every output, the short-circuit flag, each chip's state, and meter readings: node voltages and part currents, for the Engineer level.
  - `runChecks(circuit, checks)` marks a build.
- **`live.js`: time.**
  - `LiveCircuit` keeps each chip's state as the board steps it many times a second. The melody finishes its 6 s tune after a short press (a time delay) and repeats while held. The sound-effects chip moves to the next of its 8 sounds on each press. The siren sounds only while triggered.
  - Claps last 0.2 s, and a chip that loses power stops at once.
- **`sound.js`: the sounds.**
  - Web Audio synthesis, no recordings: our own 6-second melody, four sirens (police wail, fire-engine yelp, ambulance two-tone, robot beeps) and eight space sounds.
  - Volume follows the speaker: full, soft, or a buzzer disc.
  - It respects the app's mute setting, and does nothing where audio isn't available.
- **Speed:** a whole project's checks run in a few milliseconds, which is fast enough for live use.

How we know it's right (`engine.test.js` and `live.test.js`):
- **Hand-worked circuits:** Ohm's law, series and parallel, the LED drop, a voltage divider, transistor switching, chip triggers, shorts, motor direction.
- **All 100 projects:** every check passes in simulation.
- **Every part matters:** removing any single part from any project breaks one of its checks, and so does turning any LED or motor round. So no project has a pointless part or a check that can't fail.
- **Fix-it projects start broken:** their starting circuits fail.
- **Margins:** no checked light or motor sits within 15% of a threshold, so results don't depend on rounding.
- **Real browser:** every chip sound was played through real Chromium Web Audio without errors.

What the simulation found in the release 1 projects, now fixed:
- "LED one way only" and "Too much resistance" checked only that an LED was off, which any broken build passes. They are now **fix-it** projects: the child starts from the broken circuit (`start`) and repairs it.
- In the battery direction finder, a red LED switches on at a lower voltage than a green one, so the wrong LED could be flipped unnoticed. The colours were swapped.
- The duet now checks for a *mix*, which proves both chips play.
- The light-beam projects now use the sensor's *lit by the lamp* setting, so the bulb really makes the beam.
- The sunny-day fan's 10 kΩ resistor did nothing, so it was removed.

## The board (release 3, built)

It's the **🧪 Circuit Lab** tab in Electricity & Parts. The code is `web/src/components/lab/` (screen and part drawings) and `web/src/lib/circuit/board.js` (the board logic, unit-tested).

- **Board:** 7 × 9 posts, labelled A–G and 1–9.
  - Each post is a point in the circuit; a connector joins two posts.
  - A part's pins snap onto posts. Two-pin parts span two posts; chips are 3 × 3 with their pins on the edges.
  - A new part sits one layer above anything it overlaps.
  - Parts are labelled like a circuit diagram: B1, S1, L1, D1, MEL1…
- **Building by tapping:**
  - Pick a part in the tray, then tap a post for one end. The posts where the other end can go glow; tap one. A connector can be 1–6 posts long.
  - Chips and other many-pin parts go down with one tap and turn into the board if needed.
  - The tray shows how many of each part are left in the kit.
- **Changing a build:**
  - Tap a part to choose it. Tapping a switch also flips it; press and hold a push button to press it.
  - Drag a part to move it.
  - The chosen part's panel has its controls: switch, press, two-way position, light level, finger on/off, material in the test clips, 👏 clap, resistor value and LED colour. It also has ⟳ Turn, ✥ Move and 🗑 Remove.
  - Undo and redo cover up to 50 steps.
- **Live:**
  - The engine runs about 20 times a second. Current flows along connectors (speed shows strength, direction shows which way) and bulbs glow dim or bright.
  - LEDs light in their colour, flash with the chips, or show damage. Fans spin slow, fast or backwards.
  - Speakers show sound waves while chips play their synthesized sounds.
  - A short circuit dims the board and says what to fix.
- **🔬 Meter:** current through the chosen part and the voltage across it. It's on by default from Class 9 and for grown-ups, and anyone can turn it on.
- **Phones first:**
  - The tray sits right under the board, so a child can pick a part and tap the board without scrolling. Picking a part scrolls the board into view, below the sticky top bar.
  - Zoom with the buttons or by pinching. When zoomed in, dragging empty board scrolls it.
  - On desktop the tray is a column on the left and the board fits the screen height.
- **Keyboard and screen readers:**
  - Arrow keys move a cursor over the posts and Enter taps. R turns, Delete removes, Escape cancels, Ctrl+Z / Ctrl+Y undo and redo.
  - "Describe my circuit" lists, in words, what is joined to what and what each part is doing. Changes are announced politely.
- **Saving:** each child's board and switch settings save automatically on this device.
- **Examples:** *Light it up*, *Musical doorbell* and *Fan and light together*.

## Made for small hands (after testing "Light it up" with a child)

- **Moving parts:**
  - Drag a part from anywhere on it. It lifts when touched and follows the finger.
  - The two posts it will land on glow **green** (free) or **red** (taken, or off the board). It snaps on when let go, or goes back if the spot is red.
  - ✥ Move explains itself: "Now tap where the first end should go."
- **Big targets:** every tap goes to the nearest post (well over 44 px), even where the dot itself is small.
- **Selecting is separate from switching:**
  - One tap only chooses a part. A small toolbar appears next to it: ON/OFF, Hold (push buttons), ▲/▼, finger, 👏, ⟳ Turn, ⇅ Flip, ✥ Move, 🗑.
  - A double-tap also flips a switch.
  - Values (resistor, LED colour, light level, test-clip material) and the meter sit under the tray.
- **Direction:**
  - The battery, LEDs and the motor have big markers: a red + and a black −.
  - ⇅ Flip swaps a part's ends in place.
  - In guided projects, a part in the right posts but backwards gets "Almost! … its + end should be at A3. Tap ⇅ Flip", with a ⇅ Flip it button.
- **No jumping:**
  - The board never scrolls by itself, and tapping it doesn't scroll the page.
  - The hint sits *under* the board, and nothing above the board changes size while building (tested: the board stays put through every step).
- **Recovering from mistakes:**
  - A big ↶ Undo.
  - Tapping a part in the tray again, ✕ Cancel, or a tap that doesn't fit cancels a half-placed part.
  - A part can't be dropped on top of another part's body (connectors may cross).
  - In guided projects a spare part is marked ❓, with "isn't needed… Remove it?" and a 🗑 Remove it button.
- **Guided feedback:**
  - The next ghost part pulses, and its tray item nudges.
  - Each right step gets a ✓ with a sound and a short vibration.
  - 👀 Show me picks the next part and moves a 👆 finger from its first post to its second.
- **Tray:** bigger items with pictures. In projects, used-up parts leave the tray ("✓ All parts placed"); in free build they're clearly dimmed.
- **Extras:**
  - Phones vibrate when a part snaps on.
  - 🗣 reads every hint aloud: on by default for Classes 1–2, and anyone can switch it on or off.

## Workspace v2: three fixed areas

The lab is laid out in three areas that never move while a child builds:

- **Left, the mission:**
  - The goal and the **What it must do** checklist, always visible. The checklist ticks green or turns orange when the child tests.
  - Predict and the test results sit here too, so nothing appears above the board.
  - Volt's hint, with **Hear it**, plus **Show me**, **Flip it** or **Remove it** when they apply.
  - **Test my circuit**, and **Start again…**, which asks once ("Tap again to start over") before it clears the board.
- **Centre, the board:**
  - **Tools above it, each with a word:** Undo, Redo, zoom, **Fit circuit**, Lock, Full screen, Read to me and Settings (sounds and the meter), plus a "Saved" tick.
  - **Fit circuit** zooms to the part of the board the circuit uses. A finished circuit fits itself when it locks; **Change parts** unlocks it and shows the whole board again.
  - **Right now**, under the board, says in words what the circuit is doing: "Loop closed: current is flowing · Slide switch S1 ON · Bulb L1 glowing". Tapping an item chooses that part. "Describe my circuit" is there too.
- **Right, the parts and the chosen part:**
  - The tray counts how many parts are placed ("3 of 3 placed").
  - The **Chosen part** panel shows what the part does, where it is ("from C1 to C3"), what it's doing, big labelled buttons (ON/OFF, Turn, Flip ends, Move, Remove), its settings and the meter.

When a test fails, **Show me where** rings the parts that did the wrong thing, using the child's own labels (`problemParts`). In guided mode the faint guide part shows the piece that's missing.

**Screen sizes:**
- **Wide screens (1280 px and up):** three columns.
- **Tablets and small laptops:** the mission on the left, with Test pinned at its foot; the parts as a strip under the board; the chosen part beside the strip only while a part is chosen. Secondary tools show as icons with their names as tooltips.
- **Phones:** one column. The mission folds to one line ("2 checks" / "1 of 2 work"), the toolbar is one row (Undo · Fit circuit · Lock · Settings, with Read to me and Full screen inside Settings), and the parts are docked at the bottom.

The lab fills the screen height under the project's header, and the page opens scrolled to that header (`useLabPage`). The helpers behind Fit circuit, Right now and Show me where are in `web/src/lib/circuit/workspace.js`, with tests.

## Projects (built: all eleven units)

The Circuit Lab tab now opens on **🧩 Projects** (with **🛠️ Free build** beside it). All eleven units (100 projects) are open. Units 1–3 have hand-made layouts; units 4–11 were laid out by `web/scripts/lab-layout.mjs`, which places each circuit, joins it with connectors and proves the result before printing it. The last project, "Your own invention", is open-ended: it has no layout, offers the whole kit, and passes when an input really changes an output.

How a project goes:
1. **The big question and the goal.** The child chooses how to build:
   - **🧭 Guided:** a faint copy of the next part shows where it goes, and the hint says what it is ("Next: a 100 Ω resistor, from C1 to E1").
   - **🏆 Challenge:** no ghost, just "🎯 What it must do".
   - **Fix-it** projects skip this and open the broken circuit.
2. **Gather the parts:** the project's parts mixed with two that it doesn't need. A wrong pick says what that part does and that this project doesn't need it. Connectors are always in the tray.
3. **Build:** the tray holds only the gathered parts, in the project's numbers.
4. **Predict:** the project's question, answered before the first test, with the reason.
5. **Test:** every check runs on the child's own circuit (`lib/circuit/marking.js`).
   - The child's parts are matched to the project's parts of the same type in every possible way, and the best match is kept. So a different layout, or different labels, still passes.
   - Failures are explained in plain words with the child's own labels, plus a tip: missing parts, a short circuit, an unprotected LED, a motor the wrong way round, or a gap in the loop.
6. **It works!** The explanation, "In the world", "Try this" (and "Go deeper" where there is one), the concepts learned, and a ⭐. **Next project** opens the next one.

More details:
- **Saving and badges:** each project's board saves on its own, and ↺ Start again resets it (a fix-it project goes back to its broken start). Finishing every project in a unit earns its badge: 🔋 Loop maker, 🛤️ Series and parallel pro, 🔴 LED expert.
- **Layouts** for guided mode are in `content/lab/layouts.js`. Tests build each one on the board and prove it passes its project's checks with exactly the project's parts. They also prove every fix-it start board fails.
- **Turning a part** now spins it around its middle, so turning twice swaps its ends in place (how a child turns a real part round).

## The child's experience in projects (design)

- **A board with posts in a grid.**
  - Parts snap between posts. Connector strips come in lengths 1–6. Parts can stack in layers, like real kits.
  - Rotate, move and delete; undo and redo; pinch to zoom on phones.
  - The build saves automatically for each child.
- **Picking parts is part of learning.**
  - The tray shows the project's parts plus a couple of distractors. A wrong pick gets a reason ("a bulb makes light, not sound").
  - In Challenge mode the tray holds the whole kit.
- **Three ways to build:**
  - **Guided:** a ghost shows where each part goes, one at a time.
  - **Challenge:** only the circuit diagram is shown.
  - **Free build:** the whole kit, no project.
  - **Fix-it** (some projects): the child starts from a broken circuit and repairs it.
- **Each project follows the lesson pattern children already know:**
  1. Big question
  2. Pick the parts
  3. Build
  4. Predict ("will the bulb glow?")
  5. Switch on and test
  6. Explain
  7. "In the world" and "Try this"
  8. Badge
- **Levels change the words, not the project.** Explorers get short sentences and pictures. Builders and Inventors get the full explanation. Engineers also get "Go deeper" notes and a meter that shows voltage and current at any point.
- **Live feedback.**
  - Current flows visibly along the wires: speed shows strength, direction shows polarity.
  - Bulbs glow by brightness, the fan spins at its real speed, and LEDs flash with the chips.
  - Sound plays through the device.
- **Accessibility.**
  - Every action works without dragging: tap a part, then tap two posts.
  - Everything works with a keyboard, and every circuit has a spoken description ("battery + to switch S1, S1 to bulb L1…").
  - Colours aren't the only signal.
  - Big touch targets, and it works at 390 px wide.
- **Engineer's notebook.** Each child keeps notes and a picture of every build; unit 11 asks them to write what they'd improve.

## Releases

| # | Release | Contents |
|---|---|---|
| 1 | Study map + project specs (done) | Study map, baseline design, kit, notation, 100 projects as data, tests, these documents |
| 2 | Simulation engine (done) | Solver, part models, chip behaviours, sound; all 100 reference circuits pass their checks |
| 3 | Board + free build (done) | Grid, snapping, layers, tray, undo, zoom, autosave, live current and outputs |
| 4 | Project player + units 1–3 (done) | Guided/Challenge modes, behaviour marking, predict and explain, badges (24 projects) |
| 5 | Units 5–6 | Motion and sound (20 projects) |
| 6 | Units 4 and 7 | Conductors and sensors, clap button and optional microphone (22 projects) |
| 7 | Units 8–10 | Logic, alarms and games (26 projects) |
| 8 | Baseline + map screens + parent report | Placement, the STEM Lab home, outcomes per child |
| 9 | Inventor briefs, notebook, certificates, polish | Unit 11 (8), performance, accessibility audit |

Every release ships with unit tests, a phone and desktop playthrough, and updated documents.
