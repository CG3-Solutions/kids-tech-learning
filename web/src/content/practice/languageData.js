// Word and sentence banks for Polly's language adventures, by level:
//   0 = Class 1–3   1 = Class 4–7   2 = Class 8–12
// language.js picks mostly from the learner's own level (with some easier review), and draws wrong
// answers from the same level. Every multiple-choice item has exactly one right answer: items that
// could have two (e.g. "old" → new / young) are left out on purpose. Indian (British) English spelling.

// ───────── Alphabets ─────────
// A second picture word for most letters, so "starts with" questions don't repeat the same 26.
export const ABC_MORE = [["A", "Ant", "🐜"], ["B", "Bus", "🚌"], ["C", "Car", "🚗"], ["D", "Duck", "🦆"], ["E", "Egg", "🥚"], ["F", "Frog", "🐸"], ["G", "Goat", "🐐"],
  ["H", "Hat", "🎩"], ["I", "Insect", "🐞"], ["J", "Jacket", "🧥"], ["K", "Key", "🔑"], ["L", "Leaf", "🍃"], ["M", "Moon", "🌙"], ["N", "Nose", "👃"], ["O", "Owl", "🦉"],
  ["P", "Pizza", "🍕"], ["R", "Rainbow", "🌈"], ["S", "Star", "⭐"], ["T", "Tree", "🌳"], ["U", "Unicorn", "🦄"], ["V", "Violin", "🎻"], ["W", "Whale", "🐋"], ["Y", "Yarn", "🧶"]];

// Words for "ABC order": level 0 by first letter, level 1 by second letter, level 2 by third letter and beyond.
export const ABC_ORDER = {
  0: ["apple", "ball", "cat", "dog", "egg", "fish", "goat", "hat", "ink", "jug", "kite", "lion", "mango", "nest", "owl", "pen", "queen", "rose", "sun", "tiger", "umbrella", "van", "watch", "yak", "zebra"],
  1: [["bat", "bed", "bin", "box", "bus"], ["cap", "cot", "cup", "cry", "cent"], ["mango", "melon", "milk", "moon", "mud"], ["pan", "pen", "pin", "pot", "pup"], ["sad", "sea", "sit", "sock", "sun"], ["tap", "ten", "tin", "top", "tub"], ["ram", "red", "rib", "rock", "run"]],
  2: [["cart", "case", "cash", "cast", "cat"], ["plan", "plane", "plant", "plate", "play"], ["stair", "star", "stare", "start", "state"], ["brain", "brake", "branch", "brave", "bread"], ["grain", "grape", "grass", "grave", "great"], ["shade", "shadow", "shake", "shall", "shame"]],
};

// ───────── Words ─────────
// Picture words: [word, emoji]. Used for "Picture words" and "Build the word".
export const PICTURE = {
  0: [["cat", "🐱"], ["dog", "🐶"], ["sun", "☀️"], ["hat", "🎩"], ["bus", "🚌"], ["pen", "🖊️"], ["cup", "☕"], ["bed", "🛏️"], ["box", "📦"], ["fox", "🦊"], ["pig", "🐷"], ["hen", "🐔"],
    ["bat", "🦇"], ["map", "🗺️"], ["net", "🥅"], ["rat", "🐀"], ["cow", "🐄"], ["egg", "🥚"], ["bag", "👜"], ["log", "🪵"], ["car", "🚗"], ["ant", "🐜"], ["van", "🚐"], ["nut", "🥜"],
    ["leg", "🦵"], ["bee", "🐝"], ["owl", "🦉"], ["key", "🔑"], ["web", "🕸️"], ["gem", "💎"]],
  1: [["fish", "🐟"], ["frog", "🐸"], ["tree", "🌳"], ["cake", "🎂"], ["star", "⭐"], ["moon", "🌙"], ["ship", "🚢"], ["kite", "🪁"], ["duck", "🦆"], ["bell", "🔔"], ["drum", "🥁"],
    ["tiger", "🐯"], ["apple", "🍎"], ["horse", "🐴"], ["mouse", "🐭"], ["house", "🏠"], ["chair", "🪑"], ["train", "🚆"], ["plane", "✈️"], ["snake", "🐍"], ["sheep", "🐑"], ["bread", "🍞"],
    ["pizza", "🍕"], ["rabbit", "🐰"], ["banana", "🍌"], ["pencil", "✏️"], ["rocket", "🚀"], ["carrot", "🥕"], ["monkey", "🐒"], ["turtle", "🐢"], ["basket", "🧺"], ["flower", "🌸"],
    ["candle", "🕯️"], ["guitar", "🎸"], ["lizard", "🦎"], ["parrot", "🦜"]],
  2: [["telescope", "🔭"], ["microscope", "🔬"], ["helicopter", "🚁"], ["volcano", "🌋"], ["dinosaur", "🦕"], ["calculator", "🧮"], ["thermometer", "🌡️"], ["kangaroo", "🦘"],
    ["crocodile", "🐊"], ["butterfly", "🦋"], ["umbrella", "☂️"], ["pineapple", "🍍"], ["strawberry", "🍓"], ["broccoli", "🥦"], ["ambulance", "🚑"], ["satellite", "🛰️"],
    ["scissors", "✂️"], ["parachute", "🪂"], ["compass", "🧭"], ["trophy", "🏆"], ["envelope", "✉️"], ["mushroom", "🍄"], ["octopus", "🐙"], ["penguin", "🐧"], ["giraffe", "🦒"],
    ["hedgehog", "🦔"], ["peacock", "🦚"], ["flamingo", "🦩"], ["elephant", "🐘"], ["hourglass", "⌛"]],
};

// Rhyme families (words that rhyme by sound). Level 1 adds rhymes spelled differently (blue, shoe, two).
export const RHYMES = {
  0: [["cat", "hat", "bat", "mat", "rat"], ["fan", "man", "pan", "van", "can"], ["pig", "big", "dig", "wig", "fig"], ["top", "hop", "mop", "pop", "shop"], ["sun", "run", "fun", "bun", "gun"],
    ["net", "pet", "wet", "jet", "get"], ["dog", "log", "fog", "frog", "hog"], ["cake", "lake", "make", "bake", "snake"], ["ball", "tall", "wall", "fall", "call"], ["king", "ring", "sing", "wing", "thing"],
    ["bee", "tree", "see", "three", "free"], ["star", "car", "jar", "far", "bar"], ["bell", "shell", "well", "smell", "tell"], ["book", "cook", "look", "hook", "took"],
    ["moon", "spoon", "soon", "noon", "balloon"], ["boat", "coat", "goat", "float", "throat"], ["rain", "train", "brain", "chain", "pain"], ["cold", "gold", "hold", "old", "told"],
    ["red", "bed", "fed", "led", "shed"], ["sock", "rock", "clock", "lock", "block"]],
  1: [["blue", "shoe", "two", "zoo", "true"], ["bear", "chair", "pear", "hair", "square"], ["eight", "late", "plate", "straight", "great"], ["phone", "bone", "stone", "alone", "grown"],
    ["door", "floor", "four", "more", "roar"], ["fly", "eye", "pie", "sky", "high"], ["toes", "nose", "rose", "goes", "knows"], ["light", "night", "kite", "bright", "white"],
    ["head", "bread", "said", "bed", "red"], ["juice", "goose", "loose", "moose", "truce"]],
};

// Opposites. No word has two opposites in its own level (so "old" is not here with both "new" and "young").
export const OPPOSITES = {
  0: [["big", "small"], ["hot", "cold"], ["up", "down"], ["happy", "sad"], ["fast", "slow"], ["day", "night"], ["open", "closed"], ["tall", "short"], ["full", "empty"], ["old", "new"],
    ["wet", "dry"], ["light", "dark"], ["in", "out"], ["push", "pull"], ["clean", "dirty"], ["near", "far"], ["early", "late"], ["soft", "hard"], ["thick", "thin"], ["rich", "poor"]],
  1: [["brave", "cowardly"], ["remember", "forget"], ["arrive", "depart"], ["accept", "refuse"], ["buy", "sell"], ["loud", "quiet"], ["strong", "weak"], ["polite", "rude"],
    ["safe", "dangerous"], ["cheap", "expensive"], ["easy", "difficult"], ["first", "last"], ["question", "answer"], ["friend", "enemy"], ["true", "false"], ["win", "lose"],
    ["entrance", "exit"], ["sweet", "sour"], ["borrow", "lend"], ["always", "never"], ["inside", "outside"], ["future", "past"]],
  2: [["ancient", "modern"], ["generous", "selfish"], ["victory", "defeat"], ["temporary", "permanent"], ["expand", "shrink"], ["majority", "minority"], ["rigid", "flexible"],
    ["optimist", "pessimist"], ["increase", "decrease"], ["artificial", "natural"], ["maximum", "minimum"], ["include", "exclude"], ["import", "export"], ["frequent", "rare"],
    ["guilty", "innocent"], ["praise", "criticise"], ["advance", "retreat"], ["scarce", "plentiful"], ["humble", "proud"], ["transparent", "opaque"], ["external", "internal"],
    ["superior", "inferior"], ["ascend", "descend"], ["hero", "villain"]],
};

// Plurals: [one, many, mistake, mistake]. The mistakes are ones children really make ("foots", "childs",
// "babys"). Words with two accepted plurals (fish/fishes, cactus/cacti, roof/rooves) are left out.
export const PLURALS = {
  0: [["cat", "cats", "cates", "cat"], ["dog", "dogs", "doges", "dog"], ["book", "books", "bookes", "book"], ["bag", "bags", "bages", "bag"], ["cup", "cups", "cupes", "cup"],
    ["ball", "balls", "balles", "ball"], ["egg", "eggs", "egges", "egg"], ["girl", "girls", "girles", "girl"], ["chair", "chairs", "chaires", "chair"], ["apple", "apples", "applees", "apple"],
    ["bus", "buses", "buss", "bus"], ["box", "boxes", "boxs", "box"], ["dish", "dishes", "dishs", "dish"], ["glass", "glasses", "glassies", "glass"], ["fox", "foxes", "foxs", "fox"],
    ["watch", "watches", "watchs", "watch"], ["brush", "brushes", "brushs", "brush"], ["bench", "benches", "benchs", "bench"], ["toy", "toys", "toies", "toyes"]],
  1: [["baby", "babies", "babys", "babyes"], ["city", "cities", "citys", "cityes"], ["lady", "ladies", "ladys", "ladyes"], ["story", "stories", "storys", "storyes"],
    ["leaf", "leaves", "leafs", "leafes"], ["knife", "knives", "knifes", "knifs"], ["wife", "wives", "wifes", "wifs"], ["wolf", "wolves", "wolfs", "wolfes"], ["half", "halves", "halfs", "halfes"],
    ["child", "children", "childs", "childrens"], ["mouse", "mice", "mouses", "mices"], ["foot", "feet", "foots", "feets"], ["tooth", "teeth", "tooths", "teeths"], ["man", "men", "mans", "mens"],
    ["woman", "women", "womans", "womens"], ["goose", "geese", "gooses", "geeses"], ["sheep", "sheep", "sheeps", "sheepes"], ["tomato", "tomatoes", "tomatos", "tomatoe"],
    ["potato", "potatoes", "potatos", "potatoe"], ["monkey", "monkeys", "monkies", "monkeyes"], ["day", "days", "daies", "dayes"], ["key", "keys", "kies", "keyes"]],
  2: [["crisis", "crises", "crisises", "crisis"], ["analysis", "analyses", "analysises", "analysis"], ["thesis", "theses", "thesises", "thesis"], ["axis", "axes", "axises", "axis"],
    ["phenomenon", "phenomena", "phenomenas", "phenomenon"], ["criterion", "criteria", "criterias", "criterion"], ["bacterium", "bacteria", "bacteriums", "bacterias"], ["ox", "oxen", "oxes", "oxs"],
    ["deer", "deer", "deers", "deeres"], ["series", "series", "serieses", "serie"], ["species", "species", "specieses", "speciess"], ["sister-in-law", "sisters-in-law", "sister-in-laws", "sisters-in-laws"],
    ["passer-by", "passers-by", "passer-bys", "passers-bys"], ["chief", "chiefs", "chieves", "chiefes"], ["piano", "pianos", "pianoes", "piano's"], ["photo", "photos", "photoes", "photo's"],
    ["hero", "heroes", "heros", "hero's"], ["echo", "echoes", "echos", "echo's"]],
};

// Spelling: [right, common misspelling, common misspelling]. British spelling (colour, neighbour); no
// US spelling is ever shown as a mistake.
export const SPELLING = {
  0: [["said", "sed", "siad"], ["was", "wos", "waz"], ["they", "thay", "tehy"], ["come", "kum", "coem"], ["there", "thare", "ther"], ["where", "wher", "whare"], ["what", "wat", "whot"],
    ["could", "cud", "coud"], ["friend", "freind", "frend"], ["school", "skool", "scool"], ["people", "peeple", "pepole"], ["because", "becuase", "becose"], ["many", "meny", "mony"],
    ["any", "eny", "enny"], ["again", "agen", "agian"], ["house", "hous", "howse"]],
  1: [["beautiful", "beutiful", "beautifull"], ["which", "wich", "whitch"], ["tomorrow", "tommorow", "tomorow"], ["different", "diffrent", "diferent"], ["February", "Febuary", "Februry"],
    ["library", "libary", "liberry"], ["believe", "beleive", "belive"], ["answer", "anser", "ansewr"], ["calendar", "calender", "calandar"], ["science", "sience", "scince"],
    ["neighbour", "nieghbour", "neighbur"], ["Wednesday", "Wensday", "Wednsday"], ["separate", "seperate", "separete"], ["surprise", "suprise", "surprize"], ["knowledge", "knowlege", "nowledge"],
    ["busy", "bizzy", "buisy"], ["guard", "gaurd", "gard"], ["island", "iland", "islend"], ["height", "hieght", "heigth"], ["special", "speshal", "specail"], ["address", "adress", "addres"],
    ["minute", "minit", "minnute"]],
  2: [["accommodate", "accomodate", "acommodate"], ["necessary", "neccessary", "necesary"], ["rhythm", "rythm", "rhythym"], ["conscience", "concience", "consciense"],
    ["definitely", "definately", "definitly"], ["embarrass", "embarass", "embaras"], ["occasion", "occassion", "ocassion"], ["privilege", "priviledge", "privilage"],
    ["guarantee", "guarentee", "garantee"], ["government", "goverment", "govermant"], ["environment", "enviroment", "envirnoment"], ["restaurant", "restaraunt", "resturant"],
    ["achievement", "acheivement", "achievment"], ["occurrence", "occurence", "ocurrence"], ["committee", "commitee", "comittee"], ["millennium", "millenium", "milennium"],
    ["pronunciation", "pronounciation", "pronunciasion"], ["questionnaire", "questionaire", "questionnair"], ["recommend", "reccommend", "recomend"], ["maintenance", "maintainance", "maintenence"],
    ["conscious", "concious", "consious"], ["exaggerate", "exagerate", "exxagerate"]],
};

// Kinds of words. Level 0: the word on its own. Levels 1–2: the word in a sentence (the same word can be
// different kinds: "water the plants" vs "drink water").
export const KINDS = {
  noun: "Naming word (noun)", verb: "Doing word (verb)", adj: "Describing word (adjective)",
  adv: "Adverb (how, when, where)", pron: "Pronoun (he, she, it…)", prep: "Preposition (in, on, under…)",
};
export const WORD_KINDS = {
  0: [[null, "dog", "noun"], [null, "school", "noun"], [null, "teacher", "noun"], [null, "mango", "noun"], [null, "river", "noun"], [null, "book", "noun"], [null, "table", "noun"], [null, "train", "noun"],
    [null, "jump", "verb"], [null, "eat", "verb"], [null, "write", "verb"], [null, "sing", "verb"], [null, "sleep", "verb"], [null, "swim", "verb"], [null, "laugh", "verb"], [null, "climb", "verb"],
    [null, "happy", "adj"], [null, "red", "adj"], [null, "tall", "adj"], [null, "sweet", "adj"], [null, "noisy", "adj"], [null, "brave", "adj"], [null, "tiny", "adj"], [null, "cold", "adj"]],
  1: [["The cat slept peacefully.", "peacefully", "adv"], ["She sings beautifully.", "beautifully", "adv"], ["The old man walked slowly.", "old", "adj"], ["The old man walked slowly.", "slowly", "adv"],
    ["We ran to the bus stop.", "ran", "verb"], ["My sister bought a kite.", "kite", "noun"], ["The noisy children played outside.", "noisy", "adj"], ["Grandma tells us stories.", "stories", "noun"],
    ["The baby smiled happily.", "happily", "adv"], ["Ravi kicked the ball hard.", "kicked", "verb"], ["A huge elephant came near.", "huge", "adj"], ["We will leave tomorrow.", "tomorrow", "adv"],
    ["The farmer grows wheat.", "farmer", "noun"], ["The farmer grows wheat.", "grows", "verb"], ["The sky looks grey today.", "grey", "adj"], ["Please speak softly.", "softly", "adv"]],
  2: [["I will water the plants.", "water", "verb"], ["Please drink some water.", "water", "noun"], ["The book is under the table.", "under", "prep"], ["She gave him a pen.", "him", "pron"],
    ["They arrived early.", "early", "adv"], ["The early bird catches the worm.", "early", "adj"], ["We watched a fast train.", "fast", "adj"], ["He runs fast.", "fast", "adv"],
    ["It is raining in Pune.", "It", "pron"], ["The cat jumped onto the wall.", "onto", "prep"], ["Their house is beside the temple.", "beside", "prep"], ["We must light the lamp.", "light", "verb"],
    ["This bag is light.", "light", "adj"], ["Turn off the light.", "light", "noun"], ["Everyone clapped loudly.", "Everyone", "pron"], ["We walked through the forest.", "through", "prep"]],
};

// Synonyms (same meaning). Wrong choices come from the same level, and never mean the same.
export const SYNONYMS = {
  0: [["big", "large"], ["small", "tiny"], ["happy", "glad"], ["begin", "start"], ["quick", "fast"], ["shut", "close"], ["smart", "clever"], ["angry", "cross"], ["below", "under"],
    ["gift", "present"], ["silent", "quiet"], ["choose", "pick"], ["end", "finish"], ["scared", "afraid"], ["kind", "nice"]],
  1: [["shout", "yell"], ["brave", "bold"], ["rich", "wealthy"], ["easy", "simple"], ["hard", "difficult"], ["mistake", "error"], ["fix", "repair"], ["huge", "enormous"], ["shy", "timid"],
    ["funny", "amusing"], ["fall", "drop"], ["build", "construct"], ["sad", "unhappy"], ["reply", "answer"], ["rapid", "swift"], ["discover", "find"], ["tired", "weary"], ["near", "close"]],
  2: [["abundant", "plentiful"], ["candid", "frank"], ["diligent", "hard-working"], ["obstinate", "stubborn"], ["eminent", "famous"], ["fragile", "delicate"], ["vacant", "empty"],
    ["vivid", "bright"], ["conceal", "hide"], ["commence", "begin"], ["prohibit", "forbid"], ["assist", "help"], ["sufficient", "enough"], ["courteous", "polite"], ["genuine", "real"],
    ["hostile", "unfriendly"], ["anxious", "worried"], ["inquire", "ask"], ["brief", "short"], ["purchase", "buy"], ["rectify", "correct"]],
};

// Prefixes and suffixes: [word, meaning].
export const AFFIXES = {
  1: [["unhappy", "not happy"], ["redo", "do again"], ["preview", "see before"], ["careless", "without care"], ["helpful", "full of help"], ["kindness", "being kind"],
    ["misspell", "spell wrongly"], ["impossible", "not possible"], ["rewrite", "write again"], ["fearless", "without fear"], ["unlock", "open the lock"], ["joyful", "full of joy"],
    ["unkind", "not kind"], ["replay", "play again"], ["painless", "without pain"], ["colourful", "full of colour"], ["teacher", "a person who teaches"], ["singer", "a person who sings"],
    ["dislike", "not like"], ["untidy", "not tidy"], ["hopeful", "full of hope"], ["homeless", "without a home"]],
  2: [["misunderstand", "understand wrongly"], ["overcook", "cook too much"], ["underpaid", "paid too little"], ["prehistoric", "before written history"], ["international", "between nations"],
    ["autobiography", "the story of a life, written by that person"], ["bicycle", "a cycle with two wheels"], ["submarine", "a ship that goes under the sea"], ["postpone", "put off until later"],
    ["disagree", "not agree"], ["incorrect", "not correct"], ["irregular", "not regular"], ["illegal", "not legal"], ["readable", "able to be read"], ["breakable", "able to be broken"],
    ["happiness", "the state of being happy"], ["childhood", "the time of being a child"], ["antisocial", "not wanting to be with other people"], ["semicircle", "half a circle"]],
};

// Sound-alike words (homophones): [sentence, right word, choices, hint].
export const HOMOPHONES = {
  1: [["___ going to school.", "They're", ["There", "Their", "They're"], "They're = they are."], ["The book is over ___.", "there", ["there", "their", "they're"], "there = a place."],
    ["This is ___ house.", "their", ["there", "their", "they're"], "their = belonging to them."], ["I have ___ pencils.", "two", ["to", "too", "two"], "two = the number 2."],
    ["I want to come ___.", "too", ["to", "too", "two"], "too = also."], ["We go ___ school.", "to", ["to", "too", "two"], "to = towards a place."],
    ["Is this ___ bag?", "your", ["your", "you're"], "your = belonging to you."], ["___ my best friend.", "You're", ["Your", "You're"], "You're = you are."],
    ["The dog wagged ___ tail.", "its", ["its", "it's"], "its = belonging to it (no apostrophe)."], ["___ raining today.", "It's", ["Its", "It's"], "It's = it is."],
    ["Can you ___ me?", "hear", ["hear", "here"], "You hear with your ear: h-EAR."], ["Please ___ your name.", "write", ["write", "right"], "write = put words on paper."],
    ["We swam in the ___.", "sea", ["see", "sea"], "sea = lots of salty water."], ["I ___ two dosas.", "ate", ["ate", "eight"], "ate = eaten (eight is the number 8)."],
    ["The ___ is shining.", "sun", ["son", "sun"], "sun = the star in the sky."], ["Grandma told us a ___ about a king.", "tale", ["tail", "tale"], "tale = a story."],
    ["I need a new ___ of shoes.", "pair", ["pair", "pear"], "pair = two of something."], ["There are seven days in a ___.", "week", ["weak", "week"], "week = seven days."],
    ["I ___ the answer!", "knew", ["new", "knew"], "knew = past of know."], ["There is a ___ in my sock.", "hole", ["hole", "whole"], "hole = a gap or opening."],
    ["We need ___ to make rotis.", "flour", ["flour", "flower"], "flour = powder for cooking."], ["The shop has a big ___ today.", "sale", ["sail", "sale"], "sale = things sold cheaply."],
    ["The ___ landed at the airport.", "plane", ["plain", "plane"], "plane = an aeroplane."], ["We ___ our bikes to school.", "rode", ["road", "rode"], "rode = past of ride."],
    ["Let's ___ at the park.", "meet", ["meat", "meet"], "meet = come together."], ["Our team ___ the match!", "won", ["one", "won"], "won = past of win."]],
  2: [["The ___ of our school gave a speech.", "principal", ["principal", "principle"], "principal = the head of a school."],
    ["Honesty is an important ___.", "principle", ["principal", "principle"], "principle = a rule or belief."],
    ["The car was ___ at the red light.", "stationary", ["stationary", "stationery"], "stationary = not moving (a for still: stAtionAry)."],
    ["Pens and paper are sold in the ___ shop.", "stationery", ["stationary", "stationery"], "stationery = paper and pens (e for envelope)."],
    ["She paid me a nice ___ on my drawing.", "compliment", ["complement", "compliment"], "compliment = praise."],
    ["Let us check the ___ before the trip.", "weather", ["weather", "whether"], "weather = rain, sun, wind."],
    ["I don't know ___ to laugh or cry.", "whether", ["weather", "whether"], "whether = if."],
    ["May I have a ___ of cake?", "piece", ["peace", "piece"], "piece = a part (a piece of pie)."],
    ["Press the ___ to stop the cycle.", "brake", ["brake", "break"], "brake = what stops a vehicle."],
    ["Read the poem ___ to the class.", "aloud", ["allowed", "aloud"], "aloud = so others can hear."],
    ["The bridge is made of ___.", "steel", ["steal", "steel"], "steel = a strong metal."],
    ["I eat ___ with milk for breakfast.", "cereal", ["cereal", "serial"], "cereal = grain food."],
    ["Don't ___ water; turn off the tap.", "waste", ["waist", "waste"], "waste = use badly."],
    ["The ___ ran into the forest.", "bear", ["bare", "bear"], "bear = the animal."],
    ["The new building ___ is near the river.", "site", ["sight", "site", "cite"], "site = a place for building."],
    ["The town ___ meets every month.", "council", ["council", "counsel"], "council = a group that makes decisions."],
    ["The eagle caught its ___.", "prey", ["pray", "prey"], "prey = an animal that is hunted."],
    ["Walk down the ___ to find your seat.", "aisle", ["aisle", "isle"], "aisle = a passage between rows."],
    ["We bought a train ticket; the ___ was ₹50.", "fare", ["fair", "fare"], "fare = the price of a journey."],
    ["She is doing a ___ in music.", "course", ["coarse", "course"], "course = lessons on a subject."]],
};

// ───────── Sentences ─────────
export const BUILD = {
  0: ["The cat is sleeping.", "I like mangoes.", "We go to school.", "The sun is hot.", "My dog can run fast.", "She is reading a book.", "Birds fly in the sky.", "Riya plays cricket.",
    "Please close the door.", "The fan is on.", "Aarav drinks warm milk.", "The train is very long.", "I can see a bird.", "The ball is red.", "We play in the park.", "Mother makes hot rotis.",
    "The baby is crying.", "I have two pencils.", "The milk is cold.", "Ravi has a new bag.", "The bus is late today.", "Grandpa reads the newspaper.", "The flowers are pretty.",
    "My kite is flying high.", "We eat rice for lunch.", "The bell rang loudly.", "I wash my hands.", "Diya waters the plants.", "The frog jumps high.", "She has long hair."],
  1: ["My grandmother tells me a story every night.", "The children are playing football in the park.", "We visited the zoo on Sunday.", "The farmer grows rice in his field.",
    "The farmer wakes up early every morning.", "Our class went on a trip to the museum.", "My little brother is afraid of the dark.", "We bought fresh vegetables at the market.",
    "The monkey climbed quickly up the tall tree.", "Please put your shoes near the door.", "It rained heavily all night in Hyderabad.", "The doctor told me to drink more water.",
    "Kabir scored three goals in the match.", "Grandma made sweet laddoos for Diwali.", "The library opens at nine in the morning.", "Birds build their nests with small twigs.",
    "The cricket match was stopped because of rain.", "I finished my homework before dinner."],
  2: ["Although it was raining, the children continued to play outside.", "If you water the plants daily, they will grow quickly.",
    "The old bridge, which was built in 1890, is still in use.", "Neither my brother nor my sister likes spicy food.", "Before the exam began, the teacher reminded us to stay calm.",
    "The train was delayed because a tree had fallen on the track.", "Not only did she win the race, but she also broke the record.", "The book that you lent me last week was very interesting.",
    "As soon as the bell rang, the students rushed out of the class.", "Whenever I visit my grandparents, they tell me old stories.", "Pongal is celebrated with great joy in Tamil Nadu.",
    "Since the shop was closed, we bought milk from the next street.", "The farmers were happy because the monsoon arrived on time."],
};

// Capital letters: level 1+ sentences have names of people, places, days and months.
export const CAPITALS = {
  1: ["Riya lives in Chennai.", "We visited Agra in December.", "My friend Kabir likes cricket.", "Diwali comes in October or November.", "The Ganga is a long river.",
    "Mr Rao teaches us maths on Monday.", "I was born in Hyderabad.", "Our school is near Gandhi Park.", "Ananya and I went to Mysore.", "Mount Everest is in the Himalayas.", "We go to Goa every May."],
  2: ["India became independent on 15 August 1947.", "Dr Kalam was born in Rameswaram, Tamil Nadu.", "The Taj Mahal was built by Shah Jahan.", "Lata Mangeshkar sang in many languages.",
    "The Brahmaputra flows through Assam."],
};

export const STATEMENTS = ["The sky is blue", "I love my school", "My brother is ten", "We ate idli for breakfast", "The shop is closed", "It is raining today", "Rice grows in wet fields",
  "My school bag is heavy", "The moon shines at night", "Grandpa planted a mango tree", "Cats like to sleep in the sun", "The train leaves at six", "We have a test on Friday", "Water boils at 100 degrees"];
export const QUESTIONS = ["Where is my bag", "Can you help me", "What is your name", "Do you like dosa", "Who is at the door", "How old are you", "When does the train leave", "Why is the sky blue",
  "Which colour do you like", "Have you finished your homework", "Is it going to rain today", "How many legs does a spider have", "Where do penguins live", "Are you coming to the party"];
export const EXCLAIMS = ["What a big elephant", "Wow, that was fast", "How beautiful the flowers are", "Hurray, we won", "What a lovely surprise", "Oh no, I missed the bus",
  "How tall that tower is", "What a delicious cake", "Help, the boat is sinking"];

// Fill the gap: [sentence, right word, choices]. Only one choice makes sense.
export const MISSING = {
  0: [["I brush my ___ every morning.", "teeth", ["teeth", "shoes", "book"]], ["The cow gives us ___.", "milk", ["milk", "eggs", "wool"]], ["We use an ___ when it rains.", "umbrella", ["umbrella", "oven", "ink"]],
    ["I write with a ___.", "pencil", ["pencil", "spoon", "comb"]], ["Fish live in ___.", "water", ["water", "trees", "sand"]], ["We sleep at ___.", "night", ["night", "noon", "lunch"]],
    ["A bird has two ___.", "wings", ["wings", "wheels", "tails"]], ["I wear ___ on my feet.", "shoes", ["shoes", "gloves", "caps"]], ["The cat drinks ___.", "milk", ["milk", "petrol", "ink"]],
    ["When I am thirsty, I drink ___.", "water", ["water", "sand", "paper"]], ["We see with our ___.", "eyes", ["eyes", "ears", "knees"]], ["A car has four ___.", "wheels", ["wheels", "wings", "legs"]],
    ["Bees make ___.", "honey", ["honey", "bread", "rice"]], ["The baby is sleeping, so please be ___.", "quiet", ["quiet", "loud", "noisy"]],
    ["When I am ill, I go to the ___.", "doctor", ["doctor", "baker", "tailor"]], ["We cut paper with ___.", "scissors", ["scissors", "spoons", "socks"]]],
  1: [["A ___ is a person who flies an aeroplane.", "pilot", ["pilot", "plumber", "potter"]], ["We use a ___ to see things that are very far away.", "telescope", ["telescope", "microscope", "stethoscope"]],
    ["The ___ of India is New Delhi.", "capital", ["capital", "village", "captain"]], ["Water turns into ice when it ___.", "freezes", ["freezes", "boils", "melts"]],
    ["A baby frog is called a ___.", "tadpole", ["tadpole", "cub", "calf"]], ["The doctor listened to my heartbeat with a ___.", "stethoscope", ["stethoscope", "telescope", "microscope"]],
    ["We celebrate Independence Day on 15th ___.", "August", ["August", "January", "October"]], ["A person who writes books is called an ___.", "author", ["author", "actor", "athlete"]],
    ["The ___ is the largest animal on Earth.", "blue whale", ["blue whale", "elephant", "giraffe"]], ["A ___ has three sides.", "triangle", ["triangle", "square", "circle"]],
    ["The ___ brings letters to our house.", "postman", ["postman", "fireman", "milkman"]], ["The heart pumps ___ around the body.", "blood", ["blood", "air", "food"]],
    ["Monkeys are good at ___ trees.", "climbing", ["climbing", "digging", "swimming"]], ["A year has twelve ___.", "months", ["months", "weeks", "days"]]],
  2: [["The judge listened to both sides before giving her ___.", "verdict", ["verdict", "recipe", "chorus"]], ["Penicillin was an important medical ___.", "discovery", ["discovery", "holiday", "argument"]],
    ["During a drought, farmers face a ___ of water.", "shortage", ["shortage", "flood", "surplus"]], ["The volcano began to ___, sending ash into the sky.", "erupt", ["erupt", "freeze", "whisper"]],
    ["An ___ is a word that means the opposite of another word.", "antonym", ["antonym", "synonym", "acronym"]], ["The ___ of a circle is the distance around it.", "circumference", ["circumference", "radius", "diameter"]],
    ["Plants give out ___ during photosynthesis.", "oxygen", ["oxygen", "carbon dioxide", "nitrogen"]], ["Because the road was ___, the bus had to drive slowly.", "slippery", ["slippery", "delicious", "generous"]],
    ["An ___ studies the stars and planets.", "astronomer", ["astronomer", "archaeologist", "architect"]], ["The museum displays ___ from the Indus Valley Civilisation.", "artefacts", ["artefacts", "vegetables", "vehicles"]],
    ["She was ___ to win the prize, so she practised every day.", "determined", ["determined", "careless", "sleepy"]], ["The heavy rain caused ___ in many low-lying areas.", "flooding", ["flooding", "sunshine", "silence"]]],
};

// Joining words: [sentence, right word]. Levels 0–1 choose from and/but/because/so/or.
export const JOINERS = {
  0: [["I like tea ___ coffee.", "and"], ["The bag is small ___ it holds a lot.", "but"], ["He stayed home ___ he was ill.", "because"], ["It was raining, ___ we took an umbrella.", "so"],
    ["Do you want rice ___ roti?", "or"], ["I was tired, ___ I still finished my homework.", "but"], ["We clapped ___ the song was lovely.", "because"], ["Mum bought apples ___ bananas.", "and"],
    ["The road was wet, ___ we walked slowly.", "so"], ["Shall we play cricket ___ football?", "or"], ["I wanted to go out, ___ it was too hot.", "but"], ["She was hungry, ___ she ate an apple.", "so"],
    ["We stayed inside ___ it was raining.", "because"], ["Would you like milk ___ juice?", "or"], ["Ravi ___ Kabir are best friends.", "and"], ["He missed the bus, ___ he was late for school.", "so"]],
  // Level 2: [sentence, right word, choices]. Each sentence has its own choices, because "although" and
  // "while" can both be right in some sentences ("While he was tired, he finished the race").
  2: [["___ he was tired, he finished the race.", "although", ["although", "because", "unless", "until"]],
    ["I will be there at six ___ the train is late.", "unless", ["unless", "although", "because", "while"]],
    ["Keep walking straight ___ you reach the temple.", "until", ["until", "although", "because", "unless"]],
    ["She read a book ___ waiting for the train.", "while", ["while", "until", "unless", "because"]],
    ["___ it was late, the shops were still open.", "although", ["although", "because", "unless", "until"]],
    ["Plants will die ___ they get water.", "unless", ["unless", "although", "because", "while"]],
    ["Wait here ___ I come back.", "until", ["until", "although", "because", "unless"]],
    ["Someone rang the bell ___ we were eating dinner.", "while", ["while", "until", "unless", "because"]],
    ["He wore a coat ___ it was very cold.", "because", ["because", "although", "unless", "until"]],
    ["___ the test was hard, everyone passed.", "although", ["although", "because", "unless", "until"]]],
};
export const JOIN_WORDS = ["and", "but", "because", "so", "or"];

// Tenses: [sentence, right form, choices].
export const TENSES = {
  0: [["Yesterday I ___ to the park.", "went", ["went", "go", "will go"]], ["Tomorrow we ___ a movie.", "will watch", ["watched", "watch", "will watch"]],
    ["Right now she ___ a song.", "is singing", ["sang", "is singing", "will sing"]], ["Last week he ___ his grandmother.", "visited", ["visits", "visited", "will visit"]],
    ["Next year I ___ ten years old.", "will be", ["was", "am", "will be"]], ["Every day the baby ___ milk.", "drinks", ["drank", "drinks", "will drink"]],
    ["Look! The dog ___ its tail.", "is chasing", ["chased", "is chasing", "will chase"]], ["Two days ago they ___ a kite.", "flew", ["fly", "flew", "will fly"]],
    ["Yesterday we ___ a big cake.", "ate", ["ate", "eat", "will eat"]], ["Now the children ___ in the park.", "are playing", ["played", "are playing", "will play"]],
    ["Next week we ___ to Goa.", "will go", ["went", "go", "will go"]], ["Every morning Dad ___ tea.", "makes", ["made", "makes", "will make"]]],
  1: [["I ___ my homework already.", "have finished", ["have finished", "finishing", "will finished"]], ["While I ___ TV, the lights went out.", "was watching", ["was watching", "am watching", "watch"]],
    ["When I reached the station, the train ___.", "had already left", ["had already left", "already leaves", "is leaving tomorrow"]], ["Look! It ___ heavily.", "is raining", ["is raining", "rained", "rains"]],
    ["Ravi ___ in this school since 2022.", "has studied", ["has studied", "studies", "will study"]], ["They ___ cricket when it started to rain.", "were playing", ["were playing", "are playing", "play"]],
    ["He ___ snow before, so he was very excited.", "had never seen", ["had never seen", "never sees", "will never see"]], ["She ___ for the bus since 8 o'clock.", "has been waiting", ["has been waiting", "waits", "will wait"]]],
  2: [["If I ___ harder, I would have passed.", "had studied", ["had studied", "have studied", "would study"]], ["If it rains tomorrow, we ___ at home.", "will stay", ["will stay", "would have stayed", "stayed"]],
    ["If I were a bird, I ___ fly to the mountains.", "would", ["would", "will", "did"]], ["By the time we arrived, the film ___.", "had started", ["had started", "has started", "starts"]],
    ["By next June, she ___ the piano for ten years.", "will have been playing", ["will have been playing", "has played", "plays"]], ["I wish I ___ the answer.", "knew", ["knew", "know", "will know"]],
    ["He ___ here since morning; he looks tired.", "has been working", ["has been working", "works", "will work"]], ["As soon as he ___ home, he will call you.", "gets", ["gets", "will get", "got"]]],
};

// Punctuation: [right, wrong, wrong].
export const PUNCT = {
  0: [["I bought apples, bananas and grapes.", "I bought apples bananas and grapes.", "I bought, apples bananas, and grapes"], ["Wow! That is a big cake.", "Wow that is a big cake?", "wow. That is a big cake"],
    ["Where are you going?", "Where are you going.", "where are you going"], ["Riya, please come here.", "Riya please come here?", "riya, please come here"],
    ["We live in Hyderabad, India.", "We live in hyderabad india.", "We live in Hyderabad India?"], ["My friends are Aarav, Meera and Kabir.", "My friends are Aarav Meera and Kabir.", "my friends are aarav, meera and kabir."],
    ["Yes, I would like some tea.", "Yes I would like some tea?", "yes, i would like some tea"], ["Stop! The light is red.", "Stop The light is red", "stop? the light is red."]],
  1: [["“Hello!” said the teacher.", "Hello said the teacher.", "“hello” said the teacher?"], ["Oh no! I dropped my ice cream.", "Oh no I dropped my ice cream?", "oh no, i dropped my ice cream"],
    ["Mum said, “Wash your hands.”", "Mum said wash your hands.", "Mum said, “wash your hands”?"], ["Riya's bag is blue.", "Riyas bag is blue.", "Riya's bag is blue?"],
    ["On Monday, we have an art class.", "on monday we have an art class", "On Monday? we have an art class."], ["I need eggs, milk, bread and butter.", "I need eggs milk bread and butter.", "I need, eggs milk, bread and butter"]],
  2: [["The children's books are on the shelf.", "The childrens' books are on the shelf.", "The childrens books are on the shelf."],
    ["My brother, who lives in Pune, is a doctor.", "My brother who lives in Pune, is a doctor.", "My brother, who lives in Pune is a doctor."],
    ["“Where are you going?” asked Meera.", "“Where are you going” asked Meera?", "“Where are you going.” asked Meera."],
    ["It's time to go; the bus is here.", "Its time to go; the bus is here.", "It's time to go the bus is here"],
    ["The girls' hostel is near the library.", "The girl's' hostel is near the library.", "The girls hostel is near the library"]],
};

// Subject and predicate: [sentence, subject, predicate, another phrase from the sentence].
export const SUBJECTS = {
  1: [["The little girl sang a song.", "The little girl", "sang a song", "a song"], ["My father drives a blue car.", "My father", "drives a blue car", "a blue car"],
    ["The tall tree fell in the storm.", "The tall tree", "fell in the storm", "the storm"], ["Our school won the match.", "Our school", "won the match", "the match"],
    ["A big black dog barked loudly.", "A big black dog", "barked loudly", "loudly"], ["The students of class five planted trees.", "The students of class five", "planted trees", "class five"],
    ["Grandma makes the best laddoos.", "Grandma", "makes the best laddoos", "the best laddoos"], ["The old train reached the station late.", "The old train", "reached the station late", "the station"],
    ["The bright red kite flew over the houses.", "The bright red kite", "flew over the houses", "the houses"], ["My best friend from Delhi visited us.", "My best friend from Delhi", "visited us", "Delhi"],
    ["The cows in the field are eating grass.", "The cows in the field", "are eating grass", "grass"], ["Swimming in the sea is fun.", "Swimming in the sea", "is fun", "the sea"],
    ["That old house on the hill looks scary.", "That old house on the hill", "looks scary", "the hill"], ["The children in the bus sang songs.", "The children in the bus", "sang songs", "songs"]],
};

// Active to passive: [active, passive, wrong, wrong].
export const VOICE = {
  1: [["Ravi wrote a letter.", "A letter was written by Ravi.", "A letter wrote Ravi.", "Ravi was written a letter."], ["The cat caught a mouse.", "A mouse was caught by the cat.", "The mouse caught a cat.", "A cat was caught by the mouse."],
    ["Meera painted the wall.", "The wall was painted by Meera.", "The wall painted Meera.", "Meera was painted by the wall."], ["The chef cooks the food.", "The food is cooked by the chef.", "The chef is cooked by the food.", "The food cooks the chef."],
    ["The boys will clean the room.", "The room will be cleaned by the boys.", "The room will clean the boys.", "The boys will be cleaned by the room."], ["The teacher praised Kabir.", "Kabir was praised by the teacher.", "The teacher was praised by Kabir.", "Kabir praised the teacher."],
    ["The police caught the thief.", "The thief was caught by the police.", "The police were caught by the thief.", "The thief caught the police."], ["The storm destroyed many houses.", "Many houses were destroyed by the storm.", "Many houses destroyed the storm.", "The storm was destroyed by many houses."]],
  2: [["The workers are building a new bridge.", "A new bridge is being built by the workers.", "A new bridge is built by the workers yesterday.", "The workers are being built by a new bridge."],
    ["Someone has stolen my bicycle.", "My bicycle has been stolen.", "My bicycle has stolen.", "My bicycle was stealing."], ["Shakespeare wrote Hamlet.", "Hamlet was written by Shakespeare.", "Hamlet is writing by Shakespeare.", "Shakespeare was written by Hamlet."],
    ["The gardener waters the plants every day.", "The plants are watered by the gardener every day.", "The plants water the gardener every day.", "The plants were watering by the gardener."],
    ["Our team will win the trophy.", "The trophy will be won by our team.", "The trophy will win our team.", "The trophy will be winning by our team."], ["Did Ravi break the window?", "Was the window broken by Ravi?", "Did the window break Ravi?", "Was Ravi broken by the window?"],
    ["The students had finished the project.", "The project had been finished by the students.", "The project has finished the students.", "The students had been finished by the project."]],
};

// Reported speech: [direct, reported, wrong, wrong].
export const SPEECH = {
  1: [["He said, “I am tired.”", "He said that he was tired.", "He said that I am tired.", "He said that he is tired now."], ["She said, “I like mangoes.”", "She said that she liked mangoes.", "She said that I like mangoes.", "She says she liked mangoes."],
    ["Mother said, “Close the door.”", "Mother told me to close the door.", "Mother said that close the door.", "Mother told that I closed the door."], ["Kabir said, “I am reading a book.”", "Kabir said that he was reading a book.", "Kabir said that I am reading a book.", "Kabir said that he is read a book."],
    ["She said, “I can swim.”", "She said that she could swim.", "She said that I can swim.", "She said that she can swam."], ["The coach said, “Run faster!”", "The coach told us to run faster.", "The coach said that run faster.", "The coach told us that we run faster."]],
  2: [["Ravi said, “I will come tomorrow.”", "Ravi said that he would come the next day.", "Ravi said that I will come tomorrow.", "Ravi said he comes tomorrow."],
    ["The boy asked, “Where is my ball?”", "The boy asked where his ball was.", "The boy asked where is my ball.", "The boy said where his ball is?"],
    ["Riya said, “We are going to Delhi.”", "Riya said that they were going to Delhi.", "Riya said that we are going to Delhi.", "Riya said they go to Delhi."],
    ["The teacher said, “The earth goes round the sun.”", "The teacher said that the earth goes round the sun.", "The teacher said that the earth went round the sun.", "The teacher said that the earth is going round the sun."],
    ["Meera said, “I have finished my work.”", "Meera said that she had finished her work.", "Meera said that I have finished my work.", "Meera said that she has finished my work."],
    ["He asked me, “Are you hungry?”", "He asked me if I was hungry.", "He asked me are you hungry.", "He asked me that was I hungry."],
    ["The boy said, “I lost my pen yesterday.”", "The boy said that he had lost his pen the day before.", "The boy said that I lost my pen yesterday.", "The boy said that he loses his pen yesterday."]],
};
