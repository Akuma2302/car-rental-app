# Setting Up Supabase for This Project

The backend already talks to Postgres through the standard `pg` package and
a generic `DATABASE_URL` — it has no idea (and doesn't care) which company
is hosting the database. So "using Supabase" here just means: get a
connection string from Supabase and put it in `DATABASE_URL`. No code
changes needed. The one thing worth doing carefully is picking the *right*
connection string — most setup problems come from that one step.

## 1. Create a Supabase project

- Go to supabase.com → sign up (GitHub sign-in is easiest) → **New Project**
- Choose an organization, a project name (e.g. `car-rental`), and set a
  database password — **save this somewhere**, you'll need it in the
  connection string and Supabase won't show it to you again (you can reset
  it later, but that changes the string).
- Pick a region close to your customers (e.g. Southeast Asia (Singapore) for
  Malaysia).
- Plan: **Free**.
- Wait a minute or two while it provisions.

## 2. Get the right connection string

This is the part people get wrong, so here's the reasoning, not just the
answer:

- In your project dashboard, click **Connect** near the top.
- You'll see three options: **Direct connection**, **Session pooler**,
  **Transaction pooler**.
- **Use the Session pooler string.** Not Direct connection.

Why: Supabase's direct connection only resolves over IPv6 unless you pay
for their IPv4 add-on — and most app hosts (Render, Railway, etc.) don't
support outbound IPv6, so you'd hit a connection error immediately. The
session pooler works over IPv4 and behaves like a normal persistent
connection — which is exactly what this backend wants, since it keeps a
small pool of long-lived connections open (via `pg.Pool` in
`src/config/db.js`), not one-off serverless calls. (The *transaction*
pooler is meant for serverless/edge functions with lots of short-lived
connections — not this setup.)

The session pooler string looks like:
```
postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```
Copy it, then replace `[YOUR-PASSWORD]` with the database password from
step 1.

## 3. Set it as `DATABASE_URL`

- **Local development:** paste it into `backend/.env`:
  ```
  DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:yourpassword@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
  ```
- **Deployed (Render or similar):** add it as an environment variable named
  `DATABASE_URL` in that service's settings, same as any other env var.

## 4. Run it — that's the whole setup

```bash
cd backend
npm run dev
```

On first startup the backend automatically creates the `cars`, `bookings`,
and `admin_users` tables, seeds cars from `data/cars.json`, and creates your
first admin login from `ADMIN_USERNAME`/`ADMIN_PASSWORD` — identical
behavior to using Render's or Neon's Postgres. SSL is also already handled:
`src/config/db.js` detects `supabase.co` (which the pooler hostname
contains) in the connection string and turns SSL on automatically.

## A note on Row Level Security (RLS)

Supabase's own docs talk a lot about RLS, because most Supabase projects
connect through their client library (`@supabase/supabase-js`) and REST
API, where RLS is the main access-control mechanism. This project doesn't
use that — it connects directly to Postgres with the `pg` package using the
`postgres` role, which bypasses RLS entirely. So you can ignore Supabase's
RLS setup guides for this project; access control here happens in
`requireAdmin` middleware instead (see `backend/README.md`).

## If something goes wrong

**`could not translate host name` / `ENETUNREACH` / connection just hangs
on startup** — you copied the Direct connection string instead of the
Session pooler string. Go back to step 2.

**Works locally, fails when deployed** — double check the env var is
actually named `DATABASE_URL` (exact spelling) in your host's dashboard,
and that you redeployed after adding it — most hosts don't pick up new env
vars on an already-running instance.

## 5. Set up image storage (for vehicle photos)

The admin app uploads vehicle photos through the backend to Supabase
Storage. One-time setup:

1. In your Supabase project, go to **Storage** in the left sidebar → **New
   bucket**
2. Name it `car-images` (or anything — just match `STORAGE_BUCKET` in
   `.env` if you pick something else)
3.   **Public bucket** ON — image URLs need to load directly in
   `<img>` tags without authentication
4. That's it — no RLS policies to configure. The backend uploads using your
   **service role key**, which bypasses Storage's access policies entirely
   (same reasoning as the RLS note above: this project's backend is a
   trusted server, not a public client).

Now get the service role key: **Project Settings → API** → under "Project
API keys", copy the **service_role** key (not the `anon`/public one — that
one intentionally can't do privileged things like this).

Set in `.env`:
```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...   (the service_role key, not anon)
STORAGE_BUCKET=car-images
```

**Keep the service role key secret** — it has full access to your project,
bypassing every access rule. Never put it in frontend code or commit it to
a public repo (same as `JWT_SECRET` and `DATABASE_URL` — it only ever goes
in the backend's `.env` or your host's environment variables).

## Optional: browsing your data

Since it's Supabase, you also get a web-based table browser for free —
**Table Editor** in the left sidebar of your project dashboard lets you view
and hand-edit rows directly. Handy for a quick look or a manual fix; the
admin app (`admin/`) is still the normal way to manage cars day to day.
