# Deploying This App (and Where WordPress Fits In)

## The one fact that shapes everything below

Regular WordPress hosting (the shared/cPanel kind almost every "WordPress
hosting" plan sells) can only run PHP — it can't keep a Node.js/Express
process (your `backend/`) running. So "install this in WordPress" the way
you'd install a theme isn't something that exists for this stack. The good
news: you don't need WordPress at all to run this app, and it deploys
easily to hosts built for exactly this.

Two honest paths, depending on what you actually want:

## Path A — Drop WordPress entirely, this app is your whole site (recommended)

This is simplest, and it's what these tools are built for.

**1. Get a Postgres database.** Render, Supabase, or Neon all offer a free
tier — create one and copy its connection string. If you use Render for
both the database and the backend below, create the database first so you
have the connection string ready.

**2. Put the project on GitHub** (Render/Netlify/Vercel all deploy by
connecting to a Git repo):
```bash
cd car-rental-app
git init
git add .
git commit -m "Car rental app"
```
Create a new repo on github.com, then follow its "push an existing
repository" instructions.

**3. Deploy the backend to Render** (free tier available):
- render.com → sign up → **New → Web Service** → connect your GitHub repo
- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- Add environment variables (same keys as `backend/.env`): `DATABASE_URL`
  (from step 1), `JWT_SECRET` (generate one — see `backend/README.md`),
  `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `WHATSAPP_NUMBER`, `BUSINESS_NAME`,
  `OPEN_HOUR`, `CLOSE_HOUR`, `HALF_DAY_THRESHOLD_HOURS`,
  `FULL_DAY_THRESHOLD_HOURS`, and — if you want image uploads working —
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STORAGE_BUCKET` (see
  `backend/SUPABASE_SETUP.md`). Leave `CORS_ORIGIN` and `ADMIN_CORS_ORIGIN` for
  now, you'll set them after steps 4 and 5.
- Deploy. You'll get a URL like `https://your-app.onrender.com`. On first
  boot it creates your tables, seeds your cars, and creates your first admin
  login automatically — check the deploy logs to confirm.
- Note: Render's free tier sleeps after 15 minutes of inactivity and takes
  30–60 seconds to wake up on the next request. Fine for testing; their
  paid Starter tier removes it if that delay matters for real customers.

**4. Deploy the customer frontend to Netlify or Vercel** (free):
- Import your GitHub repo → **Root directory:** `frontend` → **Build
  command:** `npm run build` → **Publish directory:** `dist`
- Environment variable: `VITE_API_URL` = `https://your-app.onrender.com/api`
- Deploy. You'll get a URL like `https://your-app.netlify.app`.

**5. Deploy the admin app the same way, as a SEPARATE site:**
- Import the same repo again as a new site → **Root directory:** `admin` →
  same build command/publish directory → same `VITE_API_URL`
- You'll get a second URL, e.g. `https://your-app-admin.netlify.app`

**6. Connect everything:**
- Back in Render, set `CORS_ORIGIN` to your step-4 URL and
  `ADMIN_CORS_ORIGIN` to your step-5 URL, then redeploy the backend.
- In Netlify/Vercel, point your real domain at the customer frontend (step
  4). The admin app (step 5) can stay on its free `*.netlify.app` /
  `*.vercel.app` URL, or use a subdomain like `admin.yourbusiness.com` — no
  need to put it on your main domain since it's not public-facing.

That's it — no WordPress involved anywhere.

## Path B — You want to keep an existing WordPress site for other pages (blog, etc.) and just add this as one more page

Don't try to paste the built app into a WordPress page — a Vite build
produces separate hashed `.js`/`.css` files with specific load order, and
WordPress's editor will mangle or strip parts of that if pasted in as
content. The clean way to do this is a **subdomain**:

1. Do steps 1–6 from Path A exactly as written, but in step 6 point a
   **subdomain** at the customer frontend instead of your main domain — e.g.
   `book.yourbusiness.com` via a CNAME record in your domain's DNS settings
   (Netlify/Vercel's domain instructions will show you exactly what record
   to add).
2. Your main WordPress site keeps living at `yourbusiness.com` untouched.
3. Add a "Book Now" button or menu item in WordPress that links to
   `https://book.yourbusiness.com`.

Result: WordPress still runs your blog/other pages, and the booking app
lives on its own subdomain, fully independent and easy to redeploy without
touching WordPress at all.

## If you're not sure which path

Path A if this booking page basically *is* the business's website. Path B
if you already have (or definitely want) a separate WordPress site for
other content and this is just one feature of it.
