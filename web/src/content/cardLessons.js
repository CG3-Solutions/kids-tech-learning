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

  // Level 2: explorer parts
  "el-led": {
    meet: "An LED is a tiny light. Electricity can only go through it one way.",
    toy: "led", play: "The LED will not glow. Turn it around!",
    check: { q: "An LED is put in backwards. What happens?", options: [{ e: "🌑", label: "It stays dark", ok: true }, { e: "✨", label: "It glows brighter" }, { e: "🔊", label: "It beeps" }], why: "An LED only lets electricity through one way." },
  },
  "el-resistor": {
    meet: "A resistor slows electricity down, so small parts stay safe.",
    toy: "resistor", play: "Light the LED safely. What should fill the gap?",
    check: { q: "What does a resistor do?", options: [{ e: "🚀", label: "Speeds electricity up" }, { e: "🐢", label: "Slows electricity down", ok: true }, { e: "🧊", label: "Freezes it" }], why: "A resistor slows the electricity, like a speed breaker slows a car." },
  },
  "el-pot": {
    meet: "A knob lets more or less electricity through, like a tap for water.",
    toy: "pot", play: "Turn the knob all the way up to make the bulb brightest.",
    check: { q: "Which one has a knob like this?", options: [{ e: "🌀", label: "Fan speed dial", ok: true }, { e: "🚪", label: "Door" }, { e: "🪑", label: "Chair" }], why: "The fan dial lets more or less electricity through, so the fan goes faster or slower." },
  },
  "el-capacitor": {
    meet: "A capacitor fills up with a little electricity, then lets it out all at once.",
    toy: "capacitor", play: "Fill it up. Then let it all out!",
    check: { q: "What is a capacitor like?", options: [{ e: "🪣", label: "A small tank that fills and empties", ok: true }, { e: "🚪", label: "A one-way door" }, { e: "🛣️", label: "A long road" }], why: "It fills up like a small tank and empties quickly. A camera flash works this way." },
  },
  "el-diode": {
    meet: "A diode is a one-way door for electricity.",
    toy: "diode", play: "Flip the battery. Can electricity go back the other way?",
    check: { q: "How many ways can electricity go through a diode?", options: [{ e: "1️⃣", label: "One way only", ok: true }, { e: "2️⃣", label: "Both ways" }, { e: "0️⃣", label: "No way at all" }], why: "A diode lets electricity through one way only." },
  },
  "el-magnet": {
    meet: "Wind wire around a nail and send electricity through. The nail becomes a magnet!",
    toy: "magnet", play: "Switch it ON to pick up the clips. Then switch it OFF.",
    check: { q: "How does the electromagnet drop the clips?", options: [{ e: "🔌", label: "Switch the electricity OFF", ok: true }, { e: "💨", label: "Blow on it" }, { e: "🤝", label: "Shake it" }], why: "No electricity, no magnet. The clips fall." },
  },
  // Level 3: sensors
  "el-ldr": {
    meet: "A light sensor tells a machine if it is bright or dark.",
    toy: "ldr", play: "Make it night. What does the street light do?",
    check: { q: "How do street lights know it is evening?", options: [{ e: "👁️", label: "A light sensor feels the dark", ok: true }, { e: "⏰", label: "Someone rings a bell" }, { e: "🐦", label: "The birds tell them" }], why: "The light sensor feels it getting dark and switches the lights on." },
  },
  "el-temp": {
    meet: "A temperature sensor feels hot and cold.",
    toy: "temp", play: "Make the room hotter. When does the fan start?",
    check: { q: "How does the fridge know it is cold enough?", options: [{ e: "🌡️", label: "A temperature sensor", ok: true }, { e: "🎤", label: "A microphone" }, { e: "💡", label: "A bulb" }], why: "A temperature sensor feels the cold and tells the fridge to rest." },
  },
  "el-mic": {
    meet: "A microphone turns sound into electricity, so machines can hear.",
    toy: "mic", play: "Clap 3 times. Watch the microphone hear you!",
    check: { q: "Which part is like our ears?", options: [{ e: "🎤", label: "Microphone", ok: true }, { e: "💡", label: "Bulb" }, { e: "🔋", label: "Battery" }], why: "A microphone hears sound, like our ears do." },
  },
  "el-ultra": {
    meet: "A distance sensor sends out a sound and listens for the echo, like a bat.",
    toy: "ultra", play: "Move the wall closer until the sensor beeps.",
    check: { q: "Which animal finds its way with echoes?", options: [{ e: "🦇", label: "Bat", ok: true }, { e: "🐄", label: "Cow" }, { e: "🐢", label: "Tortoise" }], why: "A bat listens for echoes, just like a distance sensor." },
  },
  "el-motion": {
    meet: "A motion sensor notices when something moves near it.",
    toy: "motion", play: "Walk past the sensor. What happens to the light?",
    check: { q: "How does the mall door know you are coming?", options: [{ e: "🚶", label: "A motion sensor sees you move", ok: true }, { e: "🔑", label: "You use a key" }, { e: "📣", label: "You shout" }], why: "A motion sensor notices you walking and opens the door." },
  },
  "el-button": {
    meet: "A push button is ON only while you press it. Let go and it is OFF.",
    toy: "button", play: "Press and hold the button. Then let go.",
    check: { q: "Which one is a push button?", options: [{ e: "🔔", label: "Doorbell", ok: true }, { e: "🪑", label: "Chair" }, { e: "📖", label: "Book" }], why: "A doorbell rings only while you press it." },
  },
  "el-water": {
    meet: "A water sensor notices when water touches it.",
    toy: "water", play: "Fill the tank. What happens when the water reaches the sensor?",
    check: { q: "How does the tank alarm know the tank is full?", options: [{ e: "💧", label: "Water touches the sensor", ok: true }, { e: "👀", label: "Someone watches all day" }, { e: "⏰", label: "A clock guesses" }], why: "When the water reaches the sensor, it switches the alarm on." },
  },
  // Level 4: computer brain
  "el-transistor": {
    meet: "A transistor is a tiny switch. A small signal turns it ON or OFF: 1 or 0.",
    toy: "transistor", play: "Send a 1. Then send a 0.",
    check: { q: "In a computer, what does ON mean?", options: [{ e: "1️⃣", label: "One", ok: true }, { e: "0️⃣", label: "Zero" }, { e: "🔟", label: "Ten" }], why: "ON means 1 and OFF means 0. A phone chip has billions of these tiny switches." },
  },
  "el-relay": {
    meet: "A relay lets a small signal switch on something big.",
    toy: "relay", play: "Press the small button. What does the big motor do?",
    check: { q: "How can a tiny chip switch on a big water pump?", options: [{ e: "🤝", label: "It uses a relay as a helper", ok: true }, { e: "💪", label: "It pushes very hard" }, { e: "🙏", label: "It asks nicely" }], why: "The relay is the helper: a small push switches on something big." },
  },
  "el-mcu": {
    meet: "A microcontroller is a very small computer. It follows the instructions we give it.",
    toy: "mcu", play: "Pick an instruction and press Run. Try two different ones!",
    check: { q: "What is a microcontroller like?", options: [{ e: "🧠", label: "A robot's brain", ok: true }, { e: "🦵", label: "A robot's leg" }, { e: "👟", label: "A robot's shoe" }], why: "It is the brain: it reads sensors, thinks and controls lights, motors and buzzers." },
  },
  "el-seg": {
    meet: "Seven little light bars. Switch on different ones to make each number.",
    toy: "seg", play: "Tap the bars to make the number 7.",
    check: { q: "Which number uses all seven bars?", options: [{ e: "8️⃣", label: "Eight", ok: true }, { e: "1️⃣", label: "One" }, { e: "7️⃣", label: "Seven" }], why: "8 lights up all seven bars." },
  },
};
