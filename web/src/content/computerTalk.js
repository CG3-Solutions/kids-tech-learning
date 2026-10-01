// Chip's conversation and mission for "Inside a Computer": follow a key press from your finger to
// the screen. Plain data (Conversation.jsx script format), written for children everywhere.

export const CHIP_TALK_KEY = [
  { say: "Hi {name}! I'm Chip. Try this: press a key on a keyboard, and the letter appears on the screen. Instantly!" },
  { ask: "How do you think the letter gets from the key to the screen?",
    choices: [
      { label: "✨ Magic!", right: false, reply: "It does feel like magic! But really, a team of parts passes the letter along, super fast." },
      { label: "⌨️ The keyboard draws it on the screen", right: false, reply: "Good thinking: the keyboard starts it! But a keyboard can't draw. Other parts do the rest." },
      { label: "🔲 The computer works it out", right: true, reply: "Yes! The keyboard tells the computer, the computer works it out, and the screen shows it." },
    ] },
  { say: "If you did Bit's mission, you know computers only understand ON and OFF. So the letter H becomes a number, 72, and the number becomes ONs and OFFs: 01001000.", pic: "H → 72 → 01001000" },
  { ask: "How long do you think the whole trip takes, from your finger to the screen?",
    choices: [
      { label: "⏱️ About a minute", right: false, reply: "Much faster than that! Less time than a blink of your eye." },
      { label: "👁️ Less than a blink", right: true, reply: "Yes! Less time than a blink. Computers are fast." },
      { label: "📅 A whole day", right: false, reply: "Ha! Much, much faster: less time than a blink of your eye." },
    ] },
  { say: "On this path you'll meet every part the letter travels through: input, the CPU, memory and output. Then comes your mission: follow a key press all the way from your finger to the screen!", pic: "⌨️ → 🔲 → 🗂️ → 🖥️" },
];

// The six stops of a key press. `say` is for everyone; `deeper` adds detail for Class 8 and up.
// "{L}" is the letter, "{code}" its number, "{bits}" its 8 bits.
export const KEY_STOPS = [
  { id: "key", emoji: "⌨️", name: "The keyboard", short: "Keys",
    say: "Under the {L} key, two tiny contacts touch: a switch closes! The keyboard's little chip notices which key it is and sends a code for it.",
    deeper: "The keys sit on a grid of wires. The keyboard's microcontroller scans the grid hundreds of times a second and sends a “scan code” for the key, not the letter itself." },
  { id: "travel", emoji: "🔌", name: "The trip", short: "Trip",
    say: "The code travels to the computer as ONs and OFFs, through the cable, or by radio waves for a wireless keyboard.",
    deeper: "With USB the bits travel down the wires in small packets; Bluetooth keyboards send the same packets by radio." },
  { id: "cpu", emoji: "🔲", name: "The CPU", short: "CPU",
    say: "The CPU follows the instructions of the app you're typing in. The instructions say: a key was pressed, so add {L} to the text and show it.",
    deeper: "The key press interrupts the CPU. The operating system turns the scan code into the letter's number ({code}) and passes it to the app as an event." },
  { id: "memory", emoji: "🗂️", name: "Memory", short: "Memory",
    say: "The text is kept in memory (RAM) as numbers. {L} is stored as {code}, which is {bits} in ONs and OFFs.",
    deeper: "Each letter takes at least one byte in RAM. Nothing is saved to storage until you press Save, which is why a power cut loses unsaved work." },
  { id: "draw", emoji: "🎨", name: "Drawing the letter", short: "Drawing",
    say: "The computer looks up how {L} is drawn in the font, and works out which tiny dots (pixels) on the screen to light up.",
    deeper: "The graphics chip (GPU) draws the letter's shape into a picture of the whole screen kept in memory, called the frame buffer." },
  { id: "screen", emoji: "🖥️", name: "The screen", short: "Screen",
    say: "The screen lights up those pixels, and there's your {L}! The screen redraws itself about 60 times every second, so it appears almost at once.",
    deeper: "At 60 Hz, a new picture is sent to the screen every 16.7 milliseconds. The whole trip, from key to screen, usually takes less than a tenth of a second." },
];

// Letter shapes, 5 pixels wide and 7 tall (1 = lit). Used to show how a letter becomes pixels.
export const FONT_5x7 = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"], B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"], D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"], F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"], H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"], J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"], L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"], N: ["10001", "10001", "11001", "10101", "10011", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"], P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"], R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"], T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"], V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"], X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"], Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
};

export const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
