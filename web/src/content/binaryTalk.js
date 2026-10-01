// Bit's conversations for the binary adventure ("Bit's mission: say THANK YOU to a computer").
// Plain data for Conversation.jsx: { say } lines, and { ask, choices: [{ label, reply, right? }] } lines.
// Written for children everywhere: everyday situations, names from around the world, no one country.

// Opening step: can a computer understand us?
export const TALK_INTRO = [
  { say: "Hi {name}! I'm Bit, a little robot. Before we start, can I ask you something?" },
  { ask: "If someone says, “Please get me a glass of water”, what do you do?",
    choices: [
      { label: "🚰 Go to the kitchen, take a glass and fill it", reply: "Exactly! But nobody told you every tiny step: walk to the kitchen, pick up a glass, turn on the tap… You learned it by watching people do it. Humans are clever like that!" },
      { label: "🤷 I'm not sure", reply: "I think you do know! You've seen people take a glass and fill it many times. You learned it just by watching. Humans are clever like that!" },
    ] },
  { ask: "Now, if you say “Get me some water” to a computer, will it do it?",
    choices: [
      { label: "👍 Yes", right: false, reply: "Hmm, a computer can't walk to the kitchen: no legs, no hands! But there's an even bigger problem…" },
      { label: "👎 No", right: true, reply: "Right! A computer has no legs or hands. But there's an even bigger problem…" },
    ] },
  { ask: "Does the computer even understand your words?",
    choices: [
      { label: "👂 Yes, it can hear me", right: false, reply: "Good guess, but no! A computer doesn't understand words the way you do. Even a phone that listens has to turn your voice into something else first." },
      { label: "❌ No", right: true, reply: "Right! A computer doesn't understand our words the way people do." },
    ] },
  { say: "Here's a story. A new friend, Aiko, joins your class. Aiko only speaks a language you don't know, and you only speak yours.", pic: "🧒 💬 ❓ 👧" },
  { ask: "You want to say, “Let's have lunch together!” How could you two talk?",
    choices: [
      { label: "🤲 Use signs and actions", reply: "Signs help a little! But to really talk, you need a language you both know." },
      { label: "📚 One of us learns the other's language", right: true, reply: "Yes! Once one of you learns the other's language, you can talk about anything." },
      { label: "🧑‍🤝‍🧑 Find a friend who speaks both", right: true, reply: "Clever! A translator who knows both languages. Remember that idea: we'll meet a computer translator later!" },
    ] },
  { say: "Computers have their own language too. It has only TWO words: ON and OFF. We write them as 1 and 0. This language is called BINARY.", pic: "💡 = 1     ⚫ = 0" },
  { ask: "So, to talk to a computer, what do we need?",
    choices: [
      { label: "💡 Learn its language: binary!", right: true, reply: "Yes! And it's easier than it sounds: only two words." },
      { label: "📢 Shout louder", right: false, reply: "Ha! Shouting won't help. The computer needs its own language: binary." },
    ] },
  { say: "Here's your mission: by the end of this adventure, you'll say THANK YOU to a computer in its own language! First, let's learn its two words.", pic: "🎯 THANK YOU → 💡⚫💡⚫…" },
];

// Letters are numbers.
export const TALK_LETTERS = [
  { say: "You can make numbers with lamps now. But how do we write words, like THANK YOU, with only ON and OFF?" },
  { say: "Computers use a secret code: every letter has a number. Capital A is 65, B is 66, C is 67… all the way to Z, which is 90.", pic: "A 65 · B 66 · C 67 · … · Z 90" },
  { ask: "If A is 65 and B is 66, what number is C?",
    choices: [
      { label: "67", right: true, reply: "Yes! Each letter is one more than the one before." },
      { label: "3", right: false, reply: "Good thinking, C is the 3rd letter! But in the computer's code, A starts at 65, so C is 67." },
      { label: "68", right: false, reply: "Close! A is 65, B is 66, so C is 67." },
    ] },
  { ask: "And what number is H? (A is 65, so count on: B 66, C 67…)",
    choices: [
      { label: "72", right: true, reply: "Brilliant! H is the 8th letter: 65 + 7 = 72." },
      { label: "8", right: false, reply: "H is the 8th letter, well spotted! In the code that's 65 + 7 = 72." },
      { label: "70", right: false, reply: "Nearly! Count on from A = 65: B 66, C 67, D 68, E 69, F 70, G 71, H 72." },
    ] },
  { say: "Even the gap between words has a number: a space is 32. Small letters have their own numbers too: small a is 97." },
  { say: "Every number can be made with lamps, and each letter uses 8 lamps. 8 lamps together are called a BYTE. Let's make some letters!", pic: "H → 72 → ⚫💡⚫⚫💡⚫⚫⚫" },
];

// Bonus: meet the translator.
export const TALK_TRANSLATOR = [
  { say: "You did it, {name}! You spoke binary. But here's a secret…" },
  { ask: "Do you think people type 1s and 0s all day to talk to computers?",
    choices: [
      { label: "😩 Yes, all day!", right: false, reply: "That would take forever! THANK YOU alone was 72 switches. People found a better way." },
      { label: "🙂 No, there must be a better way", right: true, reply: "You're right! People found a better way." },
    ] },
  { say: "Remember Aiko, and the friend who speaks both languages? Computers have a translator like that. People write instructions in coding languages, like Scratch or Python, that look more like English.", pic: "👩‍💻 say(\"THANK YOU\")  →  🔁  →  01010100 01001000 …" },
  { ask: "Then a translator program turns them into binary. Who is like the translator here?",
    choices: [
      { label: "🧑‍🤝‍🧑 The friend who speaks both languages", right: true, reply: "Exactly! The translator program (it's called a compiler or interpreter) speaks both: our coding language and binary." },
      { label: "📢 The person who shouts loudest", right: false, reply: "Ha! No: it's the friend who speaks both languages. The translator program speaks our coding language AND binary." },
    ] },
  { say: "So you don't have to speak binary every day. But now you know what the computer really hears: ON and OFF, millions of times a second. Try the Robot puzzles to write your own instructions!" },
];

// The code for each letter (A = 65 …). Computers use this code, called ASCII (and Unicode, which includes it).
export const codeOf = ch => ch.charCodeAt(0);
export const bitsOf = (n, width = 8) => Array.from({ length: width }, (_, i) => Boolean(n & (1 << (width - 1 - i))));
export const MISSION = "THANK YOU";
