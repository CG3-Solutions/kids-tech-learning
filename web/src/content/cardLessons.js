// Mini-lessons for cards: meet the part → play with it → answer one question → star.
// Keyed by card id, so they work whether the card text comes from this app or the database.
// A card without an entry here opens as a plain reading card.
//   meet:  one short sentence, read aloud
//   toy:   which hands-on toy to show (see CardLesson.jsx)
//   play:  what to do in the toy
//   check: one question with picture answers; `ok` marks the right one
export const CARD_LESSONS = {
  "el-electricity": {
    meet: "Electricity is energy we cannot see. It makes lights glow and fans spin.",
    toy: "power", play: "Switch the power ON. Then make a power cut!",
    check: { q: "There is a power cut. Which one stops working?", options: [{ e: "🚲", label: "Bicycle" }, { e: "🌀", label: "Fan", ok: true }, { e: "📖", label: "Book" }], why: "The fan needs electricity. A bicycle and a book do not." },
  },
  "el-circuit": {
    meet: "Electricity needs a full loop to travel around. That loop is called a circuit.",
    toy: "loop", play: "The loop has a gap. Tap the gap to close it!",
    check: { q: "The loop has a gap. What does the bulb do?", options: [{ e: "🌑", label: "It goes off", ok: true }, { e: "💡", label: "It keeps glowing" }, { e: "✨", label: "It gets brighter" }], why: "A gap anywhere stops the electricity, so the bulb goes off." },
  },
  "el-battery": {
    meet: "A battery stores energy. It pushes electricity around the loop.",
    toy: "battery", play: "The bulb has no power. Put the battery in!",
    check: { q: "Which one has a battery inside?", options: [{ e: "🥄", label: "Spoon" }, { e: "🪑", label: "Chair" }, { e: "📺", label: "TV remote", ok: true }], why: "A TV remote needs batteries to work." },
  },
  "el-wire": {
    meet: "A wire is a road for electricity. Metal inside, plastic outside to keep hands safe.",
    toy: "wire", play: "Fill the gap. Which things let electricity through?",
    check: { q: "Which one lets electricity pass through?", options: [{ e: "🧵", label: "String" }, { e: "🥄", label: "Metal spoon", ok: true }, { e: "🥤", label: "Plastic straw" }], why: "Metal lets electricity through. String and plastic do not." },
  },
  "el-switch": {
    meet: "A switch opens and closes the loop. ON lets electricity flow. OFF stops it.",
    toy: "switch", play: "Tap the switch ON. Then tap it OFF.",
    check: { q: "You press the switch OFF. What happens to the fan?", options: [{ e: "💨", label: "It spins faster" }, { e: "🛑", label: "It stops", ok: true }, { e: "🔁", label: "It spins backwards" }], why: "OFF opens the loop, so the electricity stops and the fan stops." },
  },
  "el-bulb": {
    meet: "A bulb turns electricity into light.",
    toy: "bulb", play: "Add batteries. Make the bulb as bright as you can!",
    check: { q: "What does a bulb turn electricity into?", options: [{ e: "🔊", label: "Sound" }, { e: "🌀", label: "Spinning" }, { e: "💡", label: "Light", ok: true }], why: "A bulb makes light." },
  },
  "el-buzzer": {
    meet: "A buzzer turns electricity into sound. Beep!",
    toy: "buzzer", play: "Press the red button 3 times to make it beep.",
    check: { q: "What does a buzzer turn electricity into?", options: [{ e: "🔊", label: "Sound", ok: true }, { e: "💡", label: "Light" }, { e: "🌀", label: "Spinning" }], why: "A buzzer makes sound." },
  },
  "el-motor": {
    meet: "A motor turns electricity into spinning. Every fan has one.",
    toy: "motor", play: "Switch it ON. Then flip the battery. What changes?",
    check: { q: "Which one has a motor inside?", options: [{ e: "🕯️", label: "Candle" }, { e: "🌀", label: "Ceiling fan", ok: true }, { e: "📚", label: "Books" }], why: "A motor spins the fan's blades." },
  },
};
