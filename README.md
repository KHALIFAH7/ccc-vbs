# CCC Kids Adventure VBS — Registration App

Next.js + Supabase version of the VBS registration site, built to run at your own domain
(e.g. `vbs.ccckumasi.org`).

## 1. Create your Supabase project

1. Go to https://supabase.com and create a free account / new project.
2. Once the project is ready, open **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and click **Run**. This creates the `participants` and
   `volunteers` tables.
3. Go to **Project Settings → API**. Copy:
   - **Project URL**
   - **anon public** key

## 2. Configure environment variables

1. Copy `.env.local.example` to `.env.local`.
2. Fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   NEXT_PUBLIC_ADMIN_PIN=0900
   ```
   Change `NEXT_PUBLIC_ADMIN_PIN` to whatever PIN you want staff to use on `/admin`.

## 3. Run it locally (optional, to preview before going live)

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## 4. Edit the placeholders

Open `lib/config.ts` and fill in:
- `heroTitle`, `heroVerse` — this year's theme and verse
- `dates`, `time`, `location`, `ages`, `fee`, `feeDisplay`
- `schedule` — daily titles/verses for the 5-day program
- `ageGroups` — rename or adjust the age brackets if needed

## 5. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Go to https://vercel.com → **New Project** → import the repo.
3. In the Vercel project's **Settings → Environment Variables**, add the same three
   variables from `.env.local` (Supabase URL, anon key, admin PIN).
4. Click **Deploy**. Vercel gives you a live `*.vercel.app` URL immediately.

## 6. Connect your custom domain

1. In the Vercel project, go to **Settings → Domains** and add `vbs.ccckumasi.org`
   (or whichever subdomain you want).
2. Vercel shows you a DNS record (usually a `CNAME`) to add.
3. Log into wherever `ccckumasi.org`'s DNS is managed (your domain registrar or DNS
   provider) and add that record.
4. DNS changes can take a few minutes to a few hours to propagate. Once it does,
   the site is live at your own domain with a free auto-renewing SSL certificate.

## 7. Generate a QR code for parents

Once the site is live at your domain, paste the URL into any QR code generator
(or ask Claude to generate one for you) and print it on flyers, posters, or share it
on WhatsApp.

## Security note

The admin dashboard (`/admin`) is protected only by a PIN typed into the page — this
is a convenience gate, not real authentication. The Supabase table policies
(`supabase/schema.sql`) currently allow anyone with the public anon key (which is
visible in the site's JavaScript) to read, insert, update, and delete registrations.
This is a reasonable tradeoff for a small internal registration tool, but if you want
stronger protection later — e.g. only logged-in staff can view or edit data — Claude
can help you add Supabase Auth and tighten the row-level security policies.
