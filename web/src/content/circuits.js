// Volt's circuit adventure: from a simple loop to logic gates and a tiny computer.
// Each part says which class (standard) it is designed for. Children below that class
// unlock steps one by one; children in that class or above can open the part straight away.

export const CIRCUIT_PARTS = [
  { id: "A", title: "Part A · Circuit basics", who: "Everyone, from 2nd standard", note: "Loops, switches, conductors and parts." },
  { id: "B", title: "Part B · Switches that think", who: "After Part A · open from 4th standard", note: "Wiring switches together makes decisions. These are logic gates. Younger children play the AND and OR puzzles." },
  { id: "C", title: "Part C · Thinking machines", who: "After Part B · open from 6th standard", note: "Gates that add numbers and remember, like a real computer." },
  { id: "W", title: "Free workshop", who: "After step 4 · open from 4th standard", note: "Build any circuit you like, with parts or with gates." },
];

const A = { part: "A", openFrom: 5 }, B = { part: "B", openFrom: 4 }, C = { part: "C", openFrom: 6 };

export const CIRCUIT_JOURNEY = [
  { id: "circuit-step-1", ...A, emoji: "🔄", title: "Close the loop", blurb: "Switch ON, the bulb glows.",
    learned: "Electricity only flows around a complete loop. A switch opens and closes the loop.",
    parent: "Flip a light switch together. Ask: where is the loop? (From the power, through the switch, through the bulb, and back.)" },
  { id: "circuit-step-2", ...A, emoji: "🔍", title: "Loop detective", blurb: "Find the broken wire.",
    learned: "If there is a gap anywhere in the loop, nothing works. Fixing the gap fixes the circuit.",
    parent: "When a toy stops working, check the batteries and loose wires together: you're being loop detectives." },
  { id: "circuit-step-3", ...A, emoji: "🥄", title: "Will it light?", blurb: "Test spoons, coins, paper…",
    learned: "Metals let electricity through (conductors). Plastic, rubber, paper and wood stop it (insulators).",
    parent: "Look at a charger cable: metal inside to carry electricity, plastic outside to keep hands safe." },
  { id: "circuit-step-4", ...A, emoji: "🔁", title: "Swap the part", blurb: "Bulb, motor, buzzer, LED.",
    learned: "The same loop can power light, movement or sound. An LED only works one way round.",
    parent: "Find a motor (fan), a buzzer (microwave beep) and an LED (TV standby light) at home." },
  { id: "circuit-step-5", ...A, emoji: "🎚️", title: "Brighter or dimmer", blurb: "More batteries, or a knob.",
    learned: "More batteries push more electricity. A resistor knob holds some back, like a fan regulator.",
    parent: "Turn the fan regulator step by step together and watch the speed change." },

  { id: "circuit-step-6", ...B, emoji: "🔒", title: "Both switches: AND", blurb: "Lid locked AND button pressed.",
    learned: "Two switches in a row: the loop works only when BOTH are ON. This is called AND.",
    parent: "A mixer grinder only runs when the lid is locked AND the switch is on. Find other AND machines (a lift: door closed AND button pressed)." },
  { id: "circuit-step-7", ...B, emoji: "🚪", title: "Either switch: OR", blurb: "Any car door turns on the light.",
    learned: "Two switches side by side: the loop works when EITHER one is ON. This is called OR.",
    parent: "In a car, opening any door turns on the inside light. A house with two doorbell buttons is another OR." },
  { id: "circuit-step-8", ...B, emoji: "🌙", title: "The upside-down switch: NOT", blurb: "Light ON when it's NOT day.",
    learned: "A NOT switch does the opposite: pressed means OFF, not pressed means ON.",
    parent: "Street lights switch ON when it is NOT daytime. The fridge light is ON when the door is NOT closed." },
  { id: "circuit-step-9", ...B, emoji: "🪜", title: "Staircase switch: XOR", blurb: "Two switches, one light.",
    learned: "With a staircase switch, flipping EITHER switch changes the light. This is called XOR.",
    parent: "Find a two-way switch at home (stairs or a long corridor) and try it from both ends." },
  { id: "circuit-step-10", ...B, emoji: "🧲", title: "Electric fingers", blurb: "A switch pressed by electricity.",
    learned: "A relay or transistor is a switch pressed by electricity instead of a finger. Chips have billions of transistors.",
    parent: "Listen for the click of a relay when an inverter or a washing machine switches on." },
  { id: "circuit-step-11", ...B, emoji: "🚦", title: "Meet the gates", blurb: "AND, OR, NOT, XOR symbols.",
    learned: "Engineers draw switch circuits as gate symbols. Each gate has a truth table: what it does for every input.",
    parent: "Ask your child to explain AND and OR with a real example. Truth tables are just “what happens if…” lists." },
  { id: "circuit-step-12", ...B, emoji: "🕵️", title: "Gate detective", blurb: "Pick the right gate.",
    learned: "Real machines use gates to decide: seatbelt alarms, lifts, mixers and doorbells.",
    parent: "Invent a rule together (“the fan runs if it is hot AND someone is in the room”) and name the gate." },

  { id: "circuit-step-13", ...C, emoji: "➕", title: "Adding machine", blurb: "Gates that add 1 + 1.",
    learned: "An XOR gate and an AND gate together add two bits. 1 + 1 = 10 in binary (that's two).",
    parent: "Connect this to Binary Magic: every sum a computer does is built from tiny adders like this one." },
  { id: "circuit-step-14", ...C, emoji: "🧮", title: "Bigger adder", blurb: "Add two 4-bit numbers.",
    learned: "Chaining adders lets a computer add big numbers. The carry passes from one adder to the next.",
    parent: "Do a column addition on paper with carrying. The adder does exactly the same, in binary." },
  { id: "circuit-step-15", ...C, emoji: "💾", title: "A circuit that remembers", blurb: "Set, reset, remember.",
    learned: "Two gates feeding each other can remember ON or OFF. This is how memory (RAM) stores bits.",
    parent: "Ask: why does a computer forget things in RAM when the power goes off? (The loop that remembers needs electricity.)" },

  { id: "circuit-workshop", part: "W", bonus: true, quiet: true, after: "circuit-step-4", openFrom: 4, emoji: "🛠️", title: "Free workshop", blurb: "Build anything you like.",
    learned: "You can design your own circuits and gate machines.",
    parent: "Challenge your child to rebuild a real device: a doorbell, a staircase light or a seatbelt alarm." },
];
