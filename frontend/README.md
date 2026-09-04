# Dispute-Desk

A plain-English dispute dashboard for small business owners. It helps a merchant see payment disputes, understand the available proof, and decide whether to fight, drop, or review each case.

## What is included

- Scrollable landing page with How This Works section
- Google sign-in plus a guest demo path
- Top navigation with My Disputes, Log a Dispute, Needs My Attention, and History
- Live dispute list and detail pages through the app API proxy
- Type-a-dispute form and voice conversation flow
- Plain-language tooltips, evidence checklist, draft reply, and audit steps

## Run locally

```sh
npm install
cp .env.example .env
npm run dev
```

Fill `.env` with the Lovable Cloud URL and publishable key for your project. The external dispute API used by the app is `https://dispute-desk.onrender.com`; browser requests are proxied through the same-origin routes under `src/routes/api/` to avoid CORS failures.

## Useful routes

- `/` — landing page
- `/account` — authenticated profile and session details
- `/sign-in` — Google or guest demo
- `/dashboard` — dispute list
- `/log-dispute` — type or speak a new dispute
- `/attention` — urgent or unclear disputes
- `/history` — resolved disputes

## Stack

- TanStack Start and TanStack Router
- React 19 and TypeScript
- Tailwind CSS v4
- Lovable Cloud authentication
