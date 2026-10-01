# Binary Adventure: Course Guide for Parents

**Bit's mission: say THANK YOU to a computer.** Bit the Robot only knows two words: ON and OFF. The adventure starts with a conversation (can a computer understand us?), teaches the computer's two-word language, and ends with the mission: typing THANK YOU in binary, and the computer answering "You're welcome! 😊". That is **11 steps plus 4 bonus games**.

- **Younger children** unlock the steps one at a time. **From 5th standard** every step is open.
- **From 6th standard**, Big cards uses 8 lamps (0–255, a full byte), and Secret message uses the full A–Z code.
- The steps count dots and apples before any adding, and say "one-zero", never "ten".

| Step | What your child does | What they learn | Try at home |
|---|---|---|---|
| 1. 💡 **Bit's lamp** | Meet Bit. ON and OFF. | Computers only know two things: ON and OFF. | Point at light switches at home. Everything in a computer is made of tiny switches that are ON or OFF. |
| 2. 📡 **Secret signal** | One lamp sends a message. | One lamp can send 2 different messages. | Agree a secret signal at home, e.g. porch light ON means “come inside”. One light can only say two things. |
| 3. 💡💡 **Two lamps** | Find every pattern. | Two lamps make 4 patterns, so 4 messages! | Use two torches or two hands up/down. Ask: how many different signals can we make? (4) |
| 4. ✨ **Magic doubling** | Add a lamp, double the patterns. | Every new lamp DOUBLES the number of patterns. | Ask: if one more lamp doubles the patterns, how many would 5 lamps make? (32) Doubling is the heart of binary. |
| 5. 🍎 **Apple cards** | Count apples with lamps. | Add up the apples on the ON cards to get the number. ON is 1, OFF is 0. | Use real coins or sweets in cups of 1, 2 and 4. Make 1 to 7 by choosing cups; say the lamps as 1s and 0s. |
| 6. 🔢 **Counting machine** | Press +1 and watch. | Binary counting: the last lamp blinks every time. | Count 0–7 on three fingers (thumb = 1, pointer = 2, middle = 4). The thumb flips every time: odd and even! |
| 7. 🃏 **Big cards** | Make bigger numbers. | You can make any number with doubling cards. You speak binary! | Try finger binary on one hand: 5 fingers count to 31. Ask your child to show their age. |
| Bonus. 🖼️ **Pixel painter** | Decode a secret picture. | Pictures are made of pixels, and pixels are stored as bits. | Zoom right into a photo on a phone until you see squares. Each square is a pixel stored as numbers. |
| Bonus. 🔐 **Secret message** | Decode Bit's secret words. | Letters are stored as numbers, and numbers as bits. | Write a secret note with A=1, B=2… and let your child decode it. |

## Bit's mission (new steps)
| Step | What your child does | What they learn | Try at home |
|---|---|---|---|
| 💬 **Can a computer understand us?** (first step) | A conversation with Bit: "If someone asks you for water, what do you do? Would a computer?" and the story of a new friend who speaks a different language. Every answer gets a reply; wrong guesses are welcomed, then gently corrected. | Computers don't understand our words. They have their own language with two words: ON and OFF (1 and 0). | Ask your child the same questions, and let them explain. |
| 🔤 **Letters are numbers** (after Big cards) | A short conversation: A is 65, B is 66… what is C? What is H? | Every letter has a number; a space is 32; small letters have their own numbers (a is 97). | Work out the numbers for the letters of your child's name. |
| 💡 **A letter in 8 lamps** | Turns on lamp cards (128 … 1) to make 72, then 73. The little screen shows **HI**. | Each letter is 8 lamps, called a byte. | How many lamps for "HI"? (16) |
| 🎯 **Mission: say THANK YOU** | Builds T, H and A in lamps, then builds the rest or lets Bit type it. The screen shows THANK YOU, and the computer answers "You're welcome!" | THANK YOU is 9 letters × 8 lamps = 72 ONs and OFFs. Earns the 🙏 **Computer talker** badge. | Ask your child to explain how a computer stores a word. |
| 🪪 **Your name in binary** (bonus) | Types any word and sees every letter as 8 lamps. | Any word can be stored as bytes; capital and small letters have different codes. | Write the family's names in binary. |
| 🧑‍🤝‍🧑 **Meet the translator** (bonus) | A conversation: do people type 1s and 0s all day? | People write in coding languages (Scratch, Python); a translator program (compiler) turns them into binary, like a friend who speaks both languages. | Try the Robot puzzles together. |

The conversation steps are a reusable format (`components/journey/Conversation.jsx`, scripts in `content/binaryTalk.js`), so other subjects can teach the same way.

