// Deeper versions of each concept in Chip's computer path (C2).
//   mid  = Class 4–7    high = Class 8–12
// Each depth replaces the Learn text, the 3 Check questions and adds recap points; the hook,
// animation and activity are shared. The child's class picks the starting depth, and
// "Go deeper" / "Simpler" switch between them.
const Q = (q, options, why) => ({ q, options, answer: 0, why }); // the first option is right (options are shuffled on screen)

export const DEPTHS = [
  { id: "base", label: "Class 1–3" },
  { id: "mid", label: "Class 4–7" },
  { id: "high", label: "Class 8–12" },
];

export const DEEP = {
  "comp-step-1": {
    mid: {
      text: ["A computer is a programmable machine: give it a new program and it does a new job. A fan can only spin, but the same laptop can be a calculator, a TV or a game.",
        "Computers hidden inside other machines, such as washing machines, cars and microwaves, are called embedded computers."],
      check: [
        Q("What makes a computer different from a simple machine?", ["It can be programmed with new instructions", "It uses electricity", "It has buttons"], "A computer can run new programs; simple machines only do one fixed job."),
        Q("A computer hidden inside a washing machine is called…", ["An embedded computer", "A server", "A printer"], "Embedded computers live inside other machines and run one program."),
        Q("Which one is NOT programmable?", ["A wind-up mechanical clock", "A smartphone", "A laptop"], "A wind-up clock has gears, not a program you can change."),
      ],
      points: ["Computers are programmable: new program, new job.", "Embedded computers hide inside other machines."],
    },
    high: {
      text: ["Formally, a computer stores and runs programs: the stored-program idea (described by John von Neumann in 1945) keeps instructions and data together in memory.",
        "Almost every computer follows this design, from the microcontroller in a washing machine to a supercomputer. What changes is speed, memory size and the devices attached."],
      check: [
        Q("In the stored-program design, where are the instructions kept?", ["In memory, alongside the data", "Printed on paper", "Only inside the keyboard"], "Instructions and data share the same memory."),
        Q("A washing-machine controller is an example of…", ["An embedded microcontroller system", "A web server", "A graphics card"], "It's a small computer built into a machine for one task."),
        Q("What do a phone and a supercomputer have in common?", ["Both run stored programs on processors with memory", "Both have the same speed", "Neither needs input"], "Same basic design, very different scale."),
      ],
      points: ["Stored-program design: instructions and data share memory.", "Microcontrollers to supercomputers follow the same idea."],
    },
  },
  "comp-step-2": {
    mid: {
      text: ["Programs are written in programming languages such as Scratch, Python or JavaScript. They are translated into the simple instructions a CPU understands.",
        "Programs are built from sequence (steps in order), selection (if… then…) and loops (repeat). Debugging means testing, spotting where the result differs from what you expected, and fixing that part."],
      check: [
        Q("Which one is a loop?", ["Repeat 10 times: jump", "If it rains, take an umbrella", "Say hello once"], "A loop repeats steps."),
        Q("“If it rains, take an umbrella” is…", ["Selection (a decision)", "A loop", "A bug"], "If… then… is selection: the program chooses."),
        Q("Debugging means…", ["Finding and fixing mistakes in a program", "Deleting the program", "Buying a new computer"], "Test, find the mistake, fix it, test again."),
      ],
      points: ["Programs use sequence, selection and loops.", "Debugging: test, find, fix, test again."],
    },
    high: {
      text: ["High-level code (Python, Java, C) is turned into machine code (binary CPU instructions) by a compiler before it runs, or by an interpreter line by line.",
        "Bugs come in kinds: syntax errors (breaking the language's rules, so it won't run), runtime errors (it crashes while running) and logic errors (it runs but gives the wrong answer, the hardest to find)."],
      check: [
        Q("A program runs but prints the wrong total. This is a…", ["Logic error", "Syntax error", "Hardware fault"], "It runs, so the rules were followed; the thinking was wrong."),
        Q("What translates a whole C program into machine code before it runs?", ["A compiler", "A printer driver", "A router"], "A compiler translates the whole program ahead of time."),
        Q("Missing a bracket so the code won't even start is a…", ["Syntax error", "Logic error", "Loop"], "Breaking the language's grammar is a syntax error."),
      ],
      points: ["Compilers and interpreters turn code into machine code.", "Syntax, runtime and logic errors."],
    },
  },
  "comp-step-3": {
    mid: {
      text: ["Most computers add a fourth step: storage. Input → Process → Output, with Storage keeping data for later. This is the IPOS cycle.",
        "Output often leads to new input. A game shows your score, you react and press keys again: this loop is called feedback."],
      check: [
        Q("The fourth part of the IPOS cycle is…", ["Storage", "Speaker", "Sound"], "Input, Process, Output, Storage."),
        Q("You see your score and press a key again. This loop is called…", ["Feedback", "Debugging", "Booting"], "Output becomes the reason for new input."),
        Q("An ATM printing a receipt is…", ["Output", "Input", "Storage"], "The receipt comes out to you."),
      ],
      points: ["IPOS: Input, Process, Output, Storage.", "Feedback: output leads to new input."],
    },
    high: {
      text: ["Raw facts going in are data (2 and 3); processing turns them into information (the total is 5), which has meaning.",
        "In hardware terms: input devices send signals through controllers, the CPU processes data held in RAM, results go to output devices, and secondary storage holds programs and data permanently."],
      check: [
        Q("Raw facts before processing are called…", ["Data", "Information", "Output"], "Data becomes information once it's processed."),
        Q("Processed, meaningful results are called…", ["Information", "Input", "Hardware"], "Information is data with meaning."),
        Q("Which part keeps programs and data permanently?", ["Secondary storage", "RAM", "The CPU registers"], "RAM and registers lose data when the power goes off."),
      ],
      points: ["Data → processing → information.", "Secondary storage keeps programs and data permanently."],
    },
  },
  "comp-step-4": {
    mid: {
      text: ["Sensors are input devices too: thermometers, light sensors, motion sensors, GPS receivers and accelerometers (which tell a phone it has been turned).",
        "Scanners, barcode readers and QR code scanners read printed information into a computer."],
      check: [
        Q("Which sensor tells a phone it was turned sideways?", ["Accelerometer", "Speaker", "Printer"], "The accelerometer senses movement and tilt."),
        Q("A shop's barcode reader is…", ["An input device", "An output device", "Storage"], "It reads the barcode into the computer."),
        Q("A GPS receiver gives the computer…", ["Your location", "Your voice", "Your password"], "GPS works out where you are from satellite signals."),
      ],
      points: ["Sensors are input devices (temperature, light, motion, GPS).", "Scanners and barcode readers read printed information."],
    },
    high: {
      text: ["Input devices turn physical things into digital data. A microphone's sound wave is measured thousands of times a second and stored as numbers: analogue-to-digital conversion.",
        "The operating system talks to each device through a driver, and devices connect through ports or wireless links such as USB, Bluetooth and Wi-Fi."],
      check: [
        Q("Turning a sound wave into numbers is called…", ["Analogue-to-digital conversion", "Printing", "Booting"], "Sampling a wave many times a second turns it into numbers."),
        Q("Software that lets the OS talk to a device is a…", ["Driver", "Browser", "Compiler"], "Each device needs a driver."),
        Q("Which wired port do most keyboards and mice use?", ["USB", "An audio jack", "A power socket"], "USB carries data and power for many input devices."),
      ],
      points: ["Analogue-to-digital conversion turns signals into numbers.", "Drivers connect devices to the operating system."],
    },
  },
  "comp-step-5": {
    mid: {
      text: ["Screens are made of pixels; a resolution like 1920 × 1080 tells you how many. More pixels means a sharper picture.",
        "Printers make 2D output; 3D printers build objects layer by layer. In robots, motors and buzzers are outputs too: they are called actuators."],
      check: [
        Q("1920 × 1080 describes a screen's…", ["Resolution", "Weight", "Battery"], "It's the number of pixels across and down."),
        Q("A motor in a robot is…", ["An output (an actuator)", "An input", "Storage"], "It turns the computer's instructions into movement."),
        Q("A 3D printer builds objects…", ["Layer by layer", "With paintbrushes", "Using sound"], "It adds thin layers one on top of another."),
      ],
      points: ["Resolution = pixels across × down.", "Actuators (motors, buzzers) are outputs in robots."],
    },
    high: {
      text: ["The GPU (graphics processing unit) works out the colour of millions of pixels many times a second; a 60 Hz screen redraws 60 times every second.",
        "Output devices turn digital data into light, sound or movement. For speakers, the numbers are turned back into a smooth sound wave: digital-to-analogue conversion."],
      check: [
        Q("Which processor is specialised for drawing pixels?", ["GPU", "Mouse controller", "Router"], "The GPU handles graphics in parallel."),
        Q("A 60 Hz screen redraws…", ["60 times per second", "60 pixels", "60 colours"], "Hz means times per second."),
        Q("Before a speaker can play a song file, the numbers become…", ["An analogue sound wave", "A barcode", "A new file"], "Digital-to-analogue conversion."),
      ],
      points: ["GPUs draw the screen many times a second.", "Digital-to-analogue conversion drives speakers."],
    },
  },
  "comp-step-6": {
    mid: {
      text: ["The CPU repeats one cycle billions of times a second: fetch an instruction from memory, decode it (work out what it means), then execute it (do it).",
        "CPU speed is measured in gigahertz (GHz): 3 GHz means about 3 billion clock ticks every second."],
      check: [
        Q("The order of the CPU's cycle is…", ["Fetch → decode → execute", "Execute → fetch → decode", "Decode → print → save"], "Get the instruction, understand it, do it."),
        Q("GHz measures the CPU's…", ["Clock speed", "Weight", "Screen size"], "Gigahertz = billions of ticks per second."),
        Q("“Decode” means…", ["Work out what the instruction means", "Delete it", "Print it"], "Decoding turns the instruction into actions."),
      ],
      points: ["Fetch → decode → execute, again and again.", "GHz = billions of clock ticks per second."],
    },
    high: {
      text: ["Inside the CPU: the control unit runs the fetch–decode–execute cycle, the ALU (arithmetic logic unit) does maths and logic, and registers hold the values being used right now.",
        "Modern CPUs have several cores that run instructions at the same time, and cache: tiny, very fast memory beside the cores that saves slow trips to RAM. All of it is built from billions of transistors acting as switches."],
      check: [
        Q("Which part of the CPU does arithmetic and logic?", ["The ALU", "The cache", "The hard disk"], "ALU = arithmetic logic unit."),
        Q("Why do CPUs have cache?", ["To keep often-used data very close and fast", "To store photos permanently", "To connect to Wi-Fi"], "Cache avoids slow trips to RAM."),
        Q("A 4-core CPU can…", ["Work on several tasks at the same time", "Only ever run 4 programs", "Run without power"], "Each core runs its own stream of instructions."),
      ],
      points: ["Control unit, ALU and registers.", "Cores work in parallel; cache keeps data close."],
    },
  },
  "comp-step-7": {
    mid: {
      text: ["Sizes: 1 byte = 8 bits. A kilobyte is about a thousand bytes, a megabyte about a million and a gigabyte about a billion. A phone may have 4–12 GB of RAM and 64–512 GB of storage.",
        "RAM is faster but smaller and costs more per gigabyte. Storage is bigger and cheaper, and keeps data when the power is off."],
      check: [
        Q("1 byte is…", ["8 bits", "10 bits", "100 bits"], "A byte is a group of 8 bits."),
        Q("On a phone, which is usually bigger?", ["Storage", "RAM"], "Storage is measured in hundreds of GB; RAM in a few GB."),
        Q("Which forgets its data when switched off?", ["RAM", "Storage"], "RAM is temporary working memory."),
      ],
      points: ["8 bits = 1 byte; KB, MB, GB.", "RAM: fast and temporary. Storage: big and permanent."],
    },
    high: {
      text: ["RAM is volatile (it needs power to keep data); ROM and flash storage are non-volatile. Most computers now use SSDs (flash chips, no moving parts) instead of HDDs (spinning magnetic disks), so programs start much faster.",
        "The memory hierarchy trades speed for size: registers → cache → RAM → SSD or HDD. Each level down is bigger and cheaper, but slower."],
      check: [
        Q("Why is an SSD faster than an HDD?", ["It reads flash chips electronically, with no moving parts", "It is bigger", "It uses more power"], "HDDs wait for a spinning disk and a moving arm."),
        Q("Volatile memory…", ["Loses its data without power", "Never loses data", "Is only found on CDs"], "RAM is volatile."),
        Q("Which is fastest?", ["CPU registers", "RAM", "SSD"], "Registers sit inside the CPU itself."),
      ],
      points: ["Volatile vs non-volatile memory.", "Registers → cache → RAM → SSD/HDD."],
    },
  },
  "comp-step-8": {
    mid: {
      text: ["The motherboard connects the parts with buses: shared pathways that carry data. The power supply (PSU) turns mains electricity into the low voltages chips need.",
        "Phones squeeze the same parts onto a tiny board; the CPU, GPU and more are combined into one chip called a system on a chip (SoC)."],
      check: [
        Q("Pathways that carry data between parts are called…", ["Buses", "Pipes", "Power cables only"], "Buses carry data around the motherboard."),
        Q("A phone's CPU and GPU together on one chip is a…", ["System on a chip (SoC)", "Hard disk", "Router"], "SoCs save space and power."),
        Q("The power supply (PSU)…", ["Converts mains power for the parts", "Stores files", "Shows pictures"], "It provides the right voltages safely."),
      ],
      points: ["Buses carry data; the PSU supplies power.", "Phones use a system on a chip."],
    },
    high: {
      text: ["Booting: at switch-on, firmware on the motherboard (BIOS/UEFI) tests the hardware (the POST), then loads the operating system from storage into RAM.",
        "Good builds are balanced: a fast CPU waits if RAM is too small or storage is slow. The slowest part that holds the rest back is the bottleneck."],
      check: [
        Q("What runs first when a PC is switched on?", ["Firmware (BIOS/UEFI)", "A game", "The web browser"], "Firmware starts the hardware and then loads the OS."),
        Q("A bottleneck is…", ["The slowest part holding the rest back", "A kind of fan", "A virus"], "Like the narrow neck of a bottle."),
        Q("While booting, the operating system is loaded…", ["From storage into RAM", "From the printer", "From the speaker"], "The CPU runs programs from RAM."),
      ],
      points: ["Firmware → POST → load the OS into RAM.", "Balance the parts to avoid bottlenecks."],
    },
  },
  "comp-step-9": {
    mid: {
      text: ["Software comes in two big kinds: system software (the operating system, drivers and utilities like antivirus) and application software (games, browsers, word processors).",
        "Firmware sits in between: software kept on a hardware chip, like the program inside a TV remote."],
      check: [
        Q("An antivirus program is…", ["System (utility) software", "Hardware", "An input device"], "Utilities look after the computer itself."),
        Q("A word processor is…", ["Application software", "System software", "Firmware"], "Applications do jobs for the user."),
        Q("Software stored permanently on a device's chip is…", ["Firmware", "Hardware", "A peripheral"], "Firmware lives on the hardware itself."),
      ],
      points: ["System software vs application software.", "Firmware: software stored on a chip."],
    },
    high: {
      text: ["Proprietary software (for example Microsoft Office) is owned and licensed; open-source software (for example Linux and Firefox) shares its source code for anyone to study and improve.",
        "Abstraction layers (hardware → firmware → operating system → applications) let each layer use the one below without knowing all its details."],
      check: [
        Q("Linux is an example of…", ["Open-source software", "Hardware", "Firmware only"], "Its source code is public."),
        Q("Open source means…", ["The source code is shared for anyone to study and improve", "It costs a lot", "It has no code"], "Open-source projects can be studied and changed."),
        Q("Why use layers of abstraction?", ["So programmers can build on lower layers without handling every detail", "To slow the computer down", "To use more power"], "Apps don't need to know how the hardware works inside."),
      ],
      points: ["Proprietary vs open-source software.", "Layers of abstraction make big systems manageable."],
    },
  },
  "comp-step-10": {
    mid: {
      text: ["The operating system manages memory (which app gets RAM), files (saving and folders), devices (through drivers) and security (user accounts and passwords).",
        "Multitasking: the OS switches the CPU between apps so quickly that they seem to run at the same time."],
      check: [
        Q("Who decides which app gets memory?", ["The operating system", "The keyboard", "The app store"], "Managing memory is one of the OS's main jobs."),
        Q("Playing music while drawing is called…", ["Multitasking", "Debugging", "Booting"], "Several apps run at once."),
        Q("User accounts and passwords help the OS with…", ["Security", "Printing", "Sound"], "They keep each person's files safe."),
      ],
      points: ["The OS manages memory, files, devices and security.", "Multitasking: fast switching between apps."],
    },
    high: {
      text: ["The kernel is the core of the operating system. It schedules processes (giving each a slice of CPU time), manages memory (including virtual memory, which borrows storage when RAM is full) and handles hardware interrupts.",
        "User interfaces can be command-line (typed commands) or graphical (a GUI with windows, icons and touch)."],
      check: [
        Q("The core part of an operating system is the…", ["Kernel", "Wallpaper", "App store"], "The kernel controls the CPU, memory and devices."),
        Q("Virtual memory uses ___ when RAM is full.", ["Storage", "The monitor", "The keyboard"], "Part of the disk acts like extra (slower) RAM."),
        Q("Typing commands like “dir” or “ls” uses a…", ["Command-line interface", "Graphical interface", "Printer"], "Commands are typed, not clicked."),
      ],
      points: ["The kernel schedules processes and manages memory.", "Command-line vs graphical user interfaces."],
    },
  },
  "comp-step-11": {
    mid: {
      text: ["Everything is stored as bits that are 0 or 1. Each pixel's colour is three numbers for red, green and blue (RGB), each from 0 to 255.",
        "File extensions show the type of file: .jpg (photo), .mp3 (sound), .docx (document), .txt (plain text)."],
      check: [
        Q("RGB stands for…", ["Red, green, blue", "Read, get, back", "Really good bytes"], "Mixing red, green and blue light makes every colour on a screen."),
        Q("A song file is often…", [".mp3", ".jpg", ".txt"], ".mp3 is a common sound format."),
        Q("A bit can be…", ["0 or 1", "Any letter", "Any colour"], "A bit has just two values."),
      ],
      points: ["Bits are 0 or 1; pixels are RGB numbers.", "File extensions show the file type."],
    },
    high: {
      text: ["An uncompressed 1920 × 1080 photo with 3 bytes per pixel is about 6 MB. Compression shrinks files: lossless (PNG, ZIP) keeps every bit; lossy (JPEG, MP3) drops detail people barely notice.",
        "Text is stored as character codes. In ASCII and Unicode, “A” is 65; Unicode also covers scripts like Hindi and Telugu."],
      check: [
        Q("JPEG compression is…", ["Lossy", "Lossless", "Not compression"], "JPEG drops some detail to save space."),
        Q("In ASCII and Unicode, the letter A is stored as…", ["65", "1", "255"], "Each character has a number code."),
        Q("Why compress files?", ["To make them smaller to store and send", "To make them more colourful", "To delete them"], "Smaller files save space and download faster."),
      ],
      points: ["Lossless vs lossy compression.", "Text is stored as character codes (ASCII, Unicode)."],
    },
  },
  "comp-step-12": {
    mid: {
      text: ["A LAN (local area network) joins devices in one home, school or office; a WAN (wide area network) joins places far apart. The internet is the biggest WAN.",
        "Every device on a network has an IP address, like a house address, so packets know where to go. A router passes packets between networks."],
      check: [
        Q("A school's computer lab network is a…", ["LAN", "WAN", "Printer"], "It's local: one building."),
        Q("An IP address is like…", ["A house address for a device", "A password", "A file name"], "It tells packets where to go."),
        Q("Which device passes packets between networks?", ["A router", "A speaker", "A keyboard"], "The router connects your home network to the internet."),
      ],
      points: ["LAN (local) vs WAN (wide); the internet is a WAN.", "IP addresses and routers deliver packets."],
    },
    high: {
      text: ["Protocols are agreed rules. TCP/IP splits data into addressed packets and checks they all arrive; HTTP and HTTPS fetch web pages (HTTPS encrypts them); DNS turns names like example.com into IP addresses.",
        "The web is one service that runs on the internet; email and video calls are others. Servers store and send data; clients, like your browser, request it."],
      check: [
        Q("DNS…", ["Turns website names into IP addresses", "Encrypts photos", "Charges the battery"], "Like a phone book for the internet."),
        Q("HTTPS is safer than HTTP because…", ["It encrypts the data", "It is faster", "It uses no internet"], "Encrypted data can't be read by others on the way."),
        Q("Is the web the same as the internet?", ["No, the web is one service on the internet", "Yes, exactly the same"], "The internet is the network; the web runs on it."),
      ],
      points: ["TCP/IP, HTTP(S) and DNS are protocols.", "The web runs on the internet; clients ask, servers answer."],
    },
  },
  "comp-step-13": {
    mid: {
      text: ["Strong passwords are long, mixed (letters, numbers and symbols) and different for every account. Never share them, and turn on two-step verification where you can.",
        "Phishing: fake messages or websites pretend to be real (a bank, a game) to steal passwords. Check the sender and the link, and ask a grown-up if unsure. What you post can stay online for years: your digital footprint."],
      check: [
        Q("Which is the strongest password?", ["Tiger!Mango7Kite", "123456", "Your name"], "Long and mixed is much harder to guess."),
        Q("A message says “You won a phone! Click to claim.” It's probably…", ["Phishing", "A real prize", "A software update"], "Unexpected prizes are a common trick."),
        Q("Your digital footprint is…", ["What you post and do online, which can stay for a long time", "Your shoe size", "Your typing speed"], "Think before you post."),
      ],
      points: ["Strong, different passwords and two-step verification.", "Spot phishing; mind your digital footprint."],
    },
    high: {
      text: ["Threats include malware (viruses, ransomware), phishing and social engineering, and data breaches. Defences: updates, antivirus, a password manager with strong unique passwords, and two-factor authentication.",
        "In India, the Digital Personal Data Protection Act, 2023 gives people rights over their personal data. Cyberbullying and sharing others' private data can be crimes. Report cyber crime at cybercrime.gov.in or call the helpline 1930."],
      check: [
        Q("Ransomware…", ["Locks your files and demands payment", "Speeds up your computer", "Is a password manager"], "Backups and updates are the best protection."),
        Q("Two-factor authentication adds…", ["A second proof, like a code sent to your phone", "A second keyboard", "A second screen"], "Even a stolen password isn't enough on its own."),
        Q("India's national helpline for reporting cyber fraud is…", ["1930", "101", "139"], "Report quickly: call 1930 or visit cybercrime.gov.in."),
      ],
      points: ["Malware, phishing and social engineering; updates, password managers and 2FA.", "India's DPDP Act 2023; report cyber crime on 1930."],
    },
  },
};

// Which depth a learner starts at: Class 1–3 → base, 4–7 → mid, 8–12 (and grown-ups) → high.
export function depthFor(learner) {
  if (learner?.learner === "adult") return 2;
  const g = learner?.grade ?? 0;
  return g >= 8 ? 2 : g >= 4 ? 1 : 0;
}
