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
- **Accounts:** only parents sign up (email + password, sign-in link, optional Google). Children are profiles with a first name and an animal avatar, never an email.
- **Kids:** "Who's learning?" picker, subject cards with **Read to me**, a treasure hunt, robot puzzles, quizzes, stars and badges.
- **Adventures** (step-by-step, with a story character, sounds and a map):
  - **Volt's circuit adventure** (Electricity): 15 steps in three parts, from a simple loop to AND/OR/NOT/XOR gates, an adder and memory, plus a **Free workshop** for building circuits with parts or gates. See `docs/04-circuits-and-gates.md`.
  - **Bit's binary adventure** (Binary Magic): 7 steps plus 2 bonus games. See `docs/05-binary-adventure.md`.
  - **Polly the Parrot** (Language): Alphabets (9 steps), Words (10) and Sentences (10). See `docs/06-language-course.md`.
  - **Ollie the Octopus** (Maths): Numbers (12 steps) and Mathematics (16 steps, up to 10th standard). See `docs/07-maths-course.md`.
  - **Keyo's typing course** (Typing): 15 lessons in three stages (get ready, home row, top row) with an on-screen keyboard coloured by finger, a hands guide, speed and accuracy, stars, and **Kids** and **Pro** modes (Pro for older kids and adults). Keyo climbs a ladder as you type, Pro mode has a speedometer, and streaks earn flames. Also a **🪜 Speed ladder** (1-minute tests from 5 to 60 words a minute, racing a pacer) and four games: **Balloon Pop**, **Word Rocket**, **Typing Race** and **Beat the Clock**. See `docs/08-typing-course.md`.
  - The Language and Maths steps use one shared practice engine. It supports picture choices, a number pad, word and letter tiles, and learning cards, with visuals such as counting grids, place-value blocks, fractions and shapes. Questions are generated fresh each time.
  - Steps adapt to the child's class (standard): younger children unlock steps in order; older children can open later parts straight away.
- **Kid navigation:** four areas (🔤 Language · 🔢 Maths · 🔬 Science & Tech · ⌨️ Typing), a "Continue where you left off" card, breadcrumbs, a bottom tab bar on phones and tablets and a side rail on computers. Account menu: Switch child · Grown-ups · Sign out.
- **Parent console** (behind a maths-question gate): Overview · Children · Progress reports (7-day learning time, subjects, adventures, typing speed and weak keys, activity timeline) · Screen time · Notifications · Voice & sound · Teaching guides · Account.
- **Screen time:** a daily limit per child, counting active time only, with a 5-minute warning, a "Time's up" screen, and "+15 minutes" for grown-ups.
- **Voices:** four kid-friendly voices (Bright girl, Cheerful boy, Friendly robot, Calm teacher), chosen by default from the child's gender and changeable per child, with a preview button.
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

## GitHub Pages
In **Settings → Pages**, set **Source** to **GitHub Actions**. After that, every push to `main` deploys automatically.

## Privacy
- Children's data is limited to a first name, an avatar and learning progress, all owned by the parent's account.
- Row-level security means each parent can read and change only their own children. Only admins can edit lessons.
- Deleting a child deletes all their progress. Deleting the parent account deletes everything.
- Before opening the app to the public, add a privacy policy page that covers India's DPDP Act and, if you have US users, COPPA.
