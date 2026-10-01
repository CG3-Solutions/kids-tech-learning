// The Circuit Lab's parts: our own generic kit, used by every project. Plain data (no React).
// Each part type lists its pins (in the order the circuit notation uses), what the child can set
// (inputs) and what the lab shows (outputs). The simulation engine (release 2) models each part's
// electrical behaviour; `model` says how, in plain words, so the engine and the lessons agree.

// The virtual kit: how many of each part a project may use.
export const KIT = {
  wire: 40, battery: 1, slide: 2, button: 2, changeover: 2, lamp: 2, led: 3, resistor: 3, ldr: 1, motor: 1,
  speaker: 1, piezo: 1, melody: 1, siren: 1, fx: 1, touch: 1, probe: 1, transistor: 1,
};

export const PARTS = {
  wire: { name: "Connector", emoji: "➖", pins: ["a", "b"], explorer: true,
    say: "A metal strip that joins two posts, so electricity can go from one to the other.",
    model: "0.001 Ω. On the board, connectors come 1 to 6 posts long; in the circuit notation, nets that share a name are already joined." },
  battery: { name: "Battery pack", emoji: "🔋", pins: ["+", "−"], explorer: true,
    say: "Two 1.5 V cells make 3 volts. The battery pushes electricity out of + and back into −.",
    model: "3 V source with 0.5 Ω inside. More than 1 A out of it is a short circuit: flagged, and the board switches off." },
  slide: { name: "Slide switch", emoji: "🎚️", pins: ["a", "b"], input: ["off", "on"], explorer: true,
    say: "Stays where you put it: ON closes the gap, OFF opens it.",
    model: "0.001 Ω when on, open when off." },
  button: { name: "Push button", emoji: "🔘", pins: ["a", "b"], input: ["up", "down"], explorer: true,
    say: "Closes the gap only while you press it. A spring pushes it back.",
    model: "0.001 Ω while held down, open when up." },
  changeover: { name: "Two-way switch", emoji: "🔀", pins: ["com", "up", "down"], input: ["up", "down"],
    say: "Joins the middle pin to the top pin or the bottom pin, like the switches at both ends of a staircase.",
    model: "com joined to `up` or to `down`, never both." },
  lamp: { name: "Bulb", emoji: "💡", pins: ["a", "b"], output: ["off", "dim", "on", "flash"], explorer: true,
    say: "Glows when electricity flows through its thin wire. Works either way round.",
    model: "About 10 Ω (2.5 V, 0.25 A). Below 60 mA it doesn't glow; 60–220 mA is dim; above that, on. Driven by a chip's output it flickers (flash)." },
  led: { name: "LED", emoji: "🔴", pins: ["+", "−"], output: ["off", "dim", "on", "flash", "damage"], colours: ["red", "yellow", "green"],
    say: "A light that works only one way round, from + to −. It needs a resistor to protect it.",
    model: "Diode: 1.8 V (red), 1.85 V (yellow) or 2.0 V (green), plus 15 Ω. Under 0.3 mA off, 0.3–4 mA dim, 4–30 mA on, over 30 mA damage (shown, never real). Driven by a chip's output it flashes." },
  resistor: { name: "Resistor", emoji: "〰️", pins: ["a", "b"], values: [100, 1000, 10000],
    say: "Holds back some of the electricity, to protect parts or set how much flows.",
    model: "Fixed resistance: 100 Ω, 1 kΩ or 10 kΩ (written after the pins, e.g. `resistor R1 a b 1000`)." },
  ldr: { name: "Light sensor", emoji: "🌗", pins: ["a", "b"], input: ["bright", "dim", "dark", "lamp"],
    say: "Lets more electricity through when light shines on it.",
    model: "Light-dependent resistor: bright 100 Ω, dim 1 kΩ, dark 1 MΩ. `lamp` means lit only by the circuit's own bulb (a beam or a reflection): bright while a bulb glows, dark otherwise." },
  motor: { name: "Motor with fan", emoji: "🌀", pins: ["+", "−"], output: ["off", "slow", "spin", "reverse"], explorer: true,
    say: "Turns electricity into spinning. Swap its wires and it spins the other way.",
    model: "About 8 Ω. Under 80 mA stopped; 80–250 mA slow; above that, spinning. Current from − to + spins it in reverse." },
  speaker: { name: "Speaker", emoji: "🔈", pins: ["a", "b"], output: ["quiet", "soft", "sound"],
    say: "Turns quickly changing electricity into sound. Sound chips drive it.",
    model: "8 Ω. Plays the sound of the chip driving it: over 40 mA of signal is full volume, 3–40 mA soft (for example with a resistor in the loop), less is quiet." },
  piezo: { name: "Buzzer disc", emoji: "🥁", pins: ["a", "b"], input: ["quiet", "clap"], output: ["quiet", "sound"],
    say: "A thin disc that clicks to make sound, and also makes a tiny voltage when a clap shakes it, so it's a sound sensor too.",
    model: "20 kΩ. As an output: a quieter speaker (over 1 V of signal makes sound). As an input: a clap (the clap button, or the microphone if the child turns it on) makes pin a 2 V above pin b for 0.2 s. Wired from a chip's trigger to −, a clap triggers the chip." },
  melody: { name: "Melody chip", emoji: "🎵", pins: ["+", "−", "trig", "out"],
    say: "Plays a tune when its trigger pin is connected to +.",
    model: "Needs + and −. Trigger is HIGH above 1.5 V (it has 470 kΩ to − inside, so even tap water or a finger can trigger it; with a 10 kΩ resistor from + and a sensor to −, the sensor pulls it LOW: that is how alarms ring when something is broken or dark). HIGH starts a 6 s tune; it finishes the tune after the trigger goes LOW (a time delay). It draws about 1 mA (3 kΩ) and needs over 2 V. `out` is push-pull: HIGH joins it to + and LOW to −, each through 1 Ω, so it can drive a speaker, a buzzer disc, an LED or a bulb." },
  siren: { name: "Siren chip", emoji: "🚨", pins: ["+", "−", "trig", "out", "m1", "m2"], optional: ["m1", "m2"],
    say: "Makes siren sounds while its trigger pin is connected to +. Connect its mode pins to + for different sirens.",
    model: "Trigger like the melody chip, but it sounds only while HIGH. Modes: neither = police, m1 = fire engine, m2 = ambulance, both = robot alarm." },
  fx: { name: "Sound-effects chip", emoji: "👾", pins: ["+", "−", "trig", "out"],
    say: "Plays a different space sound each time its trigger is connected to +.",
    model: "Each LOW→HIGH change of the trigger plays the next of 8 sounds (about 1 s each); held HIGH, it keeps playing." },
  touch: { name: "Touch plate", emoji: "👆", pins: ["a", "b"], input: ["no", "yes"],
    say: "Two metal pads. Your finger joins them, because your body conducts a little.",
    model: "Finger on: 200 kΩ. Off: open." },
  probe: { name: "Test clips", emoji: "🧪", pins: ["a", "b"], input: ["air", "spoon", "coin", "foil", "key", "pencil", "salt", "water", "wetsoil", "drysoil", "finger", "paper", "plastic", "rubber", "wood"],
    say: "Two clips with a gap. Put something in the gap to see if electricity goes through it.",
    model: "Metal (spoon, coin, foil, key) 0.1 Ω; pencil line 2 kΩ; salt water 300 Ω; wet soil 1 kΩ; tap water 50 kΩ; finger 200 kΩ; air, dry soil, paper, plastic, rubber, wood: open." },
  transistor: { name: "Transistor", emoji: "🔺", pins: ["c", "b", "e"],
    say: "An electric switch: a small current into b lets a bigger current flow from c to e.",
    model: "NPN: base–emitter 0.7 V plus 50 Ω; collector current up to 100 × the base current; fully on, 0.2 V from c to e." },
};

// What a check may say about each part. Inputs are what the child sets; outputs are what the lab shows.
export const inputsOf = type => PARTS[type]?.input ?? [];
export const outputsOf = type => PARTS[type]?.output ?? [];
// Speakers may also name the sound: "sound:fire".
export const SOUNDS = ["melody", "police", "fire", "ambulance", "robot", "space", "mix"];

// Ideas every project is tagged with; the study map and the parent report use them.
export const CONCEPTS = {
  loop: "A complete loop", switch: "Switches open and close the loop", short: "Short circuits",
  series: "Series (in a row)", parallel: "Parallel (side by side)", polarity: "Some parts work one way round",
  resistance: "Resistance holds current back", conductor: "Conductors and insulators", energy: "Changing energy (light, motion, sound)",
  sound: "Sound and speakers", chip: "Chips that follow a program", sensor: "Sensors", logic: "Logic (AND, OR, NOT)",
  alarm: "Alarms and safety systems", design: "Designing to a brief", transistor: "Transistors (electric switches)",
};
