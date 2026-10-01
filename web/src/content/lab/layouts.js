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
};

// Fix-it projects start from a broken board: the same layout with the fault in it.
export const STARTS = {
  "lab-3-2": LAYOUTS["lab-3-2"].map(([t, at, o]) => (t === "led" ? ["led", [4, 2], { dir: 3, colour: "red" }] : [t, at, o])),
  "lab-3-4": LAYOUTS["lab-3-4"].map(([t, at, o]) => (t === "resistor" ? [t, at, { ...o, ohms: 10000 }] : [t, at, o])),
};
