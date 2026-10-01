// Practice questions for Chip's computer path (C3), in mixed types: picture choice, true/false,
// ordering and spot-the-bug (see components/concept/Question.jsx). They're used by Chip's quiz and
// by spaced review, alongside each lesson's check questions.
// `min`: the lowest depth that sees the question (0 = everyone, 1 = Class 4 and up).
const PIC = (q, options, why, min = 0) => ({ type: "pic", q, options, answer: 0, why, min }); // the first picture is right
const TF = (q, answer, why, min = 0) => ({ type: "tf", q, answer, why, min });
const ORD = (q, items, why, min = 0) => ({ type: "order", q, items, why, min }); // items in the right order
const BUG = (q, lines, bug, fix, why, min = 0) => ({ type: "bug", q, lines, bug, fix, why, min });
const CH = (q, options, why, min = 0) => ({ q, options, answer: 0, why, min });

export const PRACTICE = {
  "comp-step-1": [
    PIC("Which one is a computer?", [["📱", "Phone"], ["🪑", "Chair"], ["✂️", "Scissors"]], "A phone follows instructions, so it's a computer."),
    TF("A ceiling fan needs a computer inside to spin.", false, "A fan just spins when electricity reaches its motor. There are no instructions to follow."),
    TF("The same laptop can be a calculator, a music player and a game, just by running different programs.", true, "Computers are programmable: a new program gives them a new job.", 1),
    PIC("Which of these usually has embedded computers inside?", [["🚗", "A modern car"], ["🪣", "A bucket"], ["🧱", "A brick"]], "Modern cars have many small embedded computers that control the engine, brakes and more.", 1),
  ],
  "comp-step-2": [
    ORD("Put this program for brushing teeth in order.", ["Pick up the toothbrush", "Put toothpaste on it", "Brush your teeth", "Rinse your mouth"], "A computer needs the steps in the right order."),
    BUG("This program should make a cup of tea. Which line is the bug?", ["Boil some water", "Put a tea bag in the cup", "Drink the tea", "Pour the hot water into the cup"], 2, "Drink the tea (as the last step)", "You can't drink the tea before the water is poured. The order is the bug."),
    BUG("This program should say 1, 2, 3. Which line is the bug?", ["Set count to 1", "Repeat while count is 3 or less:", "Say count", "Add 2 to count"], 3, "Add 1 to count", "Adding 2 makes it say 1, then 3, and skip 2. That's a logic error: the program runs but gives the wrong result.", 1),
    TF("If a program has a bug, the computer notices and fixes it by itself.", false, "A computer can't think on its own. People find and fix bugs: that's called debugging."),
  ],
  "comp-step-3": [
    ORD("Put these in order for a calculator.", ["Input: you press 2 + 3", "Process: the computer adds", "Output: the screen shows 5"], "Input → Process → Output."),
    PIC("Which one is OUTPUT?", [["🔊", "Music from a speaker"], ["⌨️", "Typing a word"], ["🎤", "Talking into a microphone"]], "Sound coming out of a speaker is output."),
    TF("Saving your work so you can open it later is the “storage” step.", true, "Input → Process → Output → Storage (IPOS): storage keeps results for later.", 1),
    CH("A thermostat turns the AC off when the room is cool enough. The temperature reading is…", ["Input", "Output", "Storage"], "The reading goes IN, so it's input. Switching the AC off is the output.", 1),
  ],
  "comp-step-4": [
    PIC("Which one is an input device?", [["🖱️", "Mouse"], ["🖨️", "Printer"], ["🔊", "Speaker"]], "A mouse puts information IN to the computer."),
    TF("A microphone is an input device.", true, "It takes your voice IN to the computer."),
    PIC("Which sensor tells a map app where you are?", [["🛰️", "GPS"], ["🌡️", "Thermometer"], ["🔦", "Torch"]], "GPS uses signals from satellites to work out where you are.", 1),
    TF("A phone knows you turned it sideways because of a sensor called an accelerometer.", true, "The accelerometer senses movement and tilt, so the screen can turn.", 1),
  ],
  "comp-step-5": [
    PIC("Which one is an output device?", [["🖨️", "Printer"], ["⌨️", "Keyboard"], ["🎤", "Microphone"]], "A printer puts information OUT onto paper."),
    TF("A touch screen is both input and output.", true, "It shows pictures (output) and feels your finger (input)."),
    CH("A screen is 1920 × 1080. What do these numbers count?", ["Pixels across and down", "Colours", "Programs"], "Resolution is the number of pixels across and down. More pixels make a sharper picture.", 1),
    TF("A motor that moves a robot's arm is an output device, called an actuator.", true, "Actuators turn the computer's output into movement.", 1),
  ],
  "comp-step-6": [
    TF("The CPU can think and make up its own ideas.", false, "The CPU follows instructions very fast, but it can't think on its own."),
    PIC("Which part follows the program's instructions?", [["🔲", "CPU (processor chip)"], ["🖱️", "Mouse"], ["🔌", "Plug"]], "The CPU, or processor, carries out the instructions."),
    ORD("Put the CPU's cycle in order.", ["Fetch the instruction", "Decode it", "Execute it"], "Fetch → decode → execute, billions of times a second.", 1),
    CH("A 3 GHz CPU does about how many cycles in one second?", ["3 billion", "3 thousand", "3"], "Giga means billion: 3 GHz is about 3 billion cycles a second.", 1),
  ],
  "comp-step-7": [
    TF("When the power goes off, memory (RAM) forgets what was in it.", true, "RAM needs power. Saved things are kept in storage."),
    PIC("Where should you save a drawing so it's still there tomorrow?", [["💾", "Storage"], ["🗂️", "Memory (RAM)"], ["🖥️", "The screen"]], "Storage keeps files even when the power is off."),
    ORD("Put these from smallest to biggest.", ["Bit", "Byte", "Kilobyte (KB)", "Megabyte (MB)", "Gigabyte (GB)"], "8 bits make a byte; each step after that is about 1,000 times bigger.", 1),
    CH("Why does an SSD load games faster than a hard disk (HDD)?", ["It has no moving parts: it reads chips directly", "It is heavier", "It shows more colours"], "A hard disk spins and moves an arm to find data; an SSD reads its memory chips directly.", 1),
  ],
  "comp-step-8": [
    PIC("What do all the parts plug into?", [["🟩", "The motherboard"], ["🧸", "A teddy bear"], ["🍌", "A banana"]], "The motherboard connects the parts so they can work together."),
    TF("A computer can work without a CPU.", false, "Without a CPU, nothing would follow the instructions."),
    ORD("You switch a computer on. Put what happens in order.", ["Power reaches the parts", "Firmware checks the hardware", "The operating system loads", "You can open apps"], "This is called booting. The hardware check is called POST.", 1),
    TF("In a phone, the CPU, graphics and more are often on one chip, called a system on a chip (SoC).", true, "An SoC puts many parts on one chip to save space and battery.", 1),
  ],
  "comp-step-9": [
    PIC("Which one is software?", [["🎮", "A game app"], ["⌨️", "Keyboard"], ["🖥️", "Monitor"]], "Software is instructions: you can't touch it."),
    TF("You can touch software with your hands.", false, "Hardware is what you can touch. Software is the instructions that run on it."),
    CH("A word processor is…", ["Application software", "System software", "Hardware"], "Apps help you do a task. System software, like the operating system, runs the computer.", 1),
    TF("Anyone can read the program code of open-source software.", true, "Open source shares its code; proprietary software keeps it private.", 1),
  ],
  "comp-step-10": [
    PIC("Which one is an operating system?", [["🤖", "Android"], ["🎨", "A drawing app"], ["📷", "The camera"]], "Android is an operating system: it runs the phone and opens apps."),
    TF("A phone app can run without the operating system.", false, "Apps need the operating system to open them and to use the hardware."),
    ORD("You tap a game's icon. Put what happens in order.", ["You tap the icon", "The OS loads the game into memory", "The CPU runs the game", "The game appears on the screen"], "The OS manages memory and the CPU for every app.", 1),
    CH("How does the OS run many apps at once?", ["It shares the CPU's time between them, very fast", "It deletes the old apps", "It turns off the screen"], "Switching between apps very fast is called multitasking.", 1),
  ],
  "comp-step-11": [
    TF("A computer saves a photo as numbers.", true, "Every pixel's colour is saved as numbers."),
    PIC("What are pictures on a screen made of?", [["🟦", "Tiny dots called pixels"], ["🧵", "Threads"], ["💧", "Water drops"]], "Screen pictures are made of pixels."),
    CH("A file called holiday.mp3 is most likely…", ["Music", "A photo", "A program"], "The extension .mp3 tells the computer the file is audio.", 1),
    TF("A JPG photo throws away a little detail to make the file smaller.", true, "JPG is lossy compression: it removes detail you'd hardly notice. PNG is lossless.", 1),
  ],
  "comp-step-12": [
    ORD("Put a photo's journey to Grandma in order.", ["Your phone", "The Wi-Fi router", "The internet", "Grandma's phone"], "Data goes through the router and across the internet."),
    TF("Data travels across the internet in small pieces called packets.", true, "Big files are split into packets and put back together at the other end."),
    CH("What does DNS do?", ["Turns names like example.com into IP addresses", "Makes the screen brighter", "Charges the battery"], "DNS is like the internet's phone book.", 1),
    TF("The padlock (HTTPS) means the data between you and the website is encrypted.", true, "Encryption scrambles the data so others can't read it on the way. It doesn't prove the website is honest, though.", 1),
  ],
  "comp-step-13": [
    PIC("Which one is OK to share with someone you don't know online?", [["🎨", "Your favourite colour"], ["🏠", "Your home address"], ["🔑", "Your password"]], "Keep your address, passwords and phone number private."),
    TF("If something online makes you scared or upset, tell a grown-up you trust.", true, "Always tell a trusted grown-up. You won't be in trouble."),
    PIC("Which password is strongest?", [["🔐", "Purple-Tiger-Jumps-42!"], ["🔢", "123456"], ["🐶", "mydog"]], "Long passphrases with words, numbers and symbols are hardest to guess.", 1),
    TF("A message says: “You won a prize! Send your OTP to claim it.” It's safe to send the OTP.", false, "That's phishing. Never share an OTP or password: banks and real prizes never ask for it.", 1),
  ],
};
