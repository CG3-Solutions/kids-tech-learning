// "Inside a Computer" as a learning path: 12 concepts in 3 parts, guided by Chip the computer.
// Every concept is one lesson of six short screens (see components/concept/ConceptLesson.jsx):
//   hook → explain → see it (animation) → do it (activity) → check (3 questions, 2 to pass) → recap.
// Pitched at Class 1–3 (C1). Plain data, so tests, progress and parent reports can use it.

export const COMPUTER_PARTS = [
  { id: "A", title: "Part A · What computers are", who: "Everyone starts here", note: "What makes something a computer, and how instructions make it work." },
  { id: "B", title: "Part B · The parts", who: "After Part A", note: "Input, the CPU, memory and output: what each part does." },
  { id: "C", title: "Part C · Computers in the world", who: "After Part B", note: "Software, files, the internet, and how to stay safe online." },
];

// Cross-links: other subjects in the app that build on a concept.
const BINARY = { to: "binary", label: "Bit's binary adventure", why: "how a photo becomes 1s and 0s" };
const CIRCUITS = { to: "electricity", label: "Volt's circuits & gates", why: "the switches and logic gates inside a CPU" };
const CODING = { to: "coding", label: "Robot puzzles", why: "writing your own instructions and fixing bugs" };
const TYPING = { to: "typing", label: "Keyo's typing course", why: "using the keyboard like a pro" };

const S = (n, part, emoji, title, blurb, lesson) => ({ id: `comp-step-${n}`, part, emoji, title, blurb, ...lesson });

export const COMPUTER_JOURNEY = [
  // ───────── Part A ─────────
  S(1, "A", "💻", "What is a computer?", "A machine that follows instructions", {
    hook: { q: "Which one has a computer inside?", choices: ["🌀 A ceiling fan", "🧺 A washing machine"], answer: 1,
      reveal: "The washing machine! It has a tiny computer that follows a program: fill water, spin, rinse, stop. A fan just spins when you switch it on." },
    explain: {
      text: ["A computer is a machine that follows instructions, very, very fast.", "The instructions tell it exactly what to do, step by step. Without instructions, a computer does nothing at all."],
      like: "A super-fast helper who does exactly what the instructions say: nothing more, nothing less.",
    },
    see: { anim: "inside", items: [["🌀", "Fan", false], ["🧺", "Washing machine", true], ["📱", "Phone", true], ["💡", "Bulb", false], ["🏧", "ATM", true], ["🚲", "Cycle", false]],
      caption: "A computer chip inside means the machine can follow instructions." },
    doit: { game: "sort", prompt: "Has a computer inside, or not?", buckets: [["💻", "Computer inside"], ["🔧", "No computer"]],
      items: [["📱", "Phone", 0], ["📺", "Smart TV", 0], ["🏧", "ATM", 0], ["🎮", "Video game", 0], ["🌀", "Ceiling fan", 1], ["🪑", "Chair", 1], ["🔦", "Torch", 1], ["✂️", "Scissors", 1]] },
    check: [
      { q: "What does every computer need to do anything?", options: ["Instructions", "Paint", "Water"], answer: 0, why: "A computer only does what its instructions say." },
      { q: "Is a mobile phone a computer?", options: ["Yes", "No"], answer: 0, why: "Yes! A phone follows instructions, just like a laptop." },
      { q: "A fan spins when you switch it on. Does it need a computer?", options: ["No", "Yes"], answer: 0, why: "No. A switch just sends electricity to the motor. No instructions to follow." },
    ],
    recap: { points: ["A computer follows instructions very fast.", "Phones, laptops, smart TVs and ATMs are computers.", "Washing machines and microwaves have tiny computers inside."],
      find: ["Laptop or desktop", "Mobile phone", "Smart TV", "ATM", "Washing machine (tiny one)"], tryit: "Walk around your home and count the computers. Remember: phones and smart TVs count!" },
    learned: "A computer is a machine that follows instructions very fast.",
    parent: "Ask: what's the difference between a fan and a washing machine? (The washing machine follows a program: fill, wash, rinse, spin.)",
  }),
  S(2, "A", "📜", "Instructions, programs and bugs", "Step-by-step instructions, and mistakes in them", {
    hook: { q: "You tell a robot: “Put on your shoes, then your socks.” What happens?", choices: ["👟 Shoes on, then socks on top!", "🧦 Socks first, then shoes"], answer: 0,
      reveal: "The robot puts socks on top of its shoes! A computer follows instructions exactly, in the order you give them, even when they're silly." },
    explain: {
      text: ["A list of instructions for a computer is called a program.", "If a program has a mistake, the computer still follows it exactly, and something goes wrong. A mistake in a program is called a bug."],
      like: "A recipe. Follow it step by step and you get a cake. A mistake in the recipe is a bug: you get salty cake!",
    },
    see: { anim: "steps", title: "Program: make a jam sandwich", lines: ["Take 2 slices of bread", "Spread jam on one slice", "Put the other slice on top", "Cut it in half"], result: ["🍞", "🍞🍓", "🥪", "🥪🔪"] },
    doit: { game: "becomputer" },
    check: [
      { q: "What is a program?", options: ["A list of instructions", "A computer screen", "A kind of game controller"], answer: 0, why: "A program is a list of instructions for the computer to follow." },
      { q: "What is a bug?", options: ["A mistake in a program", "A broken keyboard", "A computer virus only"], answer: 0, why: "A bug is a mistake in the instructions." },
      { q: "Does a computer fix a wrong instruction by itself?", options: ["No, it follows it exactly", "Yes, it always knows better"], answer: 0, why: "A computer can't think on its own. It follows the instructions, even wrong ones." },
    ],
    recap: { points: ["A program is a list of instructions.", "The order matters.", "A mistake in a program is a bug. Finding and fixing it is called debugging."],
      find: ["Recipes", "Morning routine", "Washing machine program buttons"], tryit: "Write instructions for brushing teeth. Ask someone to follow them EXACTLY. Did you leave a bug?" },
    links: [CODING],
    learned: "Programs are step-by-step instructions; a bug is a mistake in them.",
    parent: "Play “robot”: your child gives you instructions to make a sandwich, and you follow them exactly and literally. Missing steps become funny bugs.",
  }),
  S(3, "A", "🔁", "Input → Process → Output", "How every computer works", {
    hook: { q: "You type 2 + 3 on a calculator. What happens inside before you see 5?", choices: ["🤔 It works out the answer", "🪄 Magic"], answer: 0,
      reveal: "It works it out! First you put numbers IN (input), it works out the answer (process), then it shows the answer OUT (output)." },
    explain: {
      text: ["Every computer does three things: it takes information in (input), works on it (process), and gives a result out (output).", "Input → Process → Output. This happens millions of times every second."],
      like: "Making juice: oranges go in, the juicer squeezes them, and juice comes out.",
    },
    see: { anim: "flow", nodes: [["⌨️", "Input", "You press 2 + 3"], ["🧠", "Process", "The CPU adds"], ["🖥️", "Output", "The screen shows 5"]], token: "🔢" },
    doit: { game: "sort", prompt: "Input, process or output?", buckets: [["⬇️", "Input"], ["⚙️", "Process"], ["⬆️", "Output"]],
      items: [["⌨️", "Typing a letter", 0], ["🎤", "Speaking to the phone", 0], ["🧮", "Adding numbers", 1], ["🔍", "Searching for a song", 1], ["🔊", "Music playing", 2], ["🖨️", "Printing a page", 2]] },
    check: [
      { q: "Pressing a key on the keyboard is…", options: ["Input", "Output", "Process"], answer: 0, why: "You are putting information IN." },
      { q: "Seeing a picture on the screen is…", options: ["Output", "Input", "Process"], answer: 0, why: "The computer shows the result OUT to you." },
      { q: "Which comes in the middle?", options: ["Process", "Input", "Output"], answer: 0, why: "Input → Process → Output: working on it happens in the middle." },
    ],
    recap: { points: ["Input: information goes in.", "Process: the computer works on it.", "Output: the result comes out."],
      find: ["Calculator", "Microwave timer", "TV remote and TV"], tryit: "Use a calculator: say out loud which part is input, process and output." },
    learned: "Input → Process → Output: how every computer works.",
    parent: "Point at everyday machines and ask your child to name the input, process and output. (Microwave: buttons → timer → heat and beep.)",
  }),

  // ───────── Part B ─────────
  S(4, "B", "⌨️", "Input devices", "Keyboard, mouse, touch, camera, mic", {
    hook: { q: "How does the phone know you touched it?", choices: ["👆 The screen feels your finger", "👂 It hears you"], answer: 0,
      reveal: "The glass feels your finger! A touch screen is an input device: it sends “a finger touched here” to the computer." },
    explain: {
      text: ["Input devices send information INTO the computer.", "Keyboard (letters), mouse and touchpad (pointing), touch screen (touch), camera (pictures) and microphone (sounds)."],
      like: "Your eyes, ears and hands for noticing things, but for a computer.",
    },
    see: { anim: "flow", nodes: [["⌨️", "Keyboard", "Press A"], ["🧠", "CPU", "Gets the letter A"], ["🖥️", "Screen", "A appears"]], token: "A" },
    doit: { game: "sort", prompt: "Which are input devices?", buckets: [["⬇️", "Input device"], ["❌", "Not input"]],
      items: [["⌨️", "Keyboard", 0], ["🖱️", "Mouse", 0], ["📷", "Camera", 0], ["🎤", "Microphone", 0], ["🔊", "Speaker", 1], ["🖨️", "Printer", 1], ["🧸", "Teddy bear", 1]] },
    check: [
      { q: "Which is an input device?", options: ["🎤 Microphone", "🔊 Speaker", "🖨️ Printer"], answer: 0, why: "A microphone sends your voice INTO the computer." },
      { q: "A video call uses the camera to…", options: ["Send your picture in", "Print your picture", "Make sound"], answer: 0, why: "The camera is input: it takes your picture in." },
      { q: "Typing your name uses…", options: ["The keyboard", "The speaker", "The screen only"], answer: 0, why: "The keyboard puts letters in." },
    ],
    recap: { points: ["Input devices send information into the computer.", "Keyboard, mouse, touchpad, touch screen, camera and microphone.", "A touch screen is special: we'll see why in the next step."],
      find: ["Phone camera", "TV remote buttons", "Game controller"], tryit: "List every input device on your family's phone. (Touch screen, camera, microphone, buttons…)" },
    links: [TYPING],
    learned: "Input devices put information into a computer.",
    parent: "Ask which input devices a video call uses. (Camera and microphone.) Which output devices? (Screen and speaker.)",
  }),
  S(5, "B", "🖥️", "Output devices", "Screen, speaker, printer, and the touch screen", {
    hook: { q: "The computer worked out an answer. How does it tell you?", choices: ["🖥️ Shows it or says it", "🤫 It keeps it secret"], answer: 0,
      reveal: "It uses an output device: the screen shows it, the speaker says it, or the printer prints it on paper." },
    explain: {
      text: ["Output devices bring information OUT of the computer so we can see, hear or hold it: screen, speaker, headphones and printer.",
        "A touch screen is BOTH: it shows pictures (output) and feels your finger (input). That's why phones need so few buttons."],
      like: "A computer's mouth and face: how it shows and tells you things.",
    },
    see: { anim: "flow", nodes: [["🧠", "CPU", "The answer is 5"], ["🖥️", "Screen", "Shows 5"], ["🔊", "Speaker", "Says “five”"]], token: "5" },
    doit: { game: "sort", prompt: "Input, output, or both?", buckets: [["⬇️", "Input"], ["⬆️", "Output"], ["🔁", "Both"]],
      items: [["⌨️", "Keyboard", 0], ["🎤", "Microphone", 0], ["🖥️", "Screen", 1], ["🔊", "Speaker", 1], ["🖨️", "Printer", 1], ["📱", "Touch screen", 2], ["🎧", "Headset with a mic", 2]] },
    check: [
      { q: "Which is an output device?", options: ["🖨️ Printer", "🖱️ Mouse", "📷 Camera"], answer: 0, why: "A printer brings the computer's work out onto paper." },
      { q: "A touch screen is…", options: ["Both input and output", "Only input", "Only output"], answer: 0, why: "It shows pictures (output) and feels your touch (input)." },
      { q: "Music playing from the speaker is…", options: ["Output", "Input"], answer: 0, why: "Sound comes OUT of the computer to you." },
    ],
    recap: { points: ["Output devices: screen, speaker, headphones, printer.", "A touch screen is both input and output.", "Input → Process → Output."],
      find: ["TV screen", "Bluetooth speaker", "Printer at a shop"], tryit: "Turn the volume down on a video. Which output did you change? Which one is still working?" },
    learned: "Output devices show or tell the computer's results; a touch screen is both input and output.",
    parent: "Ask your child to sort the family phone's parts into input, output and both. (The touch screen is both!)",
  }),
  S(6, "B", "🧠", "The CPU", "Follows instructions, super fast", {
    hook: { q: "People call the CPU “the brain” of the computer. Can it think for itself?", choices: ["🤖 No, it only follows instructions", "🧠 Yes, like a person"], answer: 0,
      reveal: "No! It's called the brain because it does the work, but it can't think on its own. It only follows instructions, billions of them every second." },
    explain: {
      text: ["The CPU (central processing unit) is a small chip that does the “process” part: it follows the program's instructions.",
        "It's very fast but it can't think on its own. If the instructions have a bug, the CPU follows the bug too."],
      like: "A super-fast cook following a recipe exactly. Great at following steps, but it can't invent a new dish by itself.",
    },
    see: { anim: "steps", title: "The CPU follows: “add 2 and 3, then show it”", lines: ["Get the number 2", "Get the number 3", "Add them", "Send 5 to the screen"], result: ["2", "2 3", "5", "🖥️ 5"] },
    doit: { game: "sort", prompt: "Can the CPU do it by itself?", buckets: [["✅", "Yes, it follows instructions"], ["❌", "No, it can't"]],
      items: [["➕", "Add big numbers fast", 0], ["🔁", "Repeat a step 1000 times", 0], ["🖥️", "Draw a picture it is told to", 0], ["💡", "Have its own new idea", 1], ["😊", "Feel happy", 1], ["🐞", "Notice a bug and fix it alone", 1]] },
    check: [
      { q: "What does the CPU do?", options: ["Follows instructions", "Stores your photos forever", "Makes the sound"], answer: 0, why: "The CPU does the processing: it follows the instructions." },
      { q: "Can a CPU think on its own?", options: ["No", "Yes"], answer: 0, why: "It's fast, but it only follows instructions." },
      { q: "Which is the CPU's job: input, process or output?", options: ["Process", "Input", "Output"], answer: 0, why: "Input → Process → Output: the CPU does the middle part." },
    ],
    recap: { points: ["The CPU follows the program's instructions.", "It's very fast, but it can't think on its own.", "The CPU is made of millions of tiny switches."],
      find: ["Laptop (inside!)", "Phone (inside!)", "Smart watch"], tryit: "Ask a grown-up to show you a picture of a CPU chip. It's smaller than a biscuit!" },
    links: [CIRCUITS],
    learned: "The CPU follows instructions very fast, but can't think on its own.",
    parent: "Reinforce: “The CPU is fast, not smart.” This prepares for later ideas about programming and AI (which is also made of instructions and data).",
  }),
  S(7, "B", "🗄️", "Memory and storage", "What's forgotten, and what's kept", {
    hook: { q: "You're drawing in a paint app and the power goes off. When it comes back, is your drawing still there?", choices: ["😢 Gone, if you didn't save it", "😀 Always still there"], answer: 0,
      reveal: "It's gone if you didn't save it! Work you're doing lives in memory (RAM), which forgets everything when the power goes off. Saving puts it in storage, which keeps it." },
    explain: {
      text: ["Memory (RAM) holds what the computer is working on right now. It's quick, but it forgets everything when the power goes off.",
        "Storage keeps things even with the power off: your photos, games and saved work. Pressing “Save” copies your work from memory to storage."],
      like: "Memory is your desk while you work: everything is out where you can reach it. Storage is the cupboard: things are put away safely and are still there tomorrow.",
    },
    see: { anim: "power" },
    doit: { game: "powercut" },
    check: [
      { q: "The power goes off. What is forgotten?", options: ["Things only in memory (RAM)", "Things in storage", "Everything, always"], answer: 0, why: "RAM forgets when the power goes off. Storage keeps things." },
      { q: "Where are your saved photos kept?", options: ["Storage", "RAM", "The speaker"], answer: 0, why: "Storage keeps things safe even when the computer is off." },
      { q: "What does pressing “Save” do?", options: ["Copies your work into storage", "Turns the computer off", "Deletes your work"], answer: 0, why: "Saving puts your work in storage so it stays." },
    ],
    recap: { points: ["Memory (RAM): quick, but forgets when the power goes off.", "Storage: keeps things even when the power is off.", "Save often!"],
      find: ["Phone storage (photos)", "Pen drive", "Memory card in a camera"], tryit: "Ask a grown-up to show you how much storage is free on a phone (Settings → Storage)." },
    links: [BINARY],
    learned: "Memory forgets when the power goes off; storage keeps things.",
    parent: "Next time you save a document or photo, say: “I'm moving it from memory to storage so it stays.”",
  }),
  S(8, "B", "🧩", "Build a computer", "Put the parts together", {
    hook: { q: "Could a computer work with just a screen and no CPU?", choices: ["❌ No, nothing would follow the instructions", "✅ Yes, the screen is enough"], answer: 0,
      reveal: "No! Every computer needs parts for input, processing, memory, storage and output, plus power." },
    explain: {
      text: ["A computer is a team of parts. Input devices bring information in, the CPU follows instructions, memory holds the work, storage keeps it, and output devices show the result.",
        "All the parts are connected on a big board called the motherboard, and they all need power."],
      like: "A cricket team: each player has a job, and you need all of them to play the match.",
    },
    see: { anim: "flow", nodes: [["⌨️", "Input", "Keyboard"], ["🧠", "CPU", "Follows"], ["🗂️", "Memory", "Holds"], ["💾", "Storage", "Keeps"], ["🖥️", "Output", "Shows"]], token: "⚡" },
    doit: { game: "build" },
    check: [
      { q: "Which part follows the instructions?", options: ["CPU", "Screen", "Keyboard"], answer: 0, why: "The CPU does the processing." },
      { q: "Which part keeps your games when the computer is off?", options: ["Storage", "Memory (RAM)", "Speaker"], answer: 0, why: "Storage keeps things with the power off." },
      { q: "What connects all the parts together?", options: ["The motherboard", "The mouse", "The printer"], answer: 0, why: "The motherboard is the big board everything plugs into." },
    ],
    recap: { points: ["A computer needs input, CPU, memory, storage, output and power.", "The parts connect on the motherboard.", "Each part has one job."],
      find: ["Desktop computer box", "Laptop", "Repair shop"], tryit: "If you have an old broken gadget, ask a grown-up to open it safely with you and find the board inside." },
    learned: "A computer is a team of parts, connected on the motherboard.",
    parent: "If you ever open an old desktop or watch a repair video, point out the CPU, RAM sticks and storage drive.",
  }),

  // ───────── Part C ─────────
  S(9, "C", "🧱", "Hardware and software", "Parts you can touch, and programs you can't", {
    hook: { q: "Can you touch a game app?", choices: ["🖐️ No, it's instructions", "✋ Yes, like a keyboard"], answer: 0,
      reveal: "No! A game app is software: instructions stored inside the computer. The phone you hold is hardware." },
    explain: {
      text: ["Hardware is the parts you can touch: keyboard, screen, CPU, cables.", "Software is the programs: instructions you can't touch, like games, apps and the calculator. Hardware needs software to do anything useful."],
      like: "A guitar is hardware. The song is software. You need both to make music.",
    },
    see: { anim: "inside", items: [["⌨️", "Keyboard", true], ["🎮", "Game app", false], ["🖥️", "Screen", true], ["🧮", "Calculator app", false], ["🖱️", "Mouse", true], ["🎵", "Music app", false]],
      labels: ["Hardware", "Software"], caption: "Hardware you can touch. Software is instructions inside." },
    doit: { game: "sort", prompt: "Hardware or software?", buckets: [["🔩", "Hardware"], ["📜", "Software"]],
      items: [["⌨️", "Keyboard", 0], ["🖨️", "Printer", 0], ["🧠", "CPU chip", 0], ["🎮", "Game app", 1], ["🌐", "Web browser", 1], ["🎨", "Paint program", 1]] },
    check: [
      { q: "Which is software?", options: ["A drawing app", "A mouse", "A screen"], answer: 0, why: "Apps are software: instructions you can't touch." },
      { q: "Which is hardware?", options: ["A keyboard", "A video game app", "A program"], answer: 0, why: "You can touch a keyboard, so it's hardware." },
      { q: "Can hardware do anything useful without software?", options: ["No", "Yes"], answer: 0, why: "Hardware needs software (instructions) to tell it what to do." },
    ],
    recap: { points: ["Hardware: parts you can touch.", "Software: programs and apps, made of instructions.", "They work together."],
      find: ["Phone (hardware) and apps (software)", "TV (hardware) and channels app (software)"], tryit: "Pick a gadget at home. Name one piece of hardware and one piece of software it has." },
    learned: "Hardware is the parts you can touch; software is the instructions.",
    parent: "Ask: is a YouTube video hardware or software? (Software and data.) Is the phone? (Hardware.)",
  }),
  S(10, "C", "🪟", "Operating system and apps", "The manager, and the helpers", {
    hook: { q: "When you tap a game icon, who opens the game?", choices: ["🪟 The operating system", "👻 Nobody, it opens itself"], answer: 0,
      reveal: "The operating system! It's the main program that runs the computer and opens all the other apps." },
    explain: {
      text: ["The operating system (OS) is the main software. It starts when you switch on, looks after the hardware and opens apps. Android, iOS and Windows are operating systems.",
        "Apps are programs for one job: a game, a camera app, a calculator."],
      like: "A school principal (the OS) runs the whole school and makes sure every class (app) gets a room and a time.",
    },
    see: { anim: "layers", layers: [["🎮📷🧮", "Apps", "Games, camera, calculator"], ["🪟", "Operating system", "Android, iOS, Windows"], ["🔩", "Hardware", "CPU, memory, screen"]] },
    doit: { game: "sort", prompt: "Operating system or app?", buckets: [["🪟", "Operating system"], ["📱", "App"]],
      items: [["🤖", "Android", 0], ["🍎", "iOS", 0], ["🪟", "Windows", 0], ["🎮", "A game", 1], ["📷", "Camera app", 1], ["🧮", "Calculator", 1], ["🗺️", "Maps", 1]] },
    check: [
      { q: "Which is an operating system?", options: ["Android", "A camera app", "A printer"], answer: 0, why: "Android runs the whole phone: it's an operating system." },
      { q: "What does the operating system do?", options: ["Runs the computer and opens apps", "Only plays music", "Only prints"], answer: 0, why: "The OS manages everything and opens the apps." },
      { q: "A calculator is…", options: ["An app", "An operating system", "Hardware"], answer: 0, why: "It's a program for one job: an app." },
    ],
    recap: { points: ["The operating system runs the computer.", "Apps do one job each.", "The OS opens apps and shares the hardware between them."],
      find: ["Phone: Android or iOS", "Laptop: Windows, macOS or Linux", "App store"], tryit: "Ask a grown-up which operating system their phone uses (Settings → About phone)." },
    learned: "The operating system runs the computer; apps do one job each.",
    parent: "Show your child the app list on your phone and the “About” page with the OS name.",
  }),
  S(11, "C", "🖼️", "Files and data", "How a computer keeps your photo", {
    hook: { q: "Your photo is saved on the phone. What is it made of inside?", choices: ["🔢 Lots of numbers", "🖨️ A tiny printed picture"], answer: 0,
      reveal: "Numbers! A photo is made of tiny dots called pixels, and each dot's colour is saved as numbers. Deep down, all numbers are 1s and 0s." },
    explain: {
      text: ["Everything a computer keeps (photos, songs, stories) is data, saved as numbers.", "Data is kept in files. Each file has a name, like “birthday.jpg”, and files are kept in folders, like papers in a file at school."],
      like: "A recipe saved as words in a notebook. A photo is “saved as numbers” in the same way, and the computer turns the numbers back into the picture.",
    },
    see: { anim: "pixels" },
    doit: { game: "pixels" },
    check: [
      { q: "Inside a computer, a photo is saved as…", options: ["Numbers", "Paint", "Paper"], answer: 0, why: "Every dot's colour is saved as numbers." },
      { q: "The tiny dots that make a picture are called…", options: ["Pixels", "Bugs", "Apps"], answer: 0, why: "A picture is made of tiny dots called pixels." },
      { q: "Files are kept in…", options: ["Folders", "Speakers", "The keyboard"], answer: 0, why: "Folders hold files, like a school file holds papers." },
    ],
    recap: { points: ["All data is saved as numbers, and deep down as 1s and 0s.", "A picture is made of pixels.", "Data is kept in files, and files in folders."],
      find: ["Photo gallery app", "Folders on a laptop", "Pen drive with files"], tryit: "Zoom right into a photo on a phone until you can see the tiny squares (pixels)." },
    links: [BINARY],
    learned: "Data is saved as numbers in files; pictures are made of pixels.",
    parent: "Zoom into a photo together until the pixels show. Then open Bit's binary adventure to see how numbers become 1s and 0s.",
  }),
  S(12, "C", "🌐", "Networks and the internet", "Computers talking to each other", {
    hook: { q: "You send a photo to Grandma in another city. How does it get there?", choices: ["🌐 Through a network of computers", "🕊️ A pigeon carries it"], answer: 0,
      reveal: "Through networks! Your photo is cut into little packets, which hop from computer to computer until they reach Grandma's phone." },
    explain: {
      text: ["A network is computers joined together so they can share information, by wires or by Wi-Fi.", "The internet is a giant network that joins networks all over the world. Websites and videos live on big computers called servers."],
      like: "The postal system: your letter goes from the post box to the post office, to a van, to another post office, and to Grandma's house.",
    },
    see: { anim: "network" },
    doit: { game: "order", prompt: "Put the journey of your photo in order", steps: ["📱 You tap Send", "📶 The phone sends it by Wi-Fi to the router", "🌐 It travels across the internet", "🖥️ It reaches a server", "📲 Grandma's phone gets it"] },
    check: [
      { q: "What is a network?", options: ["Computers joined together to share information", "A kind of keyboard", "A computer game"], answer: 0, why: "A network joins computers so they can share." },
      { q: "The internet is…", options: ["A giant network across the world", "One big computer in one room", "Only for videos"], answer: 0, why: "It joins networks all over the world." },
      { q: "Wi-Fi joins your device to the network…", options: ["Without wires", "Only with a long wire"], answer: 0, why: "Wi-Fi uses radio waves instead of wires." },
    ],
    recap: { points: ["A network joins computers together.", "The internet joins networks all over the world.", "Information travels in small packets."],
      find: ["Wi-Fi router at home", "Mobile data", "Video calls with family"], tryit: "Find the Wi-Fi router at home. Ask a grown-up what its blinking lights mean." },
    learned: "Networks join computers; the internet joins networks all over the world.",
    parent: "Show your child the Wi-Fi router and explain that it's the door between your home network and the internet.",
  }),
  S(13, "C", "🛡️", "Staying safe online", "Smart, kind and safe on the internet", {
    hook: { q: "A game asks for your home address to win a prize. What do you do?", choices: ["🛑 Stop and ask a grown-up", "✍️ Type it in quickly"], answer: 0,
      reveal: "Stop and ask a grown-up! Never share your address, school, phone number or passwords online. Real prizes don't need them." },
    explain: {
      text: ["Some things are private: your full name, address, school, phone number and passwords. Don't share them online.",
        "If something online makes you feel scared, sad or confused, stop and tell a grown-up you trust. You won't be in trouble. Be kind online, just like in real life."],
      like: "Your front door. You don't open it for strangers. Online, private information is your front door.",
    },
    see: { anim: "flow", nodes: [["💬", "Strange message", "“Send me your address!”"], ["🛑", "Stop", "Don't reply"], ["🧑‍🤝‍🧑", "Tell", "A grown-up you trust"]], token: "✋" },
    doit: { game: "sort", prompt: "Safe to share online, or keep private?", buckets: [["✅", "OK to share"], ["🔒", "Keep private"]],
      items: [["🎨", "Your favourite colour", 0], ["🐶", "A picture of a cartoon dog", 0], ["😊", "“Well done!” to a friend", 0], ["🏠", "Your home address", 1], ["🔑", "Your password", 1], ["🏫", "Your school name", 1], ["📞", "Your phone number", 1]] },
    check: [
      { q: "Someone online you don't know asks for your photo. You should…", options: ["Not send it and tell a grown-up", "Send it", "Send a friend's photo"], answer: 0, why: "Never share photos or details with strangers. Tell a grown-up." },
      { q: "Who should know your passwords?", options: ["Only you and your parents", "Your online friends", "Everyone"], answer: 0, why: "Passwords are private: only you and your parents." },
      { q: "Something online makes you feel scared. What do you do?", options: ["Stop and tell a grown-up", "Keep it secret", "Keep watching"], answer: 0, why: "Always tell a grown-up you trust. You won't be in trouble." },
    ],
    recap: { points: ["Keep private things private: address, school, phone, passwords.", "Stop and tell a grown-up if anything feels wrong.", "Be kind online."],
      find: ["Games with chat", "Video apps with comments", "Messages from unknown numbers"], tryit: "Make a family rule poster: “Online, I always…” with three rules." },
    learned: "Keep private details private, be kind, and tell a grown-up if something feels wrong.",
    parent: "Agree on family rules together: which apps are allowed, no chatting with strangers, and always telling you if something feels wrong, with no punishment for telling.",
  }),
];

export const COMPUTER_STEP_IDS = COMPUTER_JOURNEY.map(s => s.id);
