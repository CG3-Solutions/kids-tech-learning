# Circuit Lab: the 100 projects

_Generated from `web/src/content/lab/` by `npm run docs:lab`. Do not edit by hand._

All projects are original. Each one has a big question, a reference circuit, behaviour checks (any build that passes them is right), a prediction, an explanation, a real-world link and a "try this". The full text of each is in the data files; this list is the overview. Part names are in `docs/11-circuit-lab-design.md`.

| Unit | Projects | Level | Big question |
|---|---|---|---|
| 🔋 1. Power and loops | 8 | 🌱 Explorer | What does electricity need to flow? |
| 🛤️ 2. Series and parallel | 8 | 🔧 Builder | What changes when parts share a loop? |
| 🔴 3. LEDs and resistors | 8 | 🔧 Builder | How do we control how much electricity flows? |
| 🧪 4. Conductors | 10 | 🌱 Explorer | What lets electricity through? |
| 🚁 5. Motion | 8 | 🔧 Builder | How does electricity make things move? |
| 🎵 6. Sound | 12 | 🌱 Explorer | How does electricity make sound? |
| 🌗 7. Sensors | 12 | 🔧 Builder | How can a circuit notice the world? |
| 🔀 8. Logic | 8 | 💡 Inventor | How do circuits make decisions? |
| 🚨 9. Alarms | 10 | 💡 Inventor | How do alarms keep us safe? |
| 🎮 10. Games | 8 | 🔧 Builder | Can we build games with circuits? |
| 🛠️ 11. Inventor briefs | 8 | 💡 Inventor | Can you design a circuit for a real person's problem? |
| **Total** | **100** | | |

## 🔋 Unit 1 · Power and loops
_What does electricity need to flow?_

| # | Project | Level | Big question | Parts | Checks | Ideas |
|---|---|---|---|---|---|---|
| 1-1 | 💡 **Light it up** | 🌱 Explorer | How does a switch turn a light on? | battery pack, slide switch, bulb | S1 off → L1 off; S1 on → L1 on | A complete loop, Switches open and close the loop, Changing energy (light, motion, sound) |
| 1-2 | 🌀 **Fan power** | 🌱 Explorer | How does electricity make things move? | battery pack, slide switch, motor with fan | S1 off → M1 off; S1 on → M1 spin | A complete loop, Switches open and close the loop, Changing energy (light, motion, sound) |
| 1-3 | 🔘 **Press to light** | 🌱 Explorer | What's the difference between a switch and a button? | battery pack, push button, bulb | BTN1 up → L1 off; BTN1 down → L1 on | A complete loop, Switches open and close the loop |
| 1-4 | 🔁 **Switch on the other side** | 🌱 Explorer | Does it matter where the switch goes in the loop? | battery pack, bulb, slide switch | S1 off → L1 off; S1 on → L1 on | A complete loop, Switches open and close the loop |
| 1-5 | 🔄 **Bulb either way** | 🌱 Explorer | Does a bulb care which way round it goes? | battery pack, slide switch, bulb | S1 on → L1 on | A complete loop, Some parts work one way round |
| 1-6 | ↩️ **Fan in reverse** | 🌱 Explorer | Can a motor spin backwards? | battery pack, slide switch, motor with fan | S1 on → M1 reverse | Some parts work one way round, Changing energy (light, motion, sound) |
| 1-7 | ⚠️ **Short-circuit detective** ⚠️ | 🌱 Explorer | Why is a short circuit dangerous? | battery pack, bulb, slide switch | S1 off → L1 on, short no; S1 on → short yes | Short circuits, A complete loop |
| 1-8 | 📡 **Morse code torch** | 🌱 Explorer | Can a light send a message? | battery pack, push button, bulb | BTN1 down → L1 on; BTN1 up → L1 off | Switches open and close the loop, Changing energy (light, motion, sound) |

## 🛤️ Unit 2 · Series and parallel
_What changes when parts share a loop?_

| # | Project | Level | Big question | Parts | Checks | Ideas |
|---|---|---|---|---|---|---|
| 2-1 | 🚂 **Lamp and fan in a row** | 🔧 Builder | What happens when two parts share one loop? | battery pack, slide switch, bulb, motor with fan | S1 on → L1 dim, M1 slow | Series (in a row), Resistance holds current back |
| 2-2 | 🛤️ **Lamp and fan side by side** | 🔧 Builder | How can two parts both get full power? | battery pack, slide switch, bulb, motor with fan | S1 on → L1 on, M1 spin | Parallel (side by side) |
| 2-3 | 🎛️ **A switch for each** | 🔧 Builder | How do you control two things separately? | battery pack, slide switch, bulb, push button, motor with fan | S1 on, BTN1 up → L1 on, M1 off; S1 off, BTN1 down → L1 off, M1 spin; S1 on, BTN1 down → L1 on, M1 spin | Parallel (side by side), Switches open and close the loop |
| 2-4 | ⏩ **Two-speed fan** | 🔧 Builder | How can one button make a fan go faster? | battery pack, slide switch, bulb, push button, motor with fan | S1 on, BTN1 up → M1 slow, L1 dim; S1 on, BTN1 down → M1 spin, L1 off | Series (in a row), Resistance holds current back, Switches open and close the loop |
| 2-5 | 💡 **Two bulbs in a row** | 🔧 Builder | Do two bulbs in a row shine as brightly as one? | battery pack, slide switch, 2 × bulb | S1 on → L1 dim, L2 dim | Series (in a row), Resistance holds current back |
| 2-6 | 💡 **Two bulbs side by side** | 🔧 Builder | How do you make two bulbs both shine brightly? | battery pack, slide switch, 2 × bulb | S1 on → L1 on, L2 on | Parallel (side by side) |
| 2-7 | 🎪 **Light, fan and LED together** | 🔧 Builder | How many things can one battery run at once? | battery pack, slide switch, bulb, motor with fan, 100 Ω resistor, red LED | S1 off → L1 off, M1 off, D1 off; S1 on → L1 on, M1 spin, D1 on | Parallel (side by side), Changing energy (light, motion, sound) |
| 2-8 | 🏠 **Master switch** | 🔧 Builder | How does one switch turn off a whole house? | battery pack, 2 × slide switch, 2 × bulb, push button | S1 off, S2 on, BTN1 down → L1 off, L2 off; S1 on, S2 on, BTN1 up → L1 on, L2 off; S1 on, S2 off, BTN1 down → L1 off, L2 on | Series (in a row), Parallel (side by side), Switches open and close the loop |

## 🔴 Unit 3 · LEDs and resistors
_How do we control how much electricity flows?_

| # | Project | Level | Big question | Parts | Checks | Ideas |
|---|---|---|---|---|---|---|
| 3-1 | 🔴 **Light an LED safely** | 🔧 Builder | Why does an LED need a resistor? | battery pack, slide switch, 100 Ω resistor, red LED | S1 off → D1 off; S1 on → D1 on | Resistance holds current back, Changing energy (light, motion, sound) |
| 3-2 | ↔️ **LED one way only** | 🔧 Builder | Does an LED care which way round it goes? | battery pack, slide switch, 100 Ω resistor, red LED | S1 on → D1 off | Some parts work one way round |
| 3-3 | 💥 **No resistor? Too much!** ⚠️ | 🔧 Builder | What happens to an LED without a resistor? | battery pack, slide switch, red LED | S1 on → D1 damage | Resistance holds current back, Short circuits |
| 3-4 | 🧱 **Too much resistance** | 🔧 Builder | Can a resistor hold back too much? | battery pack, slide switch, 10 kΩ resistor, red LED | S1 on → D1 off | Resistance holds current back |
| 3-5 | 🧭 **Battery direction finder** | 🔧 Builder | How can you tell which way electricity flows? | battery pack, slide switch, 100 Ω resistor, red LED, green LED | S1 on → D1 on, D2 off | Some parts work one way round |
| 3-6 | 🚦 **Stop and go lights** | 🔧 Builder | How do traffic lights get their colours? | battery pack, slide switch, 2 × 100 Ω resistor, red LED, push button, green LED | S1 on, BTN1 up → D1 on, D2 off; S1 off, BTN1 down → D1 off, D2 on | Parallel (side by side), Resistance holds current back |
| 3-7 | 🔆 **Bright and dim** | 🔧 Builder | How does resistance change brightness? | battery pack, slide switch, 100 Ω resistor, 2 × red LED, 1 kΩ resistor | S1 on → D1 on, D2 dim | Resistance holds current back |
| 3-8 | 🟢 **Power-on light** | 🔧 Builder | How does a gadget show that it's switched on? | battery pack, slide switch, motor with fan, 100 Ω resistor, green LED | S1 off → M1 off, D1 off; S1 on → M1 spin, D1 on | Parallel (side by side), Changing energy (light, motion, sound) |

## 🧪 Unit 4 · Conductors
_What lets electricity through?_

| # | Project | Level | Big question | Parts | Checks | Ideas |
|---|---|---|---|---|---|---|
| 4-1 | 🧪 **Conduction tester** | 🌱 Explorer | What lets electricity through? | battery pack, test clips, bulb | P1 spoon → L1 on; P1 rubber → L1 off; P1 paper → L1 off | Conductors and insulators |
| 4-2 | 🔬 **Super-sensitive tester** | 🔧 Builder | Can we find things that conduct a little? | battery pack, test clips, 100 Ω resistor, red LED | P1 coin → D1 on; P1 salt → D1 dim; P1 plastic → D1 off | Conductors and insulators, Resistance holds current back |
| 4-3 | ✏️ **Pencil wire** | 🔧 Builder | Can you draw a wire? | battery pack, test clips, 100 Ω resistor, red LED | P1 pencil → D1 dim; P1 paper → D1 off | Conductors and insulators, Resistance holds current back |
| 4-4 | 💧 **Is water a conductor?** | 🌱 Explorer | Does water carry electricity? | battery pack, test clips, 100 Ω resistor, red LED | P1 water → D1 off; P1 key → D1 on | Conductors and insulators |
| 4-5 | 🧂 **Salt water** | 🔧 Builder | Why does salt make water conduct? | battery pack, test clips, 100 Ω resistor, red LED | P1 salt → D1 dim; P1 water → D1 off | Conductors and insulators |
| 4-6 | 🌊 **Water detector** | 🔧 Builder | How can a chip notice a tiny current? | battery pack, test clips, melody chip, speaker | P1 air → SPK1 quiet; P1 water → SPK1 sound:melody | Conductors and insulators, Chips that follow a program, Sensors |
| 4-7 | 👆 **Touch tune** | 🔧 Builder | Can your finger complete a circuit? | battery pack, touch plate, melody chip, speaker | T1 no → SPK1 quiet; T1 yes → SPK1 sound:melody | Conductors and insulators, Sensors, Chips that follow a program |
| 4-8 | 🌧️ **Rain alarm with lights** | 🔧 Builder | How can an alarm both flash and sound? | battery pack, test clips, siren chip, speaker, 100 Ω resistor, red LED | P1 air → SPK1 quiet, D1 off; P1 water → SPK1 sound:police, D1 flash | Conductors and insulators, Alarms and safety systems, Parallel (side by side) |
| 4-9 | 🛸 **Touch for space sounds** | 🔧 Builder | Can a touch change a sound? | battery pack, touch plate, sound-effects chip, speaker | T1 no → SPK1 quiet; T1 yes → SPK1 sound:space | Chips that follow a program, Sensors |
| 4-10 | 🗂️ **Sort the materials** | 🌱 Explorer | Which things around you are conductors? | battery pack, test clips, 100 Ω resistor, red LED | P1 spoon → D1 on; P1 coin → D1 on; P1 foil → D1 on; P1 wood → D1 off; P1 plastic → D1 off; P1 rubber → D1 off | Conductors and insulators |

## 🚁 Unit 5 · Motion
_How does electricity make things move?_

| # | Project | Level | Big question | Parts | Checks | Ideas |
|---|---|---|---|---|---|---|
| 5-1 | 🚁 **Launch the fan** ⚠️ | 🔧 Builder | How does a spinning fan fly? | battery pack, push button, motor with fan | BTN1 down → M1 spin; BTN1 up → M1 off | Changing energy (light, motion, sound) |
| 5-2 | 🪶 **A gentle launch** | 🔧 Builder | How can you make the fan fly lower? | battery pack, push button, bulb, motor with fan | BTN1 down → M1 slow, L1 dim | Series (in a row), Resistance holds current back, Changing energy (light, motion, sound) |
| 5-3 | ⬇️ **Fan that won't fly** | 🔧 Builder | Why won't the fan fly backwards? | battery pack, push button, motor with fan | BTN1 down → M1 reverse | Some parts work one way round, Changing energy (light, motion, sound) |
| 5-4 | 🎨 **Spin art** | 🔧 Builder | What pattern does a spinning brush make? | battery pack, slide switch, motor with fan | S1 on → M1 spin | Changing energy (light, motion, sound) |
| 5-5 | 🌈 **Spinning colours** | 🔧 Builder | What colour do you see when colours spin fast? | battery pack, slide switch, bulb, push button, motor with fan | S1 on, BTN1 up → M1 slow; S1 on, BTN1 down → M1 spin | Changing energy (light, motion, sound), Series (in a row) |
| 5-6 | 🎶 **Fan with music** | 🔧 Builder | Can one switch start two things? | battery pack, slide switch, motor with fan, melody chip, speaker | S1 off → M1 off, SPK1 quiet; S1 on → M1 spin, SPK1 sound:melody | Parallel (side by side), Chips that follow a program, Sound and speakers |
| 5-7 | 🚒 **Fan with a siren** | 🔧 Builder | How do you build a toy fire engine? | battery pack, slide switch, motor with fan, siren chip, speaker | S1 on → M1 spin, SPK1 sound:fire | Chips that follow a program, Sound and speakers, Parallel (side by side) |
| 5-8 | 📸 **Strobe light** | 💡 Inventor | Can a flashing light freeze motion? | battery pack, slide switch, motor with fan, sound-effects chip, 100 Ω resistor, green LED | S1 on → M1 spin, D1 flash | Chips that follow a program, Changing energy (light, motion, sound) |

## 🎵 Unit 6 · Sound
_How does electricity make sound?_

| # | Project | Level | Big question | Parts | Checks | Ideas |
|---|---|---|---|---|---|---|
| 6-1 | 🔔 **Doorbell tune** | 🌱 Explorer | How does a musical doorbell work? | battery pack, push button, melody chip, speaker | BTN1 up → SPK1 quiet; BTN1 down → SPK1 sound:melody | Chips that follow a program, Sound and speakers, Switches open and close the loop |
| 6-2 | 🎼 **Music box** | 🌱 Explorer | How do you make music play non-stop? | battery pack, slide switch, melody chip, speaker | S1 off → SPK1 quiet; S1 on → SPK1 sound:melody | Chips that follow a program, Sound and speakers |
| 6-3 | 🚓 **Police siren** | 🌱 Explorer | How is a siren sound made? | battery pack, slide switch, siren chip, speaker | S1 off → SPK1 quiet; S1 on → SPK1 sound:police | Chips that follow a program, Sound and speakers |
| 6-4 | 🚒 **Fire engine siren** | 🌱 Explorer | How can one chip make different sirens? | battery pack, slide switch, siren chip, speaker | S1 on → SPK1 sound:fire | Chips that follow a program, Sound and speakers |
| 6-5 | 🚑 **Ambulance siren** | 🌱 Explorer | Why do emergency vehicles sound different? | battery pack, slide switch, siren chip, speaker | S1 on → SPK1 sound:ambulance | Chips that follow a program, Sound and speakers |
| 6-6 | 🤖 **Robot alarm** | 🔧 Builder | What do two mode pins together do? | battery pack, slide switch, siren chip, speaker | S1 on → SPK1 sound:robot | Chips that follow a program, Sound and speakers, Logic (AND, OR, NOT) |
| 6-7 | 👾 **Space sounds** | 🌱 Explorer | How does a toy play different sounds? | battery pack, push button, sound-effects chip, speaker | BTN1 up → SPK1 quiet; BTN1 down → SPK1 sound:space | Chips that follow a program, Sound and speakers |
| 6-8 | 🥁 **Buzzer disc speaker** | 🔧 Builder | Can a tiny disc make sound? | battery pack, push button, melody chip, buzzer disc | BTN1 down → PZ1 sound | Sound and speakers, Changing energy (light, motion, sound) |
| 6-9 | 🪩 **Music and lights** | 🔧 Builder | Can lights dance to music? | battery pack, slide switch, melody chip, speaker, 100 Ω resistor, green LED | S1 on → SPK1 sound:melody, D1 flash | Chips that follow a program, Sound and speakers, Parallel (side by side) |
| 6-10 | 🔉 **Volume down** | 🔧 Builder | How do you make a speaker quieter? | battery pack, slide switch, melody chip, 100 Ω resistor, push button, speaker | S1 on, BTN1 up → SPK1 soft; S1 on, BTN1 down → SPK1 sound | Resistance holds current back, Sound and speakers |
| 6-11 | 🎭 **Two-chip duet** | 💡 Inventor | What happens when two chips share a speaker? | battery pack, slide switch, melody chip, siren chip, speaker | S1 on → SPK1 sound | Chips that follow a program, Sound and speakers |
| 6-12 | 🚪 **Two-door doorbell** | 🔧 Builder | How can two buttons ring one bell? | battery pack, 2 × push button, melody chip, speaker | BTN1 up, BTN2 up → SPK1 quiet; BTN1 down, BTN2 up → SPK1 sound:melody; BTN1 up, BTN2 down → SPK1 sound:melody | Parallel (side by side), Logic (AND, OR, NOT), Chips that follow a program |

## 🌗 Unit 7 · Sensors
_How can a circuit notice the world?_

| # | Project | Level | Big question | Parts | Checks | Ideas |
|---|---|---|---|---|---|---|
| 7-1 | 🌗 **Light-controlled LED** | 🔧 Builder | Can a circuit notice light? | battery pack, slide switch, light sensor, red LED | S1 on, LDR1 bright → D1 on; S1 on, LDR1 dark → D1 off | Sensors, Resistance holds current back |
| 7-2 | 🧊 **Fridge light music** | 🔧 Builder | How does a fridge know its door is open? | battery pack, light sensor, melody chip, speaker | LDR1 bright → SPK1 sound:melody; LDR1 dark → SPK1 quiet | Sensors, Chips that follow a program |
| 7-3 | 🌙 **Night light** | 🚀 Engineer | How does a light come on by itself when it gets dark? | battery pack, 10 kΩ resistor, light sensor, 100 Ω resistor, red LED, transistor | LDR1 bright → D1 off; LDR1 dark → D1 on | Sensors, Transistors (electric switches), Logic (AND, OR, NOT) |
| 7-4 | 👤 **Shadow alarm** | 💡 Inventor | How can an alarm sense a shadow? | battery pack, 10 kΩ resistor, light sensor, siren chip, speaker | LDR1 bright → SPK1 quiet; LDR1 dark → SPK1 sound:police | Sensors, Logic (AND, OR, NOT), Alarms and safety systems |
| 7-5 | 👏 **Clap for space sounds** | 🔧 Builder | Can a circuit hear you? | battery pack, buzzer disc, sound-effects chip, speaker | PZ1 quiet → SPK1 quiet; PZ1 clap → SPK1 sound:space | Sensors, Sound and speakers, Chips that follow a program |
| 7-6 | ✨ **Clap-on lights** | 🔧 Builder | Can a clap switch on a light? | battery pack, buzzer disc, sound-effects chip, 100 Ω resistor, green LED | PZ1 quiet → D1 off; PZ1 clap → D1 flash | Sensors, Chips that follow a program |
| 7-7 | 🗣️ **Talk to the music box** | 🔧 Builder | Can your voice start a tune? | battery pack, buzzer disc, melody chip, speaker | PZ1 quiet → SPK1 quiet; PZ1 clap → SPK1 sound:melody | Sensors, Chips that follow a program, Sound and speakers |
| 7-8 | 🫳 **Touch light** | 🔧 Builder | Can a lamp switch on with a touch? | battery pack, touch plate, melody chip, 100 Ω resistor, red LED | T1 no → D1 off; T1 yes → D1 flash | Sensors, Conductors and insulators, Chips that follow a program |
| 7-9 | 🔦 **Light-controlled sounds** | 🔧 Builder | Can light play sounds? | battery pack, light sensor, sound-effects chip, speaker | LDR1 bright → SPK1 sound:space; LDR1 dark → SPK1 quiet | Sensors, Chips that follow a program, Sound and speakers |
| 7-10 | 🪞 **Reflection detector** | 💡 Inventor | How can a robot tell black from white? | battery pack, slide switch, bulb, light sensor, melody chip, speaker | S1 on, LDR1 bright → L1 on, SPK1 sound:melody; S1 on, LDR1 dark → L1 on, SPK1 quiet | Sensors, Changing energy (light, motion, sound) |
| 7-11 | 📏 **Light meter** | 🔧 Builder | How bright is it? | battery pack, light sensor, 100 Ω resistor, yellow LED | LDR1 bright → D1 on; LDR1 dim → D1 dim; LDR1 dark → D1 off | Sensors, Resistance holds current back |
| 7-12 | ⏱️ **Clap timer light** | 💡 Inventor | How can a light stay on after a clap? | battery pack, buzzer disc, melody chip, 100 Ω resistor, green LED | PZ1 clap → D1 flash; PZ1 quiet → D1 off | Sensors, Chips that follow a program |

## 🔀 Unit 8 · Logic
_How do circuits make decisions?_

| # | Project | Level | Big question | Parts | Checks | Ideas |
|---|---|---|---|---|---|---|
| 8-1 | 🔀 **This OR that** | 💡 Inventor | How can either of two switches turn on a light? | battery pack, slide switch, push button, 100 Ω resistor, red LED | S1 off, BTN1 up → D1 off; S1 on, BTN1 up → D1 on; S1 off, BTN1 down → D1 on; S1 on, BTN1 down → D1 on | Logic (AND, OR, NOT), Parallel (side by side) |
| 8-2 | 🔗 **This AND that** | 💡 Inventor | How do you need both switches on? | battery pack, slide switch, push button, 100 Ω resistor, red LED | S1 off, BTN1 up → D1 off; S1 on, BTN1 up → D1 off; S1 off, BTN1 down → D1 off; S1 on, BTN1 down → D1 on | Logic (AND, OR, NOT), Series (in a row) |
| 8-3 | 🙃 **The NOT switch** | 💡 Inventor | Can a switch turn a light OFF when you switch it ON? | battery pack, 100 Ω resistor, red LED, slide switch | S1 off → D1 on; S1 on → D1 off | Logic (AND, OR, NOT), Resistance holds current back, Short circuits |
| 8-4 | 🚫 **Neither this NOR that** | 💡 Inventor | How do you make a light that's on only when nothing is pressed? | battery pack, 100 Ω resistor, red LED, slide switch, push button | S1 off, BTN1 up → D1 on; S1 on, BTN1 up → D1 off; S1 off, BTN1 down → D1 off; S1 on, BTN1 down → D1 off | Logic (AND, OR, NOT), Parallel (side by side) |
| 8-5 | 🧩 **NOT this AND that** | 💡 Inventor | What is the opposite of AND? | battery pack, 100 Ω resistor, red LED, slide switch, push button | S1 off, BTN1 up → D1 on; S1 on, BTN1 up → D1 on; S1 off, BTN1 down → D1 on; S1 on, BTN1 down → D1 off | Logic (AND, OR, NOT), Series (in a row) |
| 8-6 | 🪜 **Staircase light** | 💡 Inventor | How can two switches far apart control one light? | battery pack, 2 × two-way switch, bulb | SW1 up, SW2 up → L1 on; SW1 down, SW2 down → L1 on; SW1 up, SW2 down → L1 off; SW1 down, SW2 up → L1 off | Logic (AND, OR, NOT), Switches open and close the loop |
| 8-7 | 🔐 **Three-key safe** | 💡 Inventor | How do you make a lock that needs three keys? | battery pack, 2 × slide switch, push button, 100 Ω resistor, green LED | S1 on, S2 on, BTN1 down → D1 on; S1 on, S2 off, BTN1 down → D1 off; S1 off, S2 on, BTN1 down → D1 off; S1 on, S2 on, BTN1 up → D1 off | Logic (AND, OR, NOT), Series (in a row) |
| 8-8 | 💺 **Seatbelt alarm** | 💡 Inventor | How does a car know you forgot your seatbelt? | battery pack, push button, 10 kΩ resistor, slide switch, siren chip, speaker | BTN1 up, S1 off → SPK1 quiet; BTN1 down, S1 off → SPK1 sound:police; BTN1 down, S1 on → SPK1 quiet | Logic (AND, OR, NOT), Alarms and safety systems |

## 🚨 Unit 9 · Alarms
_How do alarms keep us safe?_

| # | Project | Level | Big question | Parts | Checks | Ideas |
|---|---|---|---|---|---|---|
| 9-1 | 🚪 **Door alarm** | 💡 Inventor | How does an alarm know a door was opened? | battery pack, 10 kΩ resistor, slide switch, siren chip, speaker | S1 on → SPK1 quiet; S1 off → SPK1 sound:police | Alarms and safety systems, Logic (AND, OR, NOT), Switches open and close the loop |
| 9-2 | 🧘 **Pressure mat** | 🔧 Builder | How can a doormat play a welcome tune? | battery pack, push button, melody chip, speaker | BTN1 up → SPK1 quiet; BTN1 down → SPK1 sound:melody | Alarms and safety systems, Switches open and close the loop, Chips that follow a program |
| 9-3 | 🧵 **Tripwire** | 💡 Inventor | How does a thin wire guard a room? | battery pack, 10 kΩ resistor, test clips, siren chip, speaker | P1 foil → SPK1 quiet; P1 air → SPK1 sound:robot | Alarms and safety systems, Conductors and insulators, Logic (AND, OR, NOT) |
| 9-4 | 🪴 **Thirsty plant alarm** | 💡 Inventor | How can a plant ask for water? | battery pack, 10 kΩ resistor, test clips, melody chip, speaker | P1 wetsoil → SPK1 quiet; P1 drysoil → SPK1 sound:melody | Alarms and safety systems, Conductors and insulators, Sensors |
| 9-5 | 🔦 **Light-beam alarm** | 💡 Inventor | How does a beam of light catch an intruder? | battery pack, slide switch, bulb, 10 kΩ resistor, light sensor, siren chip, speaker | S1 on, LDR1 bright → L1 on, SPK1 quiet; S1 on, LDR1 dark → SPK1 sound:police | Alarms and safety systems, Sensors, Logic (AND, OR, NOT) |
| 9-6 | 🤫 **Silent alarm** | 💡 Inventor | Why would an alarm be silent? | battery pack, push button, siren chip, 100 Ω resistor, red LED | BTN1 up → D1 off; BTN1 down → D1 flash | Alarms and safety systems, Chips that follow a program |
| 9-7 | 🚑 **Flood alarm** | 💡 Inventor | How can an alarm warn of rising water? | battery pack, test clips, siren chip, speaker, 100 Ω resistor, red LED | P1 air → SPK1 quiet, D1 off; P1 water → SPK1 sound:ambulance, D1 flash | Alarms and safety systems, Conductors and insulators, Parallel (side by side) |
| 9-8 | 🧊 **Fridge door alarm** | 💡 Inventor | How can a fridge remind you to close it? | battery pack, light sensor, siren chip, speaker | LDR1 dark → SPK1 quiet; LDR1 bright → SPK1 sound:fire | Alarms and safety systems, Sensors |
| 9-9 | 🖐️ **Don't-touch alarm** | 💡 Inventor | How can an alarm feel a touch? | battery pack, touch plate, siren chip, speaker | T1 no → SPK1 quiet; T1 yes → SPK1 sound:fire | Alarms and safety systems, Sensors, Conductors and insulators |
| 9-10 | 🗝️ **Alarm with an on/off key** | 💡 Inventor | How do you stop your own alarm going off? | battery pack, 2 × slide switch, 10 kΩ resistor, siren chip, speaker | S1 off, S2 off → SPK1 quiet; S1 on, S2 on → SPK1 quiet; S1 on, S2 off → SPK1 sound:police | Alarms and safety systems, Logic (AND, OR, NOT), Series (in a row) |

## 🎮 Unit 10 · Games
_Can we build games with circuits?_

| # | Project | Level | Big question | Parts | Checks | Ideas |
|---|---|---|---|---|---|---|
| 10-1 | 🌀 **Steady hand** 🎮 | 🔧 Builder | How steady is your hand? | battery pack, test clips, melody chip, speaker | P1 air → SPK1 quiet; P1 foil → SPK1 sound:melody | Conductors and insulators, Switches open and close the loop |
| 10-2 | ⚡ **Reaction race** 🎮 | 🔧 Builder | How fast are your reactions? | battery pack, push button, melody chip, speaker, 100 Ω resistor, green LED | BTN1 up → D1 off, SPK1 quiet; BTN1 down → D1 on, SPK1 sound:melody | Switches open and close the loop, Chips that follow a program |
| 10-3 | 🤐 **Quiet zone** 🎮 | 🔧 Builder | Can you stay silent? | battery pack, buzzer disc, sound-effects chip, speaker | PZ1 quiet → SPK1 quiet; PZ1 clap → SPK1 sound:space | Sensors, Sound and speakers |
| 10-4 | 🙋 **Quiz buzzers** 🎮 | 🔧 Builder | Who pressed first? | battery pack, 2 × push button, 2 × 100 Ω resistor, red LED, green LED | BTN1 down, BTN2 up → D1 on, D2 off; BTN1 up, BTN2 down → D1 off, D2 on | Parallel (side by side), Switches open and close the loop |
| 10-5 | 🗺️ **Treasure hunt** 🎮 | 🔧 Builder | Which switch is the real one? | battery pack, 2 × push button, slide switch, melody chip, speaker | BTN1 down → SPK1 sound:melody; BTN2 down → SPK1 quiet; S1 on → SPK1 quiet | A complete loop, Switches open and close the loop |
| 10-6 | 🧠 **Copy the lights** 🎮 | 🔧 Builder | Can you remember a pattern? | battery pack, slide switch, bulb, 2 × push button, 2 × 100 Ω resistor, red LED, green LED | S1 on, BTN1 up, BTN2 up → L1 on, D1 off, D2 off; S1 off, BTN1 down, BTN2 up → D1 on; S1 off, BTN1 up, BTN2 down → D2 on | Parallel (side by side) |
| 10-7 | 📟 **Morse beeper** 🎮 | 🔧 Builder | How did people send messages before phones? | battery pack, push button, siren chip, speaker | BTN1 up → SPK1 quiet; BTN1 down → SPK1 sound:robot | Switches open and close the loop, Chips that follow a program, Sound and speakers |
| 10-8 | ⚽ **Fan football** 🎮 | 🔧 Builder | Can air score a goal? | battery pack, push button, motor with fan | BTN1 down → M1 spin; BTN1 up → M1 off | Changing energy (light, motion, sound) |

## 🛠️ Unit 11 · Inventor briefs
_Can you design a circuit for a real person's problem?_

| # | Project | Level | Big question | Parts | Checks | Ideas |
|---|---|---|---|---|---|---|
| 11-1 | 👶 **Baby's night light** | 🚀 Engineer | A parent wants a small light that switches on when the room gets dark and off when it's light, with no switch to press. | battery pack, 10 kΩ resistor, light sensor, 100 Ω resistor, yellow LED, transistor | LDR1 bright → D1 off; LDR1 dark → D1 on | Designing to a brief, Sensors, Transistors (electric switches) |
| 11-2 | 🚲 **Bike indicators** | 💡 Inventor | A cyclist wants a left light and a right light, chosen with one switch, so drivers know which way they're turning. | battery pack, two-way switch, 2 × 100 Ω resistor, 2 × yellow LED | SW1 up → D1 on, D2 off; SW1 down → D1 off, D2 on | Designing to a brief, Switches open and close the loop, Parallel (side by side) |
| 11-3 | 🗼 **Lighthouse** | 💡 Inventor | A tiny island needs a lighthouse that flashes and sounds a foghorn when it gets dark. | battery pack, 10 kΩ resistor, light sensor, siren chip, speaker, 100 Ω resistor, yellow LED | LDR1 bright → SPK1 quiet, D1 off; LDR1 dark → SPK1 sound, D1 flash | Designing to a brief, Sensors, Alarms and safety systems |
| 11-4 | 🛎️ **Shop door chime** | 💡 Inventor | A shopkeeper at the back of the shop wants a tune to play whenever someone walks through the door, breaking a light beam. | battery pack, slide switch, bulb, 10 kΩ resistor, light sensor, melody chip, speaker | S1 on, LDR1 bright → SPK1 quiet; S1 on, LDR1 dark → SPK1 sound:melody | Designing to a brief, Sensors, Chips that follow a program |
| 11-5 | 🔒 **Secret code lock** | 💡 Inventor | Design a treasure box lock: two switches must be ON, and a trap button must NOT be pressed, to play the 'unlocked' tune. | battery pack, 2 × slide switch, 10 kΩ resistor, push button, melody chip, speaker | S1 on, S2 on, BTN1 up → SPK1 sound:melody; S1 on, S2 on, BTN1 down → SPK1 quiet; S1 on, S2 off, BTN1 up → SPK1 quiet; S1 off, S2 on, BTN1 up → SPK1 quiet | Designing to a brief, Logic (AND, OR, NOT) |
| 11-6 | ☀️ **Sunny-day fan** | 🚀 Engineer | A greenhouse gets hot when the sun shines. Design a fan that runs in bright light and stops when it's dark. | battery pack, light sensor, 10 kΩ resistor, motor with fan, transistor | LDR1 bright → M1 spin; LDR1 dark → M1 off | Designing to a brief, Sensors, Transistors (electric switches) |
| 11-7 | 👀 **Doorbell you can see** | 💡 Inventor | Design a doorbell that plays a tune AND flashes a light, so everyone in the home knows someone is at the door. | battery pack, push button, melody chip, speaker, 100 Ω resistor, green LED | BTN1 up → SPK1 quiet, D1 off; BTN1 down → SPK1 sound:melody, D1 flash | Designing to a brief, Chips that follow a program, Parallel (side by side) |
| 11-8 | 🛠️ **Your own invention** | 💡 Inventor | Think of a problem at home or school. Design a circuit with at least one input (switch, button or sensor) that controls at least one output (light, motor or sound). | Your choice | Any input that changes an output | Designing to a brief |

⚠️ = shows a safety lesson (a short circuit or an unprotected LED) that is safe in the lab and must never be tried with real parts. 🎮 = a game.
