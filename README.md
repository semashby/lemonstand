# Lemonstand

The practice app for **Ship It Safe**, the Zexy Studios course on taking an
app you built with AI from "it works" to "it's safe to put my name on":
https://zexystudios.com/courses/ship-it-safe/

Lemonstand is a booking app for a juice bar: customers pick a workshop and a
time, pay a deposit with Stripe, and manage their bookings; the owner has a
dashboard. It was written the way an AI tool writes an app on its first try.
It works, it looks fine, and **16 security problems are planted in it**. Each
course module shows you two of them: you find the problem, attack it, fix it,
and watch the attack fail.

> **It's broken on purpose. Never deploy it, and never give it real data or
> real keys.** Everything runs on your own machine: the database in Docker,
> payments in Stripe test mode, and the AI helper in fake mode.

## What you need

- Node.js 22 or newer
- Docker (Docker Desktop, OrbStack or Colima), running, with about 4 GB of
  memory to spare
- The [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).
  It runs the database locally, so you don't need a Supabase account or project.
- A free [Stripe](https://dashboard.stripe.com/register) account, switched to
  test mode
- From module 5: the [Stripe CLI](https://docs.stripe.com/stripe-cli)

Short on memory? Colima is the lightest: `brew install colima docker`, then
`colima start --memory 4`. `colima stop` gives the memory back.

On Windows, run the commands in Git Bash (it comes with Git).

## Set it up (once, about 10 minutes)

```bash
git clone https://github.com/semashby/lemonstand.git
cd lemonstand
npm install
supabase start
cp .env.example .env.local
```

`supabase start` takes a few minutes the first time: it pulls Postgres, Auth
and Storage into Docker, creates the tables and loads the demo data.

Then fill in `.env.local`. Get the local Supabase keys with
`supabase status -o env` and copy two of its lines:

| From `supabase status -o env` | Into `.env.local` |
|---|---|
| `ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` |

Your Stripe **test** secret key (`sk_test_...`, from
https://dashboard.stripe.com/test/apikeys) goes in both `STRIPE_SECRET_KEY`
and `NEXT_PUBLIC_STRIPE_SECRET_KEY`.

Yes, two of those are secrets with a `NEXT_PUBLIC_` name. Leave them: that's
lab 1. Leave `AI_PROVIDER=fake` as it is, and leave `STRIPE_WEBHOOK_SECRET`
until module 5 tells you what to put there.

Start it:

```bash
npm run dev
```

Open http://localhost:3000. You should see the home page with three services.

## Demo accounts

All three use the password `lemonade123`.

| Email | Who |
|---|---|
| `ada@lemonstand.test` | Customer with two bookings |
| `bram@lemonstand.test` | Customer with one booking |
| `owner@lemonstand.test` | The owner, sees the dashboard at `/admin` |

The other bookings belong to made-up walk-in customers.

## When something goes wrong

- **`supabase start` can't reach Docker:** open your Docker app first.
- **The page can't reach Supabase:** check that `.env.local` has the values
  from `supabase status -o env`, then stop `npm run dev` (Ctrl+C) and start it
  again. Next.js only reads `.env.local` when it starts.
- **You broke the data:** `supabase db reset` puts the database back to the
  start, demo accounts included.
- **You broke the code:** `git checkout -- .` takes you back to the last
  commit.

## Branches

- `main`: the app with all 16 problems in it. Start here.
- `solutions`: one commit per module, in course order, with that module's
  fixes. Try each lab yourself first. Afterwards, compare with
  `git diff main solutions -- <file>`, or read that module's commit.

## About the keys in this repo

Anything in this repo that looks like a real key is a dummy, planted for a
lab. None of them work anywhere. Your own keys live in `.env.local`, which git
ignores.

## Stack

Next.js 16 (App Router), Supabase (Postgres, Auth, Storage), Stripe Checkout,
Tailwind CSS.
