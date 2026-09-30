# Spark Lab

A learning app for young kids (about 6–10) covering **electricity & parts**, **inside a computer**, **binary** and **coding puzzles**. It has picture cards with real-life examples, hands-on games, quizzes, badges, a parent dashboard and an admin content editor.

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
  - Steps adapt to the child's class (standard): younger children unlock steps in order; older children can open later parts straight away.
- **Parents:** a maths-question gate, then per-child progress for each subject, recent quiz scores, a "Teach next" suggestion, child management and teaching guides.
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

## GitHub Pages
In **Settings → Pages**, set **Source** to **GitHub Actions**. After that, every push to `main` deploys automatically.

## Privacy
- Children's data is limited to a first name, an avatar and learning progress, all owned by the parent's account.
- Row-level security means each parent can read and change only their own children. Only admins can edit lessons.
- Deleting a child deletes all their progress. Deleting the parent account deletes everything.
- Before opening the app to the public, add a privacy policy page that covers India's DPDP Act and, if you have US users, COPPA.
