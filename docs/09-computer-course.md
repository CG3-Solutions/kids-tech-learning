# Inside a Computer: Chip's path

"Inside a Computer" is a **learning path**, not a set of cards. Chip the Computer guides the child through 13 concepts in order, built around one big question: **"When I press a key, how does the letter appear on the screen?"** Each step opens after the one before it is passed. A parent can open all levels in **Parent dashboard → Learners → Levels**.

## How each step works (6 short screens)
| Screen | What happens |
|---|---|
| 1. **Think** | A hook question or puzzle ("How does the phone know you touched it?"). Any answer is fine; then Chip explains. |
| 2. **Learn** | 2–3 sentences, plus an "It's like…" comparison. |
| 3. **See it** | A small animation, for example a key press travelling to the CPU and then to the screen. |
| 4. **Do it** | A hands-on activity (see below). The step continues once it's done. |
| 5. **Check** | 3 questions. **2 right earns the star.** A wrong answer always shows a one-line explanation. If fewer than 2 are right, the child can try again or go back to Learn. |
| 6. **Recap** | What you learned, "Find it around you", "Try it at home", and links to other subjects that build on this one. |

Stars come only from passing checks. The old cards are now a **📚 Glossary** to look things up, with no star for tapping.

## The 13 steps
| Part | Step | Big idea | Activity | Links to |
|---|---|---|---|---|
| **A · What computers are** | 1 What is a computer? | A machine that follows instructions: a fan isn't one, a washing machine has one inside | Sort: computer inside or not | |
| | 2 Instructions, programs and bugs | A program is a list of instructions; a bug is a mistake in it | **Be the computer**: follow a program exactly, then find the bug | Robot puzzles |
| | 3 Input → Process → Output | The core idea, taught before the parts | Sort: input, process or output | |
| **B · The parts** | 4 Input devices | Keyboard, mouse, touch screen, camera, microphone | Sort: input or not | Typing course |
| | 5 Output devices | Screen, speaker, printer; the **touch screen is both** | Sort: input, output or both | |
| | 6 The CPU | Follows instructions very fast; **it can't think on its own** | Sort: can the CPU do it by itself? | Circuits & gates |
| | 7 Memory and storage | Memory forgets when the power goes off; storage keeps things | **Power cut**: save 2 things, then cut the power | Binary adventure |
| | 8 Build a computer | A team of parts on the motherboard | **Build a computer**: fill every slot, then switch it on | |
| **C · Computers in the world** | 9 Hardware and software | Parts you can touch vs. instructions | Sort: hardware or software | |
| | 10 Operating system and apps | The OS runs everything and opens apps | Sort: OS or app | |
| | 11 Files and data | Everything is saved as numbers; pictures are pixels | **Be the screen**: turn numbers into a picture | Binary adventure |
| | 12 Networks and the internet | Computers joined together; data travels in packets | Order the steps of a photo's journey | |
| | 13 Staying safe online | Keep private details private, be kind, tell a grown-up | Sort: OK to share or keep private | |

Badges: ⌨️ **Key press detective** (the mission), 💻 **Computer explorer** (finish Part B) and 🛡️ **Internet safety star** (finish step 13). Each sends a milestone email.

## Chip's mission: follow a key press
The path starts and ends with the big question, so the 13 concepts have a purpose:

| Step | What the child does | What they learn | Talk about it at home |
|---|---|---|---|
| 💬 **How does a letter reach the screen?** (first step, Part A) | A conversation with Chip: guess how the letter gets there (magic? the keyboard draws it?) and how long the trip takes. Every answer gets a reply; a wrong guess is a good thought, then gently corrected. | A team of parts passes the letter along in less than a blink. Computers only understand ON and OFF, so H → 72 → 01001000 (from Bit's mission). | Press a key together and ask: what happened inside? |
| 🎯 **Mission: follow a key press** (after "Build a computer", Part B) | Presses any letter on a little keyboard and follows it through six stops: ⌨️ keyboard (a switch closes) → 🔌 the trip (as ONs and OFFs) → 🔲 CPU (follows the app's instructions) → 🗂️ memory (H is stored as 72) → 🎨 drawing (the letter's shape becomes pixels) → 🖥️ screen. Two quick predictions on the way, then puts the trip in order. | How input, process, memory and output work together, using the parts from Part B. Earns the ⌨️ **Key press detective** badge. | Ask your child to tell the whole trip of their own initial. |

From **Class 8** (and for grown-ups) each stop has a 🔬 **Go deeper** note: the keyboard grid and scan codes, USB and Bluetooth packets, interrupts and the operating system, bytes in RAM (and why a power cut loses unsaved work), the GPU and frame buffer, and screen refresh at 60 Hz. The script and stops are plain data in `content/computerTalk.js`; the review, quiz and report still use the 13 concept steps only.

## Depth by class
Every concept has three depths. The **Learn** text, the **Check** questions and extra **Recap** points change with the depth; the hook, animation and activity are shared.

| Concept | Class 1–3 | Class 4–7 | Class 8–12 |
|---|---|---|---|
| What is a computer? | Follows instructions; fan vs washing machine | Programmable machines; embedded computers | Stored-program (von Neumann) design; microcontrollers to supercomputers |
| Programs and bugs | Instructions in order; a bug is a mistake | Languages; sequence, selection, loops; debugging | Compilers and interpreters; syntax, runtime and logic errors |
| Input → Process → Output | The three steps | IPOS (storage) and feedback | Data vs information; the hardware path |
| Input devices | Keyboard, mouse, touch, camera, mic | Sensors (temperature, GPS, accelerometer), scanners | Analogue-to-digital conversion; drivers and ports |
| Output devices | Screen, speaker, printer; touch screen is both | Resolution; 3D printers; actuators | GPU and refresh rate (Hz); digital-to-analogue |
| The CPU | Follows instructions fast; can't think | Fetch → decode → execute; GHz | Control unit, ALU, registers; cores and cache; transistors |
| Memory and storage | Desk vs cupboard; power cut | Bits, bytes, KB–GB; RAM vs storage sizes | Volatile vs non-volatile; SSD vs HDD; memory hierarchy |
| Build a computer | Parts and the motherboard | Buses, power supply, system on a chip | Booting (firmware, POST); bottlenecks |
| Hardware and software | Touch vs instructions | System vs application software; firmware | Open source vs proprietary; abstraction layers |
| Operating system and apps | The OS opens apps | Memory, files, devices, security; multitasking | Kernel, scheduling, virtual memory; CLI vs GUI |
| Files and data | Numbers, pixels, folders | Bits, RGB, file extensions | File size, lossless vs lossy compression; ASCII/Unicode |
| Networks and the internet | Computers joined; packets | LAN/WAN, IP addresses, routers | TCP/IP, HTTP(S), DNS; web vs internet; clients and servers |
| Staying safe online | Private details, tell a grown-up | Strong passwords, 2-step, phishing, digital footprint | Malware, social engineering, 2FA; India's DPDP Act 2023; helpline 1930 |

**Which depth a child sees:** Class 1–3 start at the first depth, Class 4–7 at the second, Class 8–12 and grown-ups at the third. Any learner can tap **Go deeper** or **Simpler** on the Learn screen, or **Go deeper** after the recap. Passing the check at any depth earns the star. The best score at each depth is kept for parents and for review later.

## For parents and teachers
- **Do the activities together** the first time. "Be the computer" and "Power cut" work well as real-life games too.
- **Use the "Try it at home" ideas.** Counting computers at home, zooming into photo pixels and finding the Wi-Fi router make the ideas stick.
- **Staying safe online (step 13):** agree on family rules together: allowed apps, no chatting with strangers, and always telling you if something feels wrong, with no punishment for telling.
- **Check results** appear in the parent report, under Adventures and Activity.

## Review, quiz and the parent report (C3)
**Question types.** Lesson checks, Chip's quiz and review use five kinds of question: choose an answer, **picture choice**, **true or false**, **put in order** (tap the steps in order, with an Undo) and **spot the bug** (tap the wrong line of a program; the fix is shown). Every answer shows the right answer and a one-line reason. Each concept also has 4 practice questions in mixed types: 2 for everyone and 2 for Class 4 and up (`content/computerPractice.js`).

**Spaced review.** A question answered wrongly in a check or the quiz is saved. It comes back after **1 day**. Right again → **3 days**, then **7 days**, then it's mastered. Wrong at any point → back to 1 day.
- A **🔁 Review time** banner appears on the child's home screen and on Chip's path when questions are due (up to 8 a session). Otherwise the path shows when the next review is.
- Saved in `child_state.review` (no database change).

**Chip's quiz** (the ❓ Quiz tab) replaces the old card quiz for this subject. It asks up to 8 questions from the steps the child has finished (the first 3 steps before any are done), at the child's level, in mixed types, with concepts that have questions in review first. The score counts for the quiz average and the Quiz whiz badge as before. Missed questions go into review.

**Parent report.** *Progress reports → 💻 Inside a Computer: concepts* shows, for each concept started:
| Label | Meaning |
|---|---|
| **Strong** | 3 of 3 on the check, nothing left to review |
| **Getting there** | Passed, with a little left to review |
| **Needs practice** | Check not passed yet, or 2+ questions in review, or a question missed 3+ times |

It also shows the best check score and level, questions waiting and mastered, **Teach this next** (the weakest concept, with its parent tip) and the exact **questions to go over together**, with answers. On the dashboard overview, **Teach next** now picks a concept that needs practice first.
