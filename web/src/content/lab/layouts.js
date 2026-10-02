// Reference board layouts for the Circuit Lab projects: where each part goes in Guided mode.
// Steps are [type, [column, row], options], placed in order, so parts get the project's labels
// (the first bulb is L1, the second L2…). Columns A–G are 0–6, rows 1–9 are 0–8.
// Connectors join only their two ends; a connector passing over a post doesn't touch it.
// `start` is the broken board a fix-it project begins with.
// Tests prove every layout passes its project's checks (layouts.test.js).

const W = (at, dir, len) => ["wire", at, { dir, len }];
// The battery on the left, + at A3 and − at A5, with a connector from A3 up to A1.
const LEFT = [["battery", [0, 2], { dir: 1 }], W([0, 2], 3, 2)];
// The same, lower down for bigger circuits: + at A7, − at A9, connector A7 → A1.
const TALL = [["battery", [0, 6], { dir: 1 }], W([0, 6], 3, 6)];
// Close a simple loop: from C3 down to C5 and back to the battery's − at A5.
const BACK_C = [W([2, 2], 1, 2), W([2, 4], 2, 2)];

export const LAYOUTS = {
  // ── Unit 1 ──
  "lab-1-1": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["lamp", [2, 0], { dir: 1 }], ...BACK_C],
  "lab-1-2": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["motor", [2, 0], { dir: 1 }], ...BACK_C],
  "lab-1-3": [...LEFT, ["button", [0, 0], { dir: 0 }], ["lamp", [2, 0], { dir: 1 }], ...BACK_C],
  "lab-1-4": [...LEFT, ["lamp", [0, 0], { dir: 0 }], ["slide", [2, 0], { dir: 1 }], ...BACK_C],
  "lab-1-5": [["battery", [0, 4], { dir: 3 }], W([0, 2], 3, 2), ["slide", [0, 0], { dir: 0 }], ["lamp", [2, 0], { dir: 1 }], ...BACK_C],
  "lab-1-6": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["motor", [2, 2], { dir: 3 }], ...BACK_C],
  "lab-1-7": [["battery", [0, 2], { dir: 1 }], W([0, 2], 0, 2), W([0, 4], 0, 2), ["lamp", [2, 2], { dir: 1 }], W([2, 2], 0, 2), W([2, 4], 0, 2), ["slide", [4, 2], { dir: 1 }]],
  "lab-1-8": [...LEFT, ["button", [0, 0], { dir: 0 }], ["lamp", [2, 0], { dir: 1 }], ...BACK_C],

  // ── Unit 2 ──
  "lab-2-1": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["lamp", [2, 0], { dir: 0 }], ["motor", [4, 0], { dir: 1 }], W([4, 2], 1, 2), W([4, 4], 2, 4)],
  "lab-2-2": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["lamp", [2, 0], { dir: 1 }], W([2, 0], 0, 2), ["motor", [4, 0], { dir: 1 }], W([2, 2], 1, 2), W([4, 2], 1, 2), W([4, 4], 2, 2), W([2, 4], 2, 2)],
  "lab-2-3": [["battery", [0, 4], { dir: 1 }], W([0, 4], 3, 4), ["slide", [0, 0], { dir: 0 }], ["lamp", [2, 0], { dir: 1 }],
    ["button", [0, 4], { dir: 0 }], ["motor", [2, 4], { dir: 1 }], W([2, 2], 0, 2), W([4, 2], 1, 4), W([4, 6], 2, 2), W([2, 6], 2, 2)],
  "lab-2-4": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["lamp", [2, 0], { dir: 0 }], W([2, 0], 1, 2), W([4, 0], 1, 2), ["button", [2, 2], { dir: 0 }],
    ["motor", [4, 2], { dir: 1 }], W([4, 4], 2, 4)],
  "lab-2-5": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["lamp", [2, 0], { dir: 0 }], ["lamp", [4, 0], { dir: 1 }], W([4, 2], 1, 2), W([4, 4], 2, 4)],
  "lab-2-6": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["lamp", [2, 0], { dir: 1 }], W([2, 0], 0, 2), ["lamp", [4, 0], { dir: 1 }], W([2, 2], 1, 2), W([4, 2], 1, 2), W([4, 4], 2, 2), W([2, 4], 2, 2)],
  "lab-2-7": [...TALL, ["slide", [0, 0], { dir: 0 }], ["lamp", [2, 0], { dir: 1 }], W([2, 0], 0, 2), ["motor", [4, 0], { dir: 1 }], W([4, 0], 0, 2),
    ["resistor", [6, 0], { dir: 1, ohms: 100 }], ["led", [6, 2], { dir: 1, colour: "red" }],
    W([2, 2], 1, 6), W([4, 2], 1, 6), W([6, 4], 1, 4), W([6, 8], 2, 2), W([4, 8], 2, 2), W([2, 8], 2, 2)],
  "lab-2-8": [...TALL, ["slide", [0, 0], { dir: 0 }], ["slide", [2, 0], { dir: 0 }], ["lamp", [4, 0], { dir: 1 }], ["button", [2, 0], { dir: 1 }], ["lamp", [2, 2], { dir: 1 }],
    W([4, 2], 1, 6), W([2, 4], 1, 4), W([4, 8], 2, 2), W([2, 8], 2, 2)],

  // ── Unit 3 ──
  "lab-3-1": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["resistor", [2, 0], { dir: 0, ohms: 100 }], ["led", [4, 0], { dir: 1, colour: "red" }], W([4, 2], 1, 2), W([4, 4], 2, 4)],
  "lab-3-2": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["resistor", [2, 0], { dir: 0, ohms: 100 }], ["led", [4, 0], { dir: 1, colour: "red" }], W([4, 2], 1, 2), W([4, 4], 2, 4)],
  "lab-3-3": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["led", [2, 0], { dir: 1, colour: "red" }], ...BACK_C],
  "lab-3-4": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["resistor", [2, 0], { dir: 0, ohms: 100 }], ["led", [4, 0], { dir: 1, colour: "red" }], W([4, 2], 1, 2), W([4, 4], 2, 4)],
  "lab-3-5": [...LEFT, ["slide", [0, 0], { dir: 0 }], ["resistor", [2, 0], { dir: 0, ohms: 100 }], ["led", [4, 0], { dir: 1, colour: "green" }], W([4, 0], 0, 2),
    ["led", [6, 2], { dir: 3, colour: "red" }], W([6, 2], 2, 2), W([4, 2], 1, 2), W([4, 4], 2, 4)],
  "lab-3-6": [...TALL, ["slide", [0, 0], { dir: 0 }], ["resistor", [2, 0], { dir: 0, ohms: 100 }], ["led", [4, 0], { dir: 1, colour: "red" }],
    ["button", [0, 6], { dir: 0 }], ["resistor", [2, 6], { dir: 0, ohms: 100 }], ["led", [4, 6], { dir: 1, colour: "green" }],
    W([4, 2], 0, 2), W([6, 2], 1, 6), W([6, 8], 2, 2), W([4, 8], 2, 4)],
  "lab-3-7": [...TALL, ["slide", [0, 0], { dir: 0 }], ["resistor", [2, 0], { dir: 0, ohms: 100 }], ["led", [4, 0], { dir: 1, colour: "red" }],
    ["resistor", [2, 0], { dir: 1, ohms: 1000 }], ["led", [2, 2], { dir: 1, colour: "red" }], W([4, 2], 1, 6), W([2, 4], 1, 4), W([4, 8], 2, 2), W([2, 8], 2, 2)],
  "lab-3-8": [["battery", [0, 4], { dir: 1 }], W([0, 4], 3, 4), ["slide", [0, 0], { dir: 0 }], ["motor", [2, 0], { dir: 1 }], W([2, 0], 0, 2),
    ["resistor", [4, 0], { dir: 1, ohms: 100 }], ["led", [4, 2], { dir: 1, colour: "green" }], W([2, 2], 1, 4), W([4, 4], 1, 2), W([4, 6], 2, 2), W([2, 6], 2, 2)],

  // Units 4 to 11 were laid out by scripts/lab-layout.mjs, which places each circuit, joins it with
  // connectors that never lie over a part, and proves the result before printing it. To change one,
  // edit it here by hand (the tests will prove it) or re-run the script.
  // ── Unit 4 ──
  "lab-4-1": [["battery", [0, 2], { dir: 1 }], ["probe", [0, 2], { dir: 0 }], ["lamp", [2, 2], { dir: 1 }], W([0,4], 0, 2)],
  "lab-4-2": [["battery", [0, 2], { dir: 1 }], ["probe", [0, 2], { dir: 0 }], ["led", [2, 4], { dir: 2, colour: "red" }], ["resistor", [2, 2], { dir: 1, ohms: 100 }]],
  "lab-4-3": [["battery", [0, 2], { dir: 1 }], ["probe", [0, 2], { dir: 0 }], ["led", [2, 4], { dir: 2, colour: "red" }], ["resistor", [2, 2], { dir: 1, ohms: 100 }]],
  "lab-4-4": [["battery", [0, 2], { dir: 1 }], ["probe", [0, 2], { dir: 0 }], ["led", [2, 4], { dir: 2, colour: "red" }], ["resistor", [2, 2], { dir: 1, ohms: 100 }]],
  "lab-4-5": [["battery", [0, 2], { dir: 1 }], ["probe", [0, 2], { dir: 0 }], ["led", [2, 4], { dir: 2, colour: "red" }], ["resistor", [2, 2], { dir: 1, ohms: 100 }]],
  "lab-4-6": [["battery", [0, 2], { dir: 1 }], ["probe", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-4-7": [["battery", [0, 2], { dir: 1 }], ["touch", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-4-8": [["battery", [0, 2], { dir: 1 }], ["probe", [2, 2], { dir: 3 }], ["siren", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], ["led", [0, 6], { dir: 3, colour: "red" }], ["resistor", [2, 6], { dir: 2, ohms: 100 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-4-9": [["battery", [0, 2], { dir: 1 }], ["touch", [2, 2], { dir: 3 }], ["fx", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-4-10": [["battery", [0, 2], { dir: 1 }], ["probe", [0, 2], { dir: 0 }], ["led", [2, 4], { dir: 2, colour: "red" }], ["resistor", [2, 2], { dir: 1, ohms: 100 }]],

  // ── Unit 5 ──
  "lab-5-1": [["battery", [0, 2], { dir: 1 }], ["button", [0, 2], { dir: 0 }], ["motor", [2, 2], { dir: 1 }], W([0,4], 0, 2)],
  "lab-5-2": [["battery", [0, 2], { dir: 1 }], ["button", [0, 2], { dir: 0 }], ["motor", [2, 4], { dir: 2 }], ["lamp", [2, 2], { dir: 1 }]],
  "lab-5-3": [["battery", [0, 2], { dir: 1 }], ["button", [0, 2], { dir: 0 }], ["motor", [0, 4], { dir: 0 }], W([2,2], 1, 2)],
  "lab-5-4": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 0 }], ["motor", [2, 2], { dir: 1 }], W([0,4], 0, 2)],
  "lab-5-5": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 0 }], ["motor", [2, 4], { dir: 2 }], ["lamp", [2, 2], { dir: 1 }], ["button", [2, 2], { dir: 0 }], W([2,4], 0, 2), W([4,4], 3, 2)],
  "lab-5-6": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 0 }], ["motor", [2, 2], { dir: 1 }], ["melody", [4, 4], { dir: 1 }], ["speaker", [0, 6], { dir: 3 }], W([2,2], 0, 2), W([4,2], 1, 2), W([4,2], 0, 1), W([5,2], 1, 4), W([5,6], 2, 1), W([0,4], 0, 2), W([2,6], 2, 2)],
  "lab-5-7": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 0 }], ["motor", [2, 2], { dir: 1 }], ["siren", [4, 4], { dir: 1 }], ["speaker", [0, 6], { dir: 3 }], W([2,2], 0, 2), W([4,2], 1, 2), W([4,4], 1, 1), W([4,5], 1, 1), W([0,4], 0, 2), W([2,6], 2, 2)],
  "lab-5-8": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 0 }], ["motor", [2, 2], { dir: 1 }], ["fx", [4, 4], { dir: 1 }], ["led", [0, 6], { dir: 3, colour: "green" }], ["resistor", [2, 6], { dir: 2, ohms: 100 }], W([2,2], 0, 2), W([4,2], 1, 2), W([4,2], 0, 1), W([5,2], 1, 4), W([5,6], 2, 1), W([0,4], 0, 2)],

  // ── Unit 6 ──
  "lab-6-1": [["battery", [0, 2], { dir: 1 }], ["button", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-6-2": [["battery", [0, 2], { dir: 1 }], ["slide", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-6-3": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 0 }], ["siren", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,4], 0, 2), W([2,2], 3, 1), W([2,1], 0, 2), W([4,1], 1, 1), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-6-4": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 0 }], ["siren", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([2,2], 0, 1), W([3,2], 0, 1), W([0,4], 0, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-6-5": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 0 }], ["siren", [4, 2], { dir: 0 }], ["speaker", [6, 4], { dir: 1 }], W([2,2], 0, 2), W([2,2], 3, 1), W([2,1], 0, 4), W([6,1], 1, 1), W([2,2], 1, 3), W([2,5], 0, 3), W([5,5], 3, 1), W([0,4], 0, 4), W([4,4], 1, 2), W([4,6], 0, 2)],
  "lab-6-6": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 0 }], ["siren", [4, 2], { dir: 0 }], ["speaker", [6, 4], { dir: 1 }], W([2,2], 0, 2), W([4,2], 0, 1), W([5,2], 0, 1), W([2,2], 1, 3), W([2,5], 0, 3), W([5,5], 3, 1), W([0,4], 0, 4), W([4,4], 1, 2), W([4,6], 0, 2)],
  "lab-6-7": [["battery", [0, 2], { dir: 1 }], ["button", [2, 2], { dir: 3 }], ["fx", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-6-8": [["battery", [0, 2], { dir: 1 }], ["button", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["piezo", [4, 4], { dir: 1 }], W([0,4], 0, 2), W([2,4], 1, 2), W([2,6], 0, 2), W([0,2], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2)],
  "lab-6-9": [["battery", [0, 2], { dir: 1 }], ["slide", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], ["led", [0, 6], { dir: 3, colour: "green" }], ["resistor", [2, 6], { dir: 2, ohms: 100 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-6-10": [["battery", [0, 2], { dir: 1 }], ["slide", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], ["resistor", [4, 4], { dir: 1, ohms: 100 }], ["button", [4, 4], { dir: 0 }], W([2,6], 0, 2), W([4,6], 0, 2), W([6,6], 3, 2), W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2)],
  "lab-6-11": [["battery", [0, 6], { dir: 1 }], ["slide", [2, 2], { dir: 1 }], ["melody", [2, 6], { dir: 3 }], ["siren", [2, 2], { dir: 3 }], ["speaker", [4, 4], { dir: 3 }], W([0,6], 0, 2), W([0,6], 3, 4), W([0,2], 0, 2), W([0,8], 0, 4), W([4,8], 3, 2), W([4,8], 0, 1), W([5,8], 3, 6), W([5,2], 2, 1), W([2,4], 2, 1), W([1,4], 3, 4), W([1,0], 0, 1), W([4,4], 0, 2), W([6,4], 3, 4), W([6,0], 2, 2)],
  "lab-6-12": [["battery", [0, 2], { dir: 1 }], ["button", [0, 2], { dir: 3 }], ["button", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,0], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([0,2], 0, 2), W([0,4], 0, 2), W([4,4], 1, 2), W([4,6], 2, 2)],

  // ── Unit 7 ──
  "lab-7-1": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 0 }], ["led", [2, 4], { dir: 2, colour: "red" }], ["ldr", [2, 2], { dir: 1 }]],
  "lab-7-2": [["battery", [0, 2], { dir: 1 }], ["ldr", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-7-3": [["battery", [0, 2], { dir: 1 }], ["resistor", [0, 2], { dir: 0, ohms: 10000 }], ["resistor", [0, 2], { dir: 3, ohms: 100 }], ["ldr", [2, 2], { dir: 1 }], ["transistor", [2, 0], { dir: 0 }], ["led", [0, 0], { dir: 0, colour: "red" }], W([0,4], 0, 2), W([2,4], 0, 3), W([5,4], 3, 4), W([5,0], 2, 1), W([2,2], 0, 1), W([3,2], 3, 1)],
  "lab-7-4": [["battery", [0, 2], { dir: 1 }], ["resistor", [0, 2], { dir: 0, ohms: 10000 }], ["siren", [4, 4], { dir: 1 }], ["ldr", [2, 2], { dir: 1 }], ["speaker", [0, 6], { dir: 3 }], W([0,2], 3, 1), W([0,1], 0, 4), W([4,1], 1, 3), W([0,4], 0, 2), W([2,2], 0, 3), W([5,2], 1, 4), W([5,6], 2, 1), W([2,6], 2, 2)],
  "lab-7-5": [["battery", [0, 4], { dir: 1 }], ["fx", [0, 4], { dir: 3 }], ["piezo", [0, 0], { dir: 0 }], ["speaker", [2, 2], { dir: 3 }], W([0,6], 0, 2), W([2,6], 3, 2), W([2,6], 0, 1), W([3,6], 3, 6), W([3,0], 2, 1), W([0,2], 3, 2)],
  "lab-7-6": [["battery", [0, 6], { dir: 1 }], ["fx", [0, 6], { dir: 3 }], ["piezo", [0, 0], { dir: 0 }], ["led", [2, 2], { dir: 3, colour: "green" }], ["resistor", [2, 4], { dir: 3, ohms: 100 }], W([0,8], 0, 2), W([2,8], 3, 2), W([2,6], 0, 1), W([3,6], 3, 6), W([3,0], 2, 1), W([0,4], 3, 4)],
  "lab-7-7": [["battery", [0, 4], { dir: 1 }], ["melody", [0, 4], { dir: 3 }], ["piezo", [0, 0], { dir: 0 }], ["speaker", [2, 2], { dir: 3 }], W([0,6], 0, 2), W([2,6], 3, 2), W([2,6], 0, 1), W([3,6], 3, 6), W([3,0], 2, 1), W([0,2], 3, 2)],
  "lab-7-8": [["battery", [0, 2], { dir: 1 }], ["touch", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["led", [2, 6], { dir: 3, colour: "red" }], ["resistor", [4, 4], { dir: 1, ohms: 100 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([2,6], 0, 2)],
  "lab-7-9": [["battery", [0, 2], { dir: 1 }], ["ldr", [2, 2], { dir: 3 }], ["fx", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-7-10": [["battery", [0, 2], { dir: 1 }], ["slide", [2, 2], { dir: 1 }], ["ldr", [0, 2], { dir: 3 }], ["melody", [2, 2], { dir: 3 }], ["lamp", [2, 4], { dir: 2 }], ["speaker", [4, 0], { dir: 0 }], W([0,4], 1, 1), W([0,5], 0, 4), W([4,5], 3, 3), W([4,2], 0, 2), W([6,2], 3, 2), W([0,2], 0, 2), W([0,0], 0, 2)],
  "lab-7-11": [["battery", [0, 2], { dir: 1 }], ["ldr", [0, 2], { dir: 0 }], ["led", [2, 4], { dir: 2, colour: "yellow" }], ["resistor", [2, 2], { dir: 1, ohms: 100 }]],
  "lab-7-12": [["battery", [0, 6], { dir: 1 }], ["melody", [0, 6], { dir: 3 }], ["piezo", [0, 0], { dir: 0 }], ["led", [2, 2], { dir: 3, colour: "green" }], ["resistor", [2, 4], { dir: 3, ohms: 100 }], W([0,8], 0, 2), W([2,8], 3, 2), W([2,6], 0, 1), W([3,6], 3, 6), W([3,0], 2, 1), W([0,4], 3, 4)],

  // ── Unit 8 ──
  "lab-8-1": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 3 }], ["button", [0, 2], { dir: 0 }], ["led", [2, 4], { dir: 2, colour: "red" }], ["resistor", [2, 2], { dir: 1, ohms: 100 }], W([0,0], 0, 2), W([2,0], 1, 2)],
  "lab-8-2": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 3 }], ["led", [2, 4], { dir: 2, colour: "red" }], ["button", [0, 0], { dir: 0 }], ["resistor", [2, 0], { dir: 1, ohms: 100 }], W([2,4], 3, 2)],
  "lab-8-3": [["battery", [0, 2], { dir: 1 }], ["resistor", [0, 2], { dir: 0, ohms: 100 }], ["led", [2, 2], { dir: 1, colour: "red" }], ["slide", [2, 2], { dir: 0 }], W([0,4], 0, 2), W([2,4], 0, 2), W([4,4], 3, 2)],
  "lab-8-4": [["battery", [0, 2], { dir: 1 }], ["resistor", [0, 2], { dir: 0, ohms: 100 }], ["led", [2, 2], { dir: 1, colour: "red" }], ["slide", [2, 6], { dir: 3 }], ["button", [0, 6], { dir: 3 }], W([2,2], 0, 1), W([3,2], 1, 4), W([3,6], 2, 1), W([2,6], 2, 2), W([0,4], 0, 2)],
  "lab-8-5": [["battery", [0, 2], { dir: 1 }], ["resistor", [0, 2], { dir: 0, ohms: 100 }], ["led", [2, 2], { dir: 1, colour: "red" }], ["button", [4, 4], { dir: 2 }], ["slide", [2, 2], { dir: 0 }], W([0,4], 0, 2), W([4,4], 3, 2)],
  "lab-8-6": [["battery", [0, 4], { dir: 1 }], ["changeover", [0, 4], { dir: 3 }], ["lamp", [2, 6], { dir: 2 }], ["changeover", [2, 6], { dir: 3 }], W([0,2], 3, 1), W([0,1], 0, 2), W([2,1], 1, 3), W([1,2], 0, 2), W([3,2], 1, 2)],
  "lab-8-7": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 3 }], ["led", [2, 4], { dir: 2, colour: "green" }], ["slide", [0, 0], { dir: 0 }], ["resistor", [2, 2], { dir: 1, ohms: 100 }], ["button", [2, 0], { dir: 1 }]],
  "lab-8-8": [["battery", [0, 2], { dir: 1 }], ["button", [0, 2], { dir: 0 }], ["slide", [6, 2], { dir: 1 }], ["siren", [2, 2], { dir: 0 }], ["speaker", [4, 4], { dir: 0 }], ["resistor", [2, 2], { dir: 3, ohms: 10000 }], W([0,4], 0, 2), W([0,4], 1, 1), W([0,5], 0, 6), W([6,5], 3, 1), W([6,2], 2, 2), W([4,2], 3, 2), W([4,0], 2, 2)],

  // ── Unit 9 ──
  "lab-9-1": [["battery", [0, 2], { dir: 1 }], ["resistor", [0, 2], { dir: 0, ohms: 10000 }], ["siren", [4, 4], { dir: 1 }], ["slide", [2, 2], { dir: 1 }], ["speaker", [0, 6], { dir: 3 }], W([0,2], 3, 1), W([0,1], 0, 4), W([4,1], 1, 3), W([0,4], 0, 2), W([2,2], 0, 3), W([5,2], 1, 4), W([5,6], 2, 1), W([2,6], 2, 2)],
  "lab-9-2": [["battery", [0, 2], { dir: 1 }], ["button", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-9-3": [["battery", [0, 2], { dir: 1 }], ["resistor", [2, 2], { dir: 1, ohms: 10000 }], ["siren", [2, 6], { dir: 3 }], ["probe", [2, 4], { dir: 2 }], ["speaker", [6, 4], { dir: 1 }], W([0,2], 0, 2), W([2,2], 0, 3), W([5,2], 1, 3), W([5,5], 2, 1), W([5,5], 1, 2), W([5,7], 2, 3), W([2,7], 3, 1), W([2,6], 3, 1), W([0,4], 1, 4), W([0,8], 0, 4), W([4,8], 3, 2), W([4,6], 0, 2), W([4,4], 0, 2)],
  "lab-9-4": [["battery", [0, 2], { dir: 1 }], ["resistor", [0, 2], { dir: 0, ohms: 10000 }], ["melody", [4, 4], { dir: 1 }], ["probe", [2, 2], { dir: 1 }], ["speaker", [0, 6], { dir: 3 }], W([0,2], 3, 1), W([0,1], 0, 4), W([4,1], 1, 3), W([0,4], 0, 2), W([2,2], 0, 3), W([5,2], 1, 4), W([5,6], 2, 1), W([2,6], 2, 2)],
  "lab-9-5": [["battery", [0, 4], { dir: 1 }], ["slide", [2, 4], { dir: 1 }], ["resistor", [0, 4], { dir: 3, ohms: 10000 }], ["siren", [2, 4], { dir: 3 }], ["lamp", [2, 6], { dir: 2 }], ["ldr", [2, 0], { dir: 0 }], ["speaker", [4, 2], { dir: 3 }], W([0,6], 1, 1), W([0,7], 0, 4), W([4,7], 3, 3), W([4,4], 0, 1), W([5,4], 3, 4), W([5,0], 2, 1), W([0,2], 0, 2), W([2,2], 3, 2), W([0,4], 0, 2)],
  "lab-9-6": [["battery", [0, 2], { dir: 1 }], ["button", [2, 2], { dir: 3 }], ["siren", [2, 2], { dir: 0 }], ["led", [2, 6], { dir: 3, colour: "red" }], ["resistor", [4, 4], { dir: 1, ohms: 100 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([2,6], 0, 2)],
  "lab-9-7": [["battery", [0, 2], { dir: 1 }], ["probe", [6, 2], { dir: 2 }], ["siren", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], ["led", [0, 6], { dir: 3, colour: "red" }], ["resistor", [2, 6], { dir: 2, ohms: 100 }], W([0,2], 0, 2), W([0,2], 3, 1), W([0,1], 0, 6), W([6,1], 1, 1), W([6,2], 1, 3), W([6,5], 2, 3), W([3,5], 3, 1), W([0,4], 0, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-9-8": [["battery", [0, 2], { dir: 1 }], ["ldr", [4, 0], { dir: 1 }], ["siren", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([2,2], 0, 1), W([3,2], 3, 2), W([3,0], 0, 1), W([0,4], 0, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-9-9": [["battery", [0, 2], { dir: 1 }], ["touch", [4, 0], { dir: 1 }], ["siren", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([2,2], 0, 1), W([3,2], 3, 2), W([3,0], 0, 1), W([0,4], 0, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-9-10": [["battery", [0, 2], { dir: 1 }], ["slide", [0, 2], { dir: 0 }], ["slide", [6, 2], { dir: 1 }], ["siren", [2, 2], { dir: 0 }], ["speaker", [4, 4], { dir: 0 }], ["resistor", [2, 2], { dir: 3, ohms: 10000 }], W([0,4], 0, 2), W([0,4], 1, 1), W([0,5], 0, 6), W([6,5], 3, 1), W([6,2], 2, 2), W([4,2], 3, 2), W([4,0], 2, 2)],

  // ── Unit 10 ──
  "lab-10-1": [["battery", [0, 2], { dir: 1 }], ["probe", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-10-2": [["battery", [0, 2], { dir: 1 }], ["button", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["speaker", [4, 4], { dir: 0 }], ["led", [6, 2], { dir: 1, colour: "green" }], ["resistor", [4, 2], { dir: 0, ohms: 100 }], W([0,4], 0, 2), W([0,4], 1, 1), W([0,5], 0, 6), W([6,5], 3, 1), W([0,2], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2)],
  "lab-10-3": [["battery", [0, 4], { dir: 1 }], ["fx", [0, 4], { dir: 3 }], ["piezo", [0, 0], { dir: 0 }], ["speaker", [2, 2], { dir: 3 }], W([0,6], 0, 2), W([2,6], 3, 2), W([2,6], 0, 1), W([3,6], 3, 6), W([3,0], 2, 1), W([0,2], 3, 2)],
  "lab-10-4": [["battery", [0, 2], { dir: 1 }], ["button", [0, 2], { dir: 0 }], ["button", [0, 2], { dir: 3 }], ["led", [2, 4], { dir: 2, colour: "red" }], ["led", [0, 6], { dir: 3, colour: "green" }], ["resistor", [2, 2], { dir: 1, ohms: 100 }], ["resistor", [0, 0], { dir: 0, ohms: 100 }], W([0,6], 0, 3), W([3,6], 3, 6), W([3,0], 2, 1)],
  "lab-10-5": [["battery", [0, 2], { dir: 1 }], ["button", [2, 0], { dir: 1 }], ["button", [0, 2], { dir: 3 }], ["slide", [2, 0], { dir: 0 }], ["melody", [2, 4], { dir: 3 }], ["speaker", [4, 2], { dir: 0 }], W([0,2], 0, 1), W([1,2], 3, 2), W([1,0], 0, 1), W([1,2], 1, 2), W([1,4], 0, 1), W([0,4], 1, 1), W([0,5], 0, 4), W([4,5], 3, 1), W([4,4], 0, 2), W([6,4], 3, 2)],
  "lab-10-6": [["battery", [0, 4], { dir: 1 }], ["slide", [2, 4], { dir: 1 }], ["button", [2, 4], { dir: 3 }], ["button", [0, 4], { dir: 3 }], ["lamp", [2, 6], { dir: 2 }], ["led", [4, 4], { dir: 1, colour: "red" }], ["led", [6, 6], { dir: 2, colour: "green" }], ["resistor", [2, 2], { dir: 0, ohms: 100 }], ["resistor", [6, 4], { dir: 1, ohms: 100 }], W([0,4], 0, 2), W([0,6], 1, 1), W([0,7], 0, 4), W([4,7], 3, 1), W([0,2], 3, 1), W([0,1], 0, 6), W([6,1], 1, 3), W([4,4], 3, 2)],
  "lab-10-7": [["battery", [0, 2], { dir: 1 }], ["button", [6, 2], { dir: 2 }], ["siren", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], W([0,2], 0, 2), W([2,2], 0, 1), W([0,2], 3, 1), W([0,1], 0, 6), W([6,1], 1, 1), W([6,2], 1, 3), W([6,5], 2, 3), W([3,5], 3, 1), W([0,4], 0, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
  "lab-10-8": [["battery", [0, 2], { dir: 1 }], ["button", [0, 2], { dir: 0 }], ["motor", [2, 2], { dir: 1 }], W([0,4], 0, 2)],

  // ── Unit 11 ──
  "lab-11-1": [["battery", [0, 2], { dir: 1 }], ["resistor", [0, 2], { dir: 0, ohms: 10000 }], ["resistor", [0, 2], { dir: 3, ohms: 100 }], ["ldr", [2, 2], { dir: 1 }], ["transistor", [2, 0], { dir: 0 }], ["led", [0, 0], { dir: 0, colour: "yellow" }], W([0,4], 0, 2), W([2,4], 0, 3), W([5,4], 3, 4), W([5,0], 2, 1), W([2,2], 0, 1), W([3,2], 3, 1)],
  "lab-11-2": [["battery", [0, 4], { dir: 1 }], ["changeover", [0, 4], { dir: 3 }], ["led", [4, 6], { dir: 2, colour: "yellow" }], ["led", [2, 4], { dir: 1, colour: "yellow" }], ["resistor", [0, 2], { dir: 3, ohms: 100 }], ["resistor", [2, 2], { dir: 1, ohms: 100 }], W([0,6], 0, 2), W([1,2], 0, 1), W([4,6], 3, 6), W([4,0], 2, 4)],
  "lab-11-3": [["battery", [0, 2], { dir: 1 }], ["resistor", [0, 2], { dir: 0, ohms: 10000 }], ["siren", [4, 4], { dir: 1 }], ["ldr", [2, 2], { dir: 1 }], ["speaker", [2, 6], { dir: 2 }], ["led", [0, 8], { dir: 3, colour: "yellow" }], ["resistor", [2, 6], { dir: 1, ohms: 100 }], W([0,4], 0, 2), W([0,4], 1, 2), W([0,2], 3, 1), W([0,1], 0, 4), W([4,1], 1, 3), W([2,2], 0, 3), W([5,2], 1, 4), W([5,6], 2, 1), W([0,8], 0, 2)],
  "lab-11-4": [["battery", [0, 4], { dir: 1 }], ["slide", [2, 4], { dir: 1 }], ["resistor", [0, 4], { dir: 3, ohms: 10000 }], ["melody", [2, 4], { dir: 3 }], ["lamp", [2, 6], { dir: 2 }], ["ldr", [2, 0], { dir: 0 }], ["speaker", [4, 2], { dir: 3 }], W([0,6], 1, 1), W([0,7], 0, 4), W([4,7], 3, 3), W([4,4], 0, 1), W([5,4], 3, 4), W([5,0], 2, 1), W([0,2], 0, 2), W([2,2], 3, 2), W([0,4], 0, 2)],
  "lab-11-5": [["battery", [0, 2], { dir: 1 }], ["slide", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["button", [6, 2], { dir: 1 }], ["speaker", [4, 4], { dir: 0 }], ["slide", [2, 0], { dir: 0 }], ["resistor", [4, 0], { dir: 1, ohms: 10000 }], W([0,4], 0, 2), W([0,4], 1, 1), W([0,5], 0, 6), W([6,5], 3, 1), W([0,2], 0, 2), W([4,2], 0, 2)],
  "lab-11-6": [["battery", [0, 2], { dir: 1 }], ["ldr", [0, 2], { dir: 3 }], ["motor", [0, 2], { dir: 0 }], ["transistor", [4, 4], { dir: 2 }], W([0,4], 0, 2), W([0,0], 0, 3), W([3,0], 1, 3), W([2,2], 0, 3), W([5,2], 1, 2), W([5,4], 2, 1)],
  "lab-11-7": [["battery", [0, 2], { dir: 1 }], ["button", [2, 2], { dir: 3 }], ["melody", [2, 2], { dir: 0 }], ["speaker", [2, 6], { dir: 3 }], ["led", [0, 6], { dir: 3, colour: "green" }], ["resistor", [2, 6], { dir: 2, ohms: 100 }], W([0,2], 0, 2), W([0,4], 0, 2), W([2,0], 0, 2), W([4,0], 1, 2), W([4,4], 1, 2), W([4,6], 2, 2)],
};

// Fix-it projects start from a broken board: the same layout with the fault in it.
export const STARTS = {
  "lab-3-2": LAYOUTS["lab-3-2"].map(([t, at, o]) => (t === "led" ? ["led", [4, 2], { dir: 3, colour: "red" }] : [t, at, o])),
  "lab-3-4": LAYOUTS["lab-3-4"].map(([t, at, o]) => (t === "resistor" ? [t, at, { ...o, ohms: 10000 }] : [t, at, o])),
};
