// Ready-made boards for the Circuit Lab's "Try an example" buttons. Each step is
// [type, [column, row], options], placed in order like a child would.
export const EXAMPLES = [
  { id: "light", emoji: "💡", title: "Light it up",
    steps: [["battery", [0, 2], { dir: 3 }], ["slide", [0, 0], { dir: 0 }], ["lamp", [2, 0], { dir: 1 }], ["wire", [2, 2], { dir: 2, len: 2 }]] },
  { id: "doorbell", emoji: "🔔", title: "Musical doorbell",
    steps: [
      ["battery", [0, 2], { dir: 1 }], ["melody", [2, 2], { dir: 0 }],
      ["wire", [0, 2], { dir: 0, len: 2 }], ["wire", [0, 4], { dir: 0, len: 2 }],
      ["button", [2, 0], { dir: 0 }], ["wire", [2, 0], { dir: 1, len: 2 }], ["wire", [4, 0], { dir: 1, len: 2 }],
      ["speaker", [4, 4], { dir: 1 }], ["wire", [2, 4], { dir: 1, len: 2 }], ["wire", [2, 6], { dir: 0, len: 2 }],
    ] },
  { id: "fan", emoji: "🌀", title: "Fan and light together",
    steps: [
      ["battery", [0, 4], { dir: 3 }], ["slide", [0, 2], { dir: 3 }], ["wire", [0, 0], { dir: 0, len: 2 }],
      ["lamp", [2, 0], { dir: 1 }], ["motor", [4, 2], { dir: 3 }], ["wire", [2, 0], { dir: 0, len: 2 }],
      ["wire", [2, 2], { dir: 0, len: 2 }], ["wire", [2, 2], { dir: 1, len: 2 }], ["wire", [0, 4], { dir: 0, len: 2 }],
    ] },
];
