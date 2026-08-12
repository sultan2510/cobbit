# COBBIT — Hackathon #01 Website

The official website for **COBBIT Hackathon #01** (Aug 31 – Sep 6, 2026, remote, Pakistan). Handles registration, payment proof review, project submissions, and automatic certificate generation.

**Stack:** Next.js 14 (App Router) · Supabase (Auth, Postgres, Storage) · Resend (email) · Tailwind CSS · pdf-lib · deployed on Vercel

---

## Features

| Area | What it does |
|---|---|
| **Public site** | Hero, event overview + countdown, why participate, how it works, who should join, prize, timeline, FAQ, community links, final CTA |
| **Registration** | Create account → Individual (300 PKR) or Team of 3 (500 PKR) → university/student ID upload → Easypaisa transaction ID + payment screenshot |
| **Participant dashboard** | Live registration status (pending / approved / rejected), project submission form once approved, downloadable certificates once issued |
| **Admin dashboard** | Review pending registrations, view payment proof & student ID, approve/reject with a reason, view submissions, announce the winner, export registrations to CSV, **edit event dates/prize/community links from a Settings tab — no code changes needed between hackathons** |
| **Certificates** | One click on the winning submission generates a branded PDF **Certificate of Participation** for every approved participant (every team member individually, not just leaders) plus a **Certificate of Appreciation** for the winning team — emailed automatically and stored for re-download |
| **Emails (Resend)** | Registration received → Approved / Rejected (with reason) → Certificates issued |

---

## Project structure

```
cobbit-website/
├─ supabase/
│  └─ schema.sql          # run once in Supabase SQL Editor — tables, RLS, storage buckets
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                    # homepage
│  │  ├─ register/page.tsx           # signup + registration form
│  │  ├─ login/page.tsx              # participant login
│  │  ├─ dashboard/page.tsx          # participant dashboard
│  │  ├─ admin/login/page.tsx        # admin login
│  │  ├─ admin/dashboard/page.tsx    # admin dashboard
│  │  └─ api/
│  │     ├─ register/route.ts                 # sends "registration received" email
│  │     └─ admin/
│  │        ├─ approve/route.ts               # sends "approved" email
│  │        ├─ reject/route.ts                # sends "rejected" email
│  │        └─ announce-results/route.ts      # marks winner + generates & emails all certificates
│  ├─ components/          # UI components (sections/, forms, admin dashboard, etc.)
│  └─ lib/
│     ├─ supabase/         # browser / server / admin (service-role) clients
│     ├─ email.ts          # Resend email templates
│     ├─ certificate.ts    # PDF certificate generator (pdf-lib)
│     └─ types.ts
└─ .env.example
```

---

## Quick start — deploy first, connect services after

This is the fastest path if you want the site live on a URL before finishing Supabase/Resend setup. The site builds and deploys fine with no environment variables — nothing calls Supabase or Resend until someone actually registers, so you can wire those up afterward without redoing the deploy from scratch.

1. **Push to GitHub** (see [Git commands](#git-commands) below).
2. **Deploy to Vercel** — import the repo, deploy with no env vars yet. You'll get a working homepage at a `.vercel.app` URL.
3. **Set up Supabase** — run `supabase/schema.sql`, grab your API keys.
4. **Set up Resend** — verify a sending domain (or use their instant test address).
5. **Add environment variables in Vercel** and redeploy — registration, login, and emails now work.
6. **Create your admin account** and promote it to `role = 'admin'` in Supabase.
7. **Connect your Namecheap domain.**
8. **Run the full end-to-end test checklist** before sharing the link publicly.

Full details for each step are below.

---

## Git commands

From inside the `cobbit-website` folder (the one containing `package.json`):

```bash
git init
git add .
git commit -m "Initial COBBIT website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git pull origin main --allow-unrelated-histories   # only needed if GitHub created a README for you
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `.next/`, and `.env.local` — confirm none of those show up on GitHub after pushing.

---

## 1. Deploy to Vercel (no env vars yet)

**Dashboard:**
1. [vercel.com](https://vercel.com) → **Add New → Project** → import your GitHub repo → **Deploy**.

**Or via CLI:**
```bash
npm install -g vercel
vercel login
vercel            # deploys a preview
vercel --prod     # deploys to production
```

✅ **Check:** open the generated URL — the homepage should load fully (hero, countdown, sections). Registration/login won't work yet — that's expected until Supabase is connected.

---

## 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste the full contents of `supabase/schema.sql` → **Run**.
3. **Project Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose client-side)
4. **Authentication → Providers** → confirm Email is enabled.
5. *(Optional, for faster testing)* **Authentication → Settings** → turn off "Confirm email" so test accounts can log in immediately without clicking a confirmation link.

✅ **Check:** **Table Editor** shows `profiles`, `registrations`, `submissions`, `certificates`. **Storage** shows `payment-proofs`, `student-ids`, `certificates` buckets.

---

## 3. Set up Resend

1. Create an account at [resend.com](https://resend.com).
2. **Domains** → add your domain → add the DNS records it gives you in Namecheap → **Verify**.
3. **API Keys** → create one → `RESEND_API_KEY`.
4. Set `RESEND_FROM_EMAIL` to `COBBIT <hello@yourdomain.com>` once verified.

> Don't want to wait on DNS? Use Resend's built-in `onboarding@resend.dev` sender to test emails immediately, switch to your real domain later.

---

## 4. Add environment variables to Vercel and redeploy

**Dashboard:** Project → **Settings → Environment Variables** → add each of these → **Deployments → ⋯ → Redeploy**.

**Or via CLI**, from the project folder:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_PAYMENT_NUMBER production
vercel env add NEXT_PUBLIC_PAYMENT_NAME production
vercel --prod
```
Each command prompts you to paste the value. `NEXT_PUBLIC_SITE_URL` should be your current Vercel URL for now (update it once your real domain is live, in step 6).

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `RESEND_API_KEY` | Resend → API Keys |
| `RESEND_FROM_EMAIL` | e.g. `COBBIT <hello@yourdomain.com>` |
| `NEXT_PUBLIC_SITE_URL` | your live site URL |
| `NEXT_PUBLIC_PAYMENT_NUMBER` | `03395505946` |
| `NEXT_PUBLIC_PAYMENT_NAME` | `Ameena Zulfiqar` |

✅ **Check:** on the live site, register a test account — you should land on the "Registration received" screen and get an email within a minute or two.

---

## 5. Create your admin account

1. On the live site, sign up at `/register` with your own email (you can leave the registration form half-filled — the account is what matters).
2. Supabase → **Table Editor → profiles** → find your row → change `role` from `participant` to `admin`. Or via SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Log in at `yoursite.com/admin/login`.

✅ **Check:** you land on the admin dashboard instead of getting bounced to the login page.

---

## 6. Connect your Namecheap domain

1. Vercel → project → **Settings → Domains** → add your domain.
2. Add the DNS records Vercel shows you in Namecheap → **Domain List → Manage → Advanced DNS**.
3. Wait for propagation (10 min – a few hours).
4. Update `NEXT_PUBLIC_SITE_URL` to your real domain and redeploy.

✅ **Check:** your domain loads the site over HTTPS.

---

## 7. Full end-to-end test (before going live)

Use a personal test email and walk through: register → check "received" email → admin approves → check "approved" email → dashboard shows Approved → submit a project → admin sees it under Submissions → announce winner → check certificate emails (PDFs attached) → dashboard shows downloadable certificates → export CSV works.

See the full checklist with detailed sub-steps in `COBBIT-Deployment-Guide.md` if you kept a copy — every step there has a matching "how to check it worked" note.

---

## Managing dates, prize, and links for future events

You never need to edit code for a new hackathon. In **Admin → Settings tab**, you can change:
- Event name
- Registration open/close dates
- Hackathon start/end dates
- Submission deadline
- Prize amount (leave blank to show "amount to be announced")
- Discord / WhatsApp community links (leave blank to hide that button)

These feed the homepage countdown, the "When" section, the timeline, the footer, and the dates mentioned inside the automatic registration/approval emails — all from one place. Changes are live on the site immediately after saving (no redeploy needed).

## Certificates — how they work

- Triggered from **Admin → Submissions tab → pick the winning project → "Announce as winner & issue certificates"**. Meant to run once per event.
- Emails a Certificate of Participation to every approved participant individually (each teammate, not just the team leader), plus a Certificate of Appreciation to the winning team.
- Generated with `pdf-lib` — no headless browser or external service required, keeps it fast on serverless. Uses a bold standard sans-serif rather than the Baloo 2 brand font to avoid bundling a font file; can be upgraded to embed the real typeface via `@pdf-lib/fontkit` if wanted.
- Vercel's free (Hobby) plan caps serverless functions at 10 seconds — fine for a few dozen participants. For a larger event, this should move to a background job/queue instead.
- Cash prizes are **not automated** — send manually via Easypaisa, same as registration payments.

---

## Known placeholders (intentional — fill in when ready)

| What | Where |
|---|---|
| Prize amount | `src/components/sections/Prize.tsx` |
| Discord / WhatsApp links | `src/components/sections/Community.tsx` |
| Judging criteria, submission rules, event rules | add to `src/components/sections/FAQ.tsx` |

## Assumptions (flag if you want these changed)

- Only the team leader uploads a student ID/proof and pays — teammates 2 & 3 just provide name, email, phone, university, to keep signup friction low.
- One registration per Supabase account.
- No app-enforced email confirmation step (controlled entirely in Supabase Auth settings).
- Submission fields: project title, description, repo link (required), demo link and video link (optional).

## Local development

```bash
cp .env.example .env.local   # fill in your values
npm install
npm run dev
```
