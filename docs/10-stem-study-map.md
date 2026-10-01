# STEM Study Map and Baseline

Spark Lab's STEM track has three parts:
- a **study map** showing where every lesson and project fits;
- a **baseline check** that places each child on the map;
- the **Circuit Lab**: 100 hands-on electronics projects. See `11-circuit-lab-design.md` and `12-circuit-lab-projects.md`.

The map is data in `web/src/content/stem/studyMap.js`, so the app, the parent report and these documents share one source.

## The four levels

| Level | Classes | Ages | Focus |
|---|---|---|---|
| 🌱 **Explorer** | 1–2 | 6–7 | Notice, sort and try: loops, light, sound and materials. |
| 🔧 **Builder** | 3–5 | 8–10 | Build and compare: series and parallel, LEDs, motors and sensors. |
| 💡 **Inventor** | 6–8 | 11–13 | Make it decide: logic, alarms and control. |
| 🚀 **Engineer** | 9–10 | 14–16 and grown-ups | Measure and design: voltage, current and designing to a brief. |

A child starts at the level for their class. The baseline can move them up or down in each strand separately, so a Class 4 child can be a Builder in science and an Inventor in maths. Parents can still open every level, as they can today.

## The four strands

Each strand lists "I can…" outcomes at every level. Each outcome names what already teaches it (an existing subject, a Circuit Lab unit), or says *planned*.

### 🔬 Science
| Level | I can… | Taught by |
|---|---|---|
| Explorer | say what electricity needs to flow (a complete loop) | Lab unit 1, Electricity & Parts |
| | sort materials into conductors and insulators | Lab unit 4 |
| | name things that make light, movement and sound | Lab units 1 and 6 |
| Builder | explain series and parallel, and predict which is brighter | Lab unit 2 |
| | explain why some parts work only one way round | Lab units 1 and 3 |
| | explain how sensors notice light, sound and touch | Lab unit 7 |
| | explain how sound is made by vibrations | Lab unit 6 |
| Inventor | explain resistance and how it controls current | Lab units 3 and 7 |
| | explain energy changes in a circuit | Lab units 5 and 6 |
| | explain magnets and electromagnets | *planned* |
| Engineer | use Ohm's law (V = I × R) to explain a circuit | Lab units 3 and 11 |
| | explain how a transistor switches and amplifies | Lab units 7 and 11 |

### 💻 Technology
| Level | I can… | Taught by |
|---|---|---|
| Explorer | say what a computer is and name its parts | Inside a Computer |
| | follow and give step-by-step instructions | Coding Puzzles |
| Builder | explain input, process and output | Inside a Computer |
| | count and write numbers in binary | Binary Magic |
| | type with the right fingers | Touch Typing |
| Inventor | explain how a key press reaches the screen | Inside a Computer (Chip's mission) |
| | explain how chips follow a program | Lab units 6 and 8 |
| | build AND, OR and NOT and say where computers use them | Lab unit 8, Electricity & Parts |
| Engineer | explain how logic gates add numbers and remember | Electricity & Parts (Part C) |
| | write a simple program with loops and decisions | Coding Puzzles, *more planned* |

### 🛠️ Engineering
| Level | I can… | Taught by |
|---|---|---|
| Explorer | build a circuit from a picture and test it | Lab unit 1 |
| | find and fix a broken loop | Electricity & Parts, Lab unit 1 |
| Builder | choose the right parts for a job and explain why | Lab units 2 and 5 |
| | make a prediction, test it and say what happened | Lab units 2 and 3 |
| | build simple games and gadgets | Lab unit 10 |
| Inventor | design alarms and safety systems | Lab unit 9 |
| | follow the design cycle: Ask, Imagine, Plan, Build, Test, Improve | Lab unit 11 |
| Engineer | design a circuit from a brief and prove it works with tests | Lab unit 11 |
| | explain safety: short circuits, fuses and mains electricity | Lab units 1 and 3 |

### 📐 Maths
| Level | I can… | Taught by |
|---|---|---|
| Explorer | count, add and take away to 20 | Numbers, Mathematics |
| Builder | multiply, divide and solve money problems | Mathematics (and Ollie's party mission) |
| | count combinations (2 switches make 4) | Lab units 6 and 8 |
| Inventor | use fractions, decimals and percentages | Mathematics |
| | read and make truth tables | Lab unit 8 |
| Engineer | rearrange a formula (V = I × R) | Mathematics, Lab unit 11 |
| | record measurements and draw a graph | *planned* |

**Planned topics** (later releases, same format): magnets and electromagnets; forces and simple machines; structures and bridges; measuring and graphing data from projects.

## The baseline check

The baseline check is built in release 8. It takes about 12 minutes:

1. **6 questions per strand.** It starts at the level for the child's class.
   - Two right in a row → try the next level up. Two wrong → step down.
   - It stops after 6 questions.
   - The questions use the same formats as the rest of the app: choice, true/false and put-in-order.
2. **One hands-on build:** "make the bulb light" (project 1-1). The child picks the parts from a tray and builds the loop. This shows whether they can follow a circuit, not only answer about one.
3. **Placement:** each strand's level is the highest level where the child got at least 2 of 3 right.
4. **Report:** parents see the level per strand, the suggested first project, and the outcomes to work on next.
5. **Retake each term:** the report shows a before-and-after chart.

There are 16 sample questions now, one per strand and level, in `BASELINE_SAMPLES`. The full bank of about 12 per strand and level arrives with release 8. Examples:
- **Explorer science:** Which one will let electricity through? 🥄 spoon / 📏 ruler / 📄 paper
- **Builder maths:** Each pizza has 8 slices. How many pizzas for 18 slices?
- **Inventor technology:** A lift moves only if the door is shut AND a button is pressed. Which gate is that?
- **Engineer science:** A 3 V battery drives 0.01 A through a resistor. What is its resistance?

## Where STEM lives in the app

A new **🧪 STEM Lab** area on the home screen, next to Science & Tech, holds:
- the map
- the baseline
- the Circuit Lab
- the engineer's notebook

The existing subjects stay where they are. The map links to them, and their progress counts towards the map's outcomes.
