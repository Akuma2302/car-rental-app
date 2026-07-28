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

**1. Put the project on GitHub** (Render/Netlify/Vercel all deploy by
connecting to a Git repo):
```bash
cd car-rental-app
git init
git add .
git commit -m "Car rental app"
```
Create a new repo on github.com, then follow its "push an existing
repository" instructions.

**2. Deploy the backend to Render** (free tier available):
- render.com → sign up → **New → Web Service** → connect your GitHub repo
- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- Add environment variables (same keys as `backend/.env`): `PORT` (Render
  sets this automatically, you can omit it), `WHATSAPP_NUMBER`,
  `BUSINESS_NAME`, `OPEN_HOUR`, `CLOSE_HOUR`, and `CORS_ORIGIN` — leave
  `CORS_ORIGIN` for now, you'll set it after step 3.
- Deploy. You'll get a URL like `https://your-app.onrender.com`.
- Note: Render's free tier sleeps after 15 minutes of inactivity and takes
  30–60 seconds to wake up on the next request. Fine for testing; if that
  delay matters for real customers, their paid Starter tier removes it.

**3. Deploy the frontend to Netlify or Vercel** (both free for this):
- netlify.com or vercel.com → sign up → import your GitHub repo
- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- Add an environment variable: `VITE_API_URL` =
  `https://your-app.onrender.com/api` (your real Render URL from step 2,
  with `/api` on the end)
- Deploy. You'll get a URL like `https://your-app.netlify.app`.

**4. Connect the two + your domain:**
- Back in Render, set `CORS_ORIGIN` to your real frontend URL from step 3
  (or your custom domain once you attach one), then redeploy the backend.
- In Netlify/Vercel, go to Domain settings and follow their instructions to
  point your own domain (the one you'd have used for WordPress) at this
  deployment instead.

That's it — no WordPress involved anywhere.

## Path B — You want to keep an existing WordPress site for other pages (blog, etc.) and just add this as one more page

Don't try to paste the built app into a WordPress page — a Vite build
produces separate hashed `.js`/`.css` files with specific load order, and
WordPress's editor will mangle or strip parts of that if pasted in as
content. The clean way to do this is a **subdomain**:

1. Do steps 1–4 from Path A exactly as written, but in step 4 point a
   **subdomain** at the frontend instead of your main domain — e.g.
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
