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
| 🌗 Light sensor | a b | bright / dim / dark | | 1 |
| 🌀 Motor with fan | + − | | off / slow / spin / reverse | 1 |
| 🔈 Speaker | a b | | quiet / soft / sound (+ which sound) | 1 |
| 🥁 Buzzer disc | a b | quiet / clap | quiet / sound | 1 |
| 🎵 Melody chip | + − trig out | | | 1 |
| 🚨 Siren chip | + − trig out m1 m2 | | police / fire / ambulance / robot | 1 |
| 👾 Sound-effects chip | + − trig out | | 8 space sounds | 1 |
| 👆 Touch plate | a b | no / yes | | 1 |
| 🧪 Test clips | a b | air, spoon, coin, foil, key, pencil, salt water, tap water, wet/dry soil, finger, paper, plastic, rubber, wood | | 1 |
| 🔺 Transistor (NPN) | c b e | | | 1 |

Plus connector strips (1–6 posts long) and two flying leads, which are just wire.

Every part's electrical model is written in `web/src/content/lab/parts.js` (`model`). Here are the ones that matter most:
- **Bulb:** about 10 Ω. Below 60 mA it doesn't glow; 60–180 mA is dim; above that it's on.
- **LED:** about 1.8–2.1 V. Below 0.5 mA it's off, 0.5–5 mA dim, 5–30 mA on, and above 30 mA it shows damage.
- **Light sensor:** 100 Ω when bright, 1 kΩ when dim, 1 MΩ when dark.
- **Chips:**
  - A chip's trigger is HIGH above 1.5 V. It has 470 kΩ to − inside, so tap water (50 kΩ) or a finger (200 kΩ) can trigger it.
  - A 10 kΩ pull-up resistor with a sensor to − makes a NOT trigger: the alarm rings when the sensor lets go.
  - **Melody** plays a 6 s tune and finishes it even after the trigger drops, which makes a time delay.
  - **Siren** sounds only while the trigger is HIGH; its mode pins choose the sound.
  - **Sound effects** steps through 8 sounds, one per trigger.
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

## The simulation engine (release 2)

- **DC circuit solver** using modified nodal analysis. Diodes, LEDs and the transistor are solved with Newton iterations; bulbs, motors, speakers, sensors and switches are resistances.
- **Chips are behaviour models** ticking 50 times a second. They read their trigger voltage, and their output is a voltage source with 30 Ω inside, so they drive speakers, LEDs and bulbs realistically.
- **Sound** uses the Web Audio API. Each chip has its own synthesized sounds (no recordings), and volume follows the current through the speaker.
- **Outputs are classified** from currents (off/dim/on, slow/spin, soft/sound), using the thresholds above. Short circuits and LED damage are flagged.
- **Every project is tested.** The engine runs all 100 reference circuits against their own checks in the test suite, so none can ship broken. Release 1 already checks the structure and wiring paths of all 100 (`lab.test.js`).

## The board and the child's experience (releases 3–4)

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
| 1 | Study map + project specs (this) | Study map, baseline design, kit, notation, 100 projects as data, tests, these documents |
| 2 | Simulation engine | Solver, part models, chip behaviours, sound; all 100 reference circuits pass their checks |
| 3 | Board + free build | Grid, snapping, layers, tray, undo, zoom, autosave, live current and outputs |
| 4 | Project player + units 1–3 | Guided/Challenge modes, behaviour marking, predict and explain, badges (24 projects) |
| 5 | Units 5–6 | Motion and sound (20 projects) |
| 6 | Units 4 and 7 | Conductors and sensors, clap button and optional microphone (22 projects) |
| 7 | Units 8–10 | Logic, alarms and games (26 projects) |
| 8 | Baseline + map screens + parent report | Placement, the STEM Lab home, outcomes per child |
| 9 | Inventor briefs, notebook, certificates, polish | Unit 11 (8), performance, accessibility audit |

Every release ships with unit tests, a phone and desktop playthrough, and updated documents.
