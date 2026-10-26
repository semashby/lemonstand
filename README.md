# Lemonstand

The practice app for **Ship It Safe**, the Zexy Studios course on taking an
app you built with AI from "it works" to "it's safe to put my name on".

Lemonstand is a booking app for a juice bar: customers pick a workshop and a
time, pay a deposit with Stripe, and manage their bookings; the owner has a
dashboard. It was written the way an AI tool writes an app on its first try.
It works, it looks fine, and **16 security problems are planted in it**. Each
course module shows you two of them: you find the problem, attack it, fix it,
and watch the attack fail.

> **Never deploy this app with real data or real keys.** Use local Supabase
> and Stripe test mode only. That's the point: it's broken on purpose.

## What you need

- Node.js 22 or newer
- Docker (Docker Desktop, OrbStack or Colima) for the local database
- The [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- A free Stripe account in test mode, and the
  [Stripe CLI](https://docs.stripe.com/stripe-cli) for module 5

## Run it

```bash
npm install
supabase start              # starts Postgres, Auth and Storage in Docker
supabase db reset           # creates the tables and the demo data
cp .env.example .env.local  # then fill it in, see below
npm run dev
```

Open http://localhost:3000.

Fill `.env.local` with the values from `supabase status -o env`
(`ANON_KEY` and `SERVICE_ROLE_KEY`) and your Stripe **test** secret key.

## Demo accounts

All three use the password `lemonade123`.

| Email | Who |
|---|---|
| `ada@lemonstand.test` | Customer with two bookings |
| `bram@lemonstand.test` | Customer with one booking |
| `owner@lemonstand.test` | The owner, sees the dashboard at `/admin` |

The other bookings belong to made-up walk-in customers.

## Branches

- `main`: the app with all 16 problems in it. Start here.
- `solutions`: one commit per fix, in course order. Try each lab yourself
  first; compare afterwards with `git diff main solutions -- <file>` or by
  reading that one commit.

## Stack

Next.js (App Router), Supabase (Postgres, Auth, Storage), Stripe Checkout,
Tailwind CSS.
