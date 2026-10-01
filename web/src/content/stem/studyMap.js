// The STEM study map: four levels × four strands. Every lesson, Circuit Lab unit and badge sits on
// it, and the baseline check places each child on it. Plain data; see docs/10-stem-study-map.md.
// `from` names what already teaches an outcome: a module id ("computer"), a Circuit Lab unit
// ("lab:3"), or "planned" for topics we will add later.

export const MAP_LEVELS = [
  { id: "explorer", emoji: "🌱", name: "Explorer", classes: [1, 2], ages: "6–7", note: "Notice, sort and try: loops, light, sound and materials." },
  { id: "builder", emoji: "🔧", name: "Builder", classes: [3, 4, 5], ages: "8–10", note: "Build and compare: series and parallel, LEDs, motors and sensors." },
  { id: "inventor", emoji: "💡", name: "Inventor", classes: [6, 7, 8], ages: "11–13", note: "Make it decide: logic, alarms and control." },
  { id: "engineer", emoji: "🚀", name: "Engineer", classes: [9, 10], ages: "14–16 and grown-ups", note: "Measure and design: voltage, current and designing to a brief." },
];
export const levelForClass = c => (c >= 9 ? "engineer" : c >= 6 ? "inventor" : c >= 3 ? "builder" : "explorer");

export const STRANDS = [
  { id: "science", emoji: "🔬", name: "Science", note: "How the world works: energy, electricity, light, sound and materials." },
  { id: "technology", emoji: "💻", name: "Technology", note: "How computers and digital things work." },
  { id: "engineering", emoji: "🛠️", name: "Engineering", note: "Building, testing and improving things: the Circuit Lab and the design cycle." },
  { id: "maths", emoji: "📐", name: "Maths", note: "Numbers, measuring and data, used in real projects." },
];

// "I can…" outcomes for each strand at each level.
export const OUTCOMES = {
  science: {
    explorer: [
      { can: "I can say what electricity needs to flow (a complete loop).", from: ["lab:1", "electricity"] },
      { can: "I can sort materials into ones that let electricity through and ones that don't.", from: ["lab:4"] },
      { can: "I can name things that make light, movement and sound.", from: ["lab:1", "lab:6"] },
    ],
    builder: [
      { can: "I can explain series and parallel, and predict which is brighter.", from: ["lab:2"] },
      { can: "I can explain why some parts work only one way round.", from: ["lab:1", "lab:3"] },
      { can: "I can explain how sensors notice light, sound and touch.", from: ["lab:7"] },
      { can: "I can explain how sound is made by vibrations.", from: ["lab:6"] },
    ],
    inventor: [
      { can: "I can explain resistance and how it controls current.", from: ["lab:3", "lab:7"] },
      { can: "I can explain energy changes in a circuit (electrical to light, motion, sound).", from: ["lab:5", "lab:6"] },
      { can: "I can explain magnets and electromagnets.", from: ["planned"] },
    ],
    engineer: [
      { can: "I can use voltage, current and resistance (Ohm's law) to explain a circuit.", from: ["lab:3", "lab:11"] },
      { can: "I can explain how a transistor switches and amplifies.", from: ["lab:7", "lab:11"] },
    ],
  },
  technology: {
    explorer: [
      { can: "I can say what a computer is and name its parts.", from: ["computer"] },
      { can: "I can follow and give step-by-step instructions.", from: ["coding"] },
    ],
    builder: [
      { can: "I can explain input, process and output.", from: ["computer"] },
      { can: "I can count and write numbers in binary.", from: ["binary"] },
      { can: "I can type with the right fingers.", from: ["typing"] },
    ],
    inventor: [
      { can: "I can explain how a key press reaches the screen.", from: ["computer"] },
      { can: "I can explain how chips follow a program (sound chips, logic).", from: ["lab:6", "lab:8"] },
      { can: "I can build AND, OR and NOT and explain where computers use them.", from: ["lab:8", "electricity"] },
    ],
    engineer: [
      { can: "I can explain how logic gates add numbers and remember.", from: ["electricity"] },
      { can: "I can write a simple program with loops and decisions.", from: ["coding", "planned"] },
    ],
  },
  engineering: {
    explorer: [
      { can: "I can build a circuit from a picture and test it.", from: ["lab:1"] },
      { can: "I can find and fix a broken loop.", from: ["electricity", "lab:1"] },
    ],
    builder: [
      { can: "I can choose the right parts for a job and explain why.", from: ["lab:2", "lab:5"] },
      { can: "I can make a prediction, test it and say what happened.", from: ["lab:2", "lab:3"] },
      { can: "I can build simple games and gadgets.", from: ["lab:10"] },
    ],
    inventor: [
      { can: "I can design alarms and safety systems.", from: ["lab:9"] },
      { can: "I can follow the design cycle: Ask, Imagine, Plan, Build, Test, Improve.", from: ["lab:11"] },
    ],
    engineer: [
      { can: "I can design a circuit from a brief and prove it works with tests.", from: ["lab:11"] },
      { can: "I can explain safety: short circuits, fuses and mains electricity.", from: ["lab:1", "lab:3"] },
    ],
  },
  maths: {
    explorer: [
      { can: "I can count, add and take away to 20.", from: ["numbers", "mathematics"] },
    ],
    builder: [
      { can: "I can multiply, divide and solve money problems.", from: ["mathematics"] },
      { can: "I can count combinations (2 switches make 4).", from: ["lab:6", "lab:8"] },
    ],
    inventor: [
      { can: "I can use fractions, decimals and percentages.", from: ["mathematics"] },
      { can: "I can read and make truth tables.", from: ["lab:8"] },
    ],
    engineer: [
      { can: "I can rearrange a formula (V = I × R).", from: ["mathematics", "lab:11"] },
      { can: "I can record measurements and draw a graph.", from: ["planned"] },
    ],
  },
};

// The baseline check (built in release 8): a short adaptive quiz per strand plus one hands-on build.
export const BASELINE = {
  minutes: 12,
  itemsPerStrand: 6,
  startAt: "the level for the child's class",
  rule: "Two right in a row at a level → try the next level up; two wrong → step down. Stop after 6 items.",
  placement: "A strand's level is the highest level where the child got at least 2 of 3 right.",
  handsOn: { project: "lab-1-1", task: "Make the bulb light: the child picks the parts from a tray and builds the loop." },
  retake: "Every term, to show growth. Parents see a before-and-after chart.",
};

// Sample items, one per strand and level, in the concept-question format (choice / tf / order).
// The full bank (about 12 per strand and level) comes with the baseline release.
export const BASELINE_SAMPLES = [
  { strand: "science", level: "explorer", type: "choice", q: "Which one will let electricity through?", options: ["🥄 A metal spoon", "📏 A plastic ruler", "📄 Paper"], answer: 0 },
  { strand: "science", level: "builder", type: "choice", q: "Two bulbs are in a row (series). Compared with one bulb, they are…", options: ["Dimmer", "Brighter", "Just the same"], answer: 0 },
  { strand: "science", level: "inventor", type: "choice", q: "A 1000 Ω resistor replaces a 100 Ω one. The LED will be…", options: ["Dimmer", "Brighter", "Unchanged"], answer: 0 },
  { strand: "science", level: "engineer", type: "choice", q: "A 3 V battery drives 0.01 A through a resistor. What is its resistance?", options: ["300 Ω", "30 Ω", "0.03 Ω"], answer: 0 },
  { strand: "technology", level: "explorer", type: "tf", q: "A computer can think and decide things all by itself.", answer: false },
  { strand: "technology", level: "builder", type: "choice", q: "What is 5 in binary?", options: ["101", "110", "5"], answer: 0 },
  { strand: "technology", level: "inventor", type: "choice", q: "A lift moves only if the door is shut AND a button is pressed. Which gate is that?", options: ["AND", "OR", "NOT"], answer: 0 },
  { strand: "technology", level: "engineer", type: "choice", q: "Which two gates make a circuit that adds two bits?", options: ["XOR and AND", "OR and NOT", "Two NOTs"], answer: 0 },
  { strand: "engineering", level: "explorer", type: "order", q: "Put the steps in order to light a bulb.", items: ["Get a battery, a switch and a bulb", "Connect them in a loop", "Switch ON", "The bulb glows"] },
  { strand: "engineering", level: "builder", type: "choice", q: "Your doorbell doesn't ring. What do you check FIRST?", options: ["The battery and the loose wires", "Buy a new doorbell", "Paint the button"], answer: 0 },
  { strand: "engineering", level: "inventor", type: "order", q: "Put the design cycle in order.", items: ["Ask", "Imagine", "Plan", "Build", "Test", "Improve"] },
  { strand: "engineering", level: "engineer", type: "choice", q: "An alarm should sound when a wire is CUT. The best design makes the alarm sound when…", options: ["A loop is broken", "A loop is closed", "The battery is new"], answer: 0 },
  { strand: "maths", level: "explorer", type: "choice", q: "3 friends and you. How many people?", options: ["4", "3", "5"], answer: 0 },
  { strand: "maths", level: "builder", type: "choice", q: "Each pizza has 8 slices. How many pizzas for 18 slices?", options: ["3", "2", "18"], answer: 0 },
  { strand: "maths", level: "inventor", type: "choice", q: "3 switches, each ON or OFF. How many combinations?", options: ["8", "6", "3"], answer: 0 },
  { strand: "maths", level: "engineer", type: "choice", q: "V = I × R. If V = 6 and R = 3, what is I?", options: ["2", "18", "0.5"], answer: 0 },
];
