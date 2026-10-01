# Spark Lab

A learning app for kids (1st to 12th standard) covering **language**, **maths**, **electricity & parts**, **inside a computer**, **binary**, **coding puzzles** and **touch typing** (for adults too). It has picture cards with real-life examples, hands-on games, quizzes, badges, a parent dashboard and an admin content editor.

Live site: https://cg3-solutions.github.io/kids-tech-learning/

## What's inside

| Path | What it is |
|---|---|
| `web/` | The app (React + Vite) |
| `supabase/schema.sql` | Database tables and security rules for Supabase |
| `docs/` | Teaching guides. They also appear inside the app under **Parent area → Teaching guides** |
| `.github/workflows/deploy.yml` | Builds, tests and deploys to GitHub Pages on every push to `main` |

### Features
- **Accounts and two modes:** only grown-ups have accounts (email + password, sign-in link, optional Google). Children are profiles with a first name and an animal avatar, never an email.
  - **👪 Parent dashboard:** where a grown-up lands after signing in. It holds learners, progress reports, **⚙️ Settings** (screen time, email notifications, voice & sound, account), teaching guides and classes.
  - **🧒 Kids' mode:** started from the dashboard with **Start kids' mode**. It shows only the "Who's learning today?" picker, lessons and games. Getting back to the dashboard needs the **parent password** (the account's sign-in password), even if the address is typed in. After 5 wrong tries it pauses for 30 seconds. Accounts made with Google or an email link can use **Email me a sign-in link**, or set a password in Settings → Account.
- **Kids:** subject cards with **Read to me**, a treasure hunt, robot puzzles, quizzes, stars and badges.
- **Adventures** (step-by-step, with a story character, sounds and a map):
  - **Volt's circuit adventure** (Electricity): 15 steps in three parts, from a simple loop to AND/OR/NOT/XOR gates, an adder and memory, plus a **Free workshop** for building circuits with parts or gates. See `docs/04-circuits-and-gates.md`.
  - **Chip's computer path** (Inside a Computer): 13 concepts in three parts, from "What is a computer?" to "Staying safe online". Each step has six short screens: Think → Learn → See it → Do it → Check → Recap, at three depths (Class 1–3, 4–7, 8–12), chosen by the child's class, with **Go deeper** and **Simpler** buttons. The star needs 2 of 3 check questions right. Activities include Be the computer, Power cut, Build a computer and Be the screen. Missed questions come back for spaced review (1, 3, then 7 days); Chip's quiz mixes picture, true/false, ordering and spot-the-bug questions; and the parent report shows which concepts need practice. The old cards remain as a read-only Glossary. See `docs/09-computer-course.md`.
  - **Bit's binary adventure** (Binary Magic): 7 steps plus 2 bonus games. See `docs/05-binary-adventure.md`.
  - **Polly the Parrot** (Language): Alphabets (9 steps), Words (10) and Sentences (10). See `docs/06-language-course.md`.
  - **Ollie the Octopus** (Maths): Numbers (12 steps) and Mathematics (16 steps, up to 10th standard). See `docs/07-maths-course.md`.
  - **Keyo's typing course** (Typing): 33 lessons in six stages (get ready, home row, top row, bottom row, capitals and punctuation, numbers and symbols) with an on-screen keyboard coloured by finger, a hands guide, speed and accuracy, stars, and **Kids** and **Pro** modes (Pro for older kids and adults). Keyo climbs a ladder as you type, Pro mode has a speedometer, and streaks earn flames. Also a **🪜 Speed ladder** (1-minute tests from 5 to 60 words a minute, racing a pacer), four games (**Balloon Pop**, **Word Rocket**, **Typing Race**, **Beat the Clock**), **⏱️ typing tests** with printable **📜 certificates**, and **📈 My progress** (smart practice on weak keys, speed and accuracy charts, a keyboard heat map, a family leaderboard). Grown-ups can add themselves to learn typing. See `docs/08-typing-course.md`.
- **Schools:** a grown-up can turn on **I'm a teacher**, create classes with join codes, set typing tasks with due dates, see a class dashboard and download it as a spreadsheet. Parents join their child with the code, and teachers see typing results only.
  - The Language and Maths steps use one shared practice engine. It supports picture choices, a number pad, word and letter tiles, and learning cards, with visuals such as counting grids, place-value blocks, fractions and shapes. Questions are generated fresh each time.
  - Steps adapt to the child's class (standard): younger children unlock steps in order; older children can open later parts straight away.
  - **Levels switch:** in Parent dashboard → Learners, set each learner to **🔒 In order** (the default) or **🔓 All open**. All open opens every level of every subject, including the typing games and tests, which is handy for testing, revision or a confident learner.
- **Kid navigation:** four areas (🔤 Language · 🔢 Maths · 🔬 Science & Tech · ⌨️ Typing), a "Continue where you left off" card, breadcrumbs, a bottom tab bar on phones and tablets and a side rail on computers. Account menu: Switch learner · Parent dashboard & settings · Sign out.
- **Parent dashboard** (behind the parent password): Overview · Learners · Progress reports (7-day learning time, subjects, adventures, typing speed and weak keys, activity timeline) · Screen time · Notifications · Voice & sound · Teaching guides · Account.
- **Screen time:** a daily limit per child, counting active time only, with a 5-minute warning, a "Time's up" screen, and "+15 minutes" for grown-ups.
- **Voices:** four voices (Bright girl, Cheerful boy, Clear teacher, Friendly robot), chosen by default from the child's gender and changeable per child, with a preview button. Lines are read sentence by sentence with key words stressed, with 🐢 Slowly and Stop buttons and a speaking-speed setting. Optional natural voices: Google's Indian English neural voices (see below).
- **Email:** milestone emails (badges, finished subjects) and an 8 pm daily summary, sent by a Supabase Edge Function through Resend.
- **Admins:** create and edit subjects, cards (every field, including circuit symbols) and quiz questions, save drafts, publish, and load the starter content.
- **Demo mode:** without Supabase settings, the app runs fully in the browser (saved in localStorage). This is useful for trying it out and for development.

## Run it locally

```bash
cd web
npm install
npm run dev      # http://localhost:5173 (demo mode)
npm test
```

To use Supabase locally, copy `web/.env.example` to `web/.env.local` and fill in your values.

## Set up accounts and the database (Supabase, free tier)

1. Create a project at https://supabase.com. Pick the region closest to your users (e.g. Mumbai).
2. **SQL Editor → New query**: paste all of `supabase/schema.sql` and click **Run**.
3. **Authentication → URL Configuration**:
   - Site URL: `https://cg3-solutions.github.io/kids-tech-learning/`
   - Redirect URLs: add the same URL, plus `http://localhost:5173/` for local development.
4. Get the two values. The easiest way is the **Connect** button at the top of the project dashboard. They are also under **Project Settings (gear icon) → Data API** and **→ API Keys**:
   - **Project URL** looks like `https://<project-id>.supabase.co`. It is *not* the `supabase.com/dashboard/...` address in your browser.
   - The **publishable key** (`sb_publishable_...`) or the legacy **anon public** key (`eyJ...`). Both are meant to be public; the security rules in `schema.sql` protect the data. **Never** use the `service_role` or `sb_secret_...` key in the app.
5. In GitHub, go to **Settings → Secrets and variables → Actions → Variables** and add:
   - `VITE_SUPABASE_URL` = the Project URL
   - `VITE_SUPABASE_ANON_KEY` = the publishable or anon key
6. Re-run the deploy (**Actions → Deploy Spark Lab → Run workflow**).
7. Sign up in the app. Then make yourself admin in **SQL Editor**:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
8. Open **Parent area → Content editor → Load starter content** to copy the lessons into the database.

**Optional: Google sign-in.** Enable the Google provider in **Supabase → Authentication → Providers** (this needs a Google Cloud OAuth client). Then add the Actions variable `VITE_ENABLE_GOOGLE` = `true`.

**Email limits:** Supabase's built-in email sender only allows a few emails per hour. Before inviting many families, add your own SMTP provider under **Authentication → Emails → SMTP settings**.

## Upgrading an existing database (release 2)
If your database was set up before screen time and notifications existed, run `supabase/release-2.sql` once in the SQL Editor. It's safe to re-run.

## Upgrading an existing database (release 3: typing)
Run `supabase/release-3.sql` once in the SQL Editor. It adds the typing results table and turns the Typing subject on. It's safe to re-run. Until you run it, lessons still unlock and earn stars, but speed and accuracy results aren't saved.

## Upgrading an existing database (release 4: grown-up learners and schools)
Run `supabase/release-4.sql` once in the SQL Editor (after release 3). It adds grown-up learner profiles and the classes, members and tasks tables with their security rules. It's safe to re-run.

## Email notifications (optional)
Parents choose milestone emails and/or a daily summary under **Parent area → Notifications**. Until this is set up, notifications appear in that page's history as "Waiting to send".

1. **Resend:** create a free account at https://resend.com and create an **API key**. To email parents other than yourself, also **add and verify your domain** (Resend → Domains). The built-in test sender only delivers to your own address.
2. **Supabase → Edge Functions → Deploy a new function → Via editor.** Name it `notify`, paste `supabase/functions/notify/index.ts`, and deploy. Then open the function's settings and turn **off** "Verify JWT", because the function checks its own secret instead.
3. **Edge Functions → Secrets:** add
   - `RESEND_API_KEY`: your Resend key
   - `MAIL_FROM`: e.g. `Spark Lab <hello@yourdomain.com>`
   - `NOTIFY_SECRET`: any long random text (keep a copy for the next step)
   - `APP_URL`: `https://cg3-solutions.github.io/kids-tech-learning/`
4. **Database → Extensions:** enable `pg_net` and `pg_cron`.
5. **SQL Editor:** open `supabase/notifications-setup.sql`, replace `YOUR-PROJECT-REF` and `YOUR-NOTIFY-SECRET`, and run it. Milestone emails go out as they happen; the daily summary goes out at 8 pm India time.

## Natural voices (optional, release 5)
Lessons can be read by Google's Indian English neural voices: clearer, with stressed words and pauses, and the same on every phone. Each line is recorded once and then played from storage, so it costs very little. Lines with a child's or parent's name always use the device's own voice: names are never sent to Google. Without this setup (and in the demo), the device's voice is used.

1. **Google Cloud:** create a project, enable the **Cloud Text-to-Speech API** (needs a billing account; there is a monthly free allowance), and set a budget alert under **Billing → Budgets & alerts**. Create an **API key** under **APIs & Services → Credentials** and restrict it to the Cloud Text-to-Speech API.
2. **Supabase → SQL Editor:** run `supabase/release-5.sql` once. It adds the public `tts` storage bucket for the recordings and the usage table for the limits. It's safe to re-run.
3. **Supabase → Edge Functions → Deploy a new function → Via editor.** Name it `tts`, paste `supabase/functions/tts/index.ts`, and deploy. Turn **"Verify JWT" off** (the function checks the sign-in itself; with it on, the browser's CORS check is blocked).
4. **Edge Functions → Secrets:** add `GOOGLE_TTS_KEY` (the API key). Optional limits: `TTS_DAILY_CHARS` (per family per day, default 20000) and `TTS_MONTHLY_CHARS` (whole app, default 900000).
5. Parents can turn natural voices off under **Parent dashboard → Voice & sound**.

If a limit is reached or Google is unavailable, the app quietly uses the device voice. Changing `VERSION` in both `supabase/functions/tts/index.ts` and `web/src/lib/neuralVoice.js` re-records every line.

## GitHub Pages
In **Settings → Pages**, set **Source** to **GitHub Actions**. After that, every push to `main` deploys automatically.

## Privacy
- Children's data is limited to a first name, an avatar and learning progress, all owned by the parent's account.
- Row-level security means each parent can read and change only their own children. Only admins can edit lessons.
- Deleting a child deletes all their progress. Deleting the parent account deletes everything.
- Before opening the app to the public, add a privacy policy page that covers India's DPDP Act and, if you have US users, COPPA.
