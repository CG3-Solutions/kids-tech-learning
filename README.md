# Kids Tech Learning

Guides and a kid-friendly web app for teaching a 7-year-old (2nd standard) about electricity, electronic parts, computers and programming. These are the first steps toward robotics and quantum computing later on.

## What's inside

| Path | What it is |
|---|---|
| [docs/01-learning-roadmap.md](docs/01-learning-roadmap.md) | Where to start and the long-term path: ages 7 → teens |
| [docs/02-electronic-components.md](docs/02-electronic-components.md) | Every part, explained simply, with real-life examples and a question to ask |
| [docs/03-activities-and-safety.md](docs/03-activities-and-safety.md) | Treasure hunt, how machines fit together, weekly plan and safety rules |
| [app/index.html](app/index.html) | **Spark Lab**, the app to show him (open in any browser, phone or tablet) |

## Live site (GitHub Pages)
Once GitHub Pages is on, the app is at `https://cg3-solutions.github.io/kids-tech-learning/`, and the docs are at `.../docs/01-learning-roadmap.html` and so on.

To turn it on: repo **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, folder `/ (root)` → Save**. It goes live in 1–2 minutes.

## Using the app
Open `app/index.html` in a browser. It works offline, apart from the fonts. It has:
- **Parts:** picture cards for each component (what it is, what it's like, where to find it at home, its circuit symbol, a "Think!" question, and a "Try it" activity). Tap **Read to me** to hear it read aloud.
- **Build a circuit:** flip a switch and connect a bulb, motor, buzzer or LED. Try turning the LED around.
- **Machines:** how a street light, washing machine, parking sensor and toy robot are built.
- **Quiz:** 8 random questions, and he earns stars.
- **Treasure hunt:** walk around the house and tick what each appliance has inside.
- **For parents:** the learning path, a sample week, what to buy, and the safety rules.

`app/spark-lab.html` is the same page without the HTML wrapper (the version published as a Claude artifact).
