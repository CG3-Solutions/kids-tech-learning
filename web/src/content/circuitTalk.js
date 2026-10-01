// Volt's conversation and mission for "Electricity & Parts": build a doorbell.
// Plain data (Conversation.jsx script format), written for children everywhere.

export const VOLT_TALK_BELL = [
  { say: "Hi {name}! I'm Volt, a battery. Ding-dong! Someone is at the door. Can I ask you something about that?" },
  { ask: "How did the bell know someone was there?",
    choices: [
      { label: "👂 The bell heard the knock", right: false, reply: "Good thinking, but a bell can't hear! It rings even if nobody knocks. Something else tells it." },
      { label: "🔘 Pressing the button sent electricity to the bell", right: true, reply: "Yes! The button by the door sends electricity to the bell inside." },
      { label: "✨ Magic!", right: false, reply: "It does feel like magic! But it's electricity, and you can build it yourself." },
    ] },
  { ask: "The button is outside, by the door. The bell is inside the house. How does the electricity get from one to the other?",
    choices: [
      { label: "〰️ Through wires", right: true, reply: "Yes! Metal wires run inside the wall, from the button to the bell." },
      { label: "📡 Through the air", reply: "Some doorbells really do that! Wireless doorbells send a radio signal. But most doorbells use wires, so let's build one with wires." },
    ] },
  { say: "Electricity is like water in a pipe. It needs a complete loop: out of the battery, through the button, through the bell, and back to the battery.", pic: "🔋 → 🔘 → 🔔 → 🔋" },
  { ask: "When nobody presses the button, why doesn't the bell ring all the time?",
    choices: [
      { label: "🔓 There's a gap in the loop, inside the button", right: true, reply: "Exactly! Inside the button are two metal pieces that don't touch. The gap stops the electricity." },
      { label: "😴 The bell is sleeping", right: false, reply: "Ha! Bells don't sleep. There's a gap in the loop, inside the button, that stops the electricity." },
      { label: "🔋 The battery switches itself off", right: false, reply: "The battery is always ready to push! A gap inside the button stops the electricity." },
    ] },
  { ask: "Pressing the button closes the gap, and the bell rings. When you let go, the ringing stops. Why?",
    choices: [
      { label: "🌀 A spring pushes the button back and opens the gap", right: true, reply: "Yes! A little spring pushes the button back up, the gap opens, and the loop is broken again." },
      { label: "🥱 The bell gets tired", right: false, reply: "Not tired! A little spring pushes the button back up. The gap opens, and the electricity stops." },
    ] },
  { say: "One important safety rule: the electricity in the wall sockets at home is strong enough to hurt you. We build only with batteries. Only an electrician opens the wiring in the walls.", pic: "🔋 ✅    🔌 ⛔" },
  { say: "On this path you'll learn about loops, switches, which things let electricity through, and parts that make light, movement and sound. Then comes your mission: build a doorbell!", pic: "🔋 + 🔘 + 🔔 = 🏠" },
];

// Step 1 of the mission: pick the parts. `need` marks the four a doorbell needs.
export const BELL_PARTS = [
  { id: "battery", emoji: "🔋", name: "Battery", need: true, reply: "Yes! The battery pushes the electricity round the loop." },
  { id: "switch", emoji: "🎚️", name: "Light switch", need: false, reply: "A light switch stays ON after you press it, so the bell would ring all night! A doorbell needs a button that springs back." },
  { id: "button", emoji: "🔘", name: "Push button", need: true, reply: "Yes! A push button closes the loop only while you press it. Then a spring pushes it back." },
  { id: "bulb", emoji: "💡", name: "Bulb", need: false, reply: "A bulb makes light, not sound. (Some homes do have a flashing-light doorbell, for people who can't hear a bell!) For our bell, find something that makes a sound." },
  { id: "buzzer", emoji: "🔔", name: "Buzzer", need: true, reply: "Yes! The buzzer turns electricity into sound." },
  { id: "ruler", emoji: "📏", name: "Plastic ruler", need: false, reply: "Plastic stops electricity: it's an insulator. We need metal wires to carry it." },
  { id: "wires", emoji: "〰️", name: "Metal wires", need: true, reply: "Yes! Metal wires carry the electricity from the button to the bell." },
  { id: "motor", emoji: "⚙️", name: "Motor", need: false, reply: "A motor spins round, but it doesn't ring. Find something that makes a sound." },
];

// Step 3: a neighbour's doorbell won't ring. Find the problem.
export const BELL_FAULTS = [
  { id: "gap", say: "Oh no! Your neighbour's doorbell won't ring. They press the button, but nothing happens. Can you find the problem? Tap it!", fixed: "A broken wire! Now the loop is complete again." },
  { id: "plastic", say: "Another doorbell won't ring! Someone fixed a wire with something odd. Tap the problem.", fixed: "A piece of plastic in the loop! Plastic is an insulator. Swapping it for metal wire fixes the loop." },
  { id: "flat", say: "One more! All the wires look fine this time, and nothing is in the way. What else could stop the bell? Tap it.", fixed: "The battery was flat, with no push left in it. A new battery, and ding-dong!" },
];

// "Go deeper" notes (Class 8 and up, and grown-ups), one per mission stage.
export const BELL_DEEPER = {
  test: "A classic electric bell uses an electromagnet. When current flows, the magnet pulls a hammer onto the bell, and that movement breaks the circuit. The magnet lets go, the hammer springs back, the circuit closes again… about 20 times a second. It's called a make-and-break circuit.",
  fix: "Electricians find faults with a multimeter. It measures the battery's voltage (a flat 1.5 V cell may read 1.1 V or less), and its continuity setting beeps when a wire makes a complete path.",
  doors: "Buttons in a row are in SERIES: the current must pass through both, so both must be closed. Buttons side by side are in PARALLEL: each one gives the current its own path. Parallel wiring is also why one broken bulb doesn't switch off every light in a house.",
  done: "Wired doorbells at home use a transformer that brings the mains voltage down to about 8 to 24 volts, which is safer. Wireless doorbells have a tiny radio transmitter and a coin battery in the button; smart doorbells add a camera and Wi-Fi.",
};
