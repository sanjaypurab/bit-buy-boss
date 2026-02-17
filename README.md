# DigiHub — Bitcoin-Native Digital Services Marketplace

Premium digital services purchasable with Bitcoin. No banks, no middlemen, just results.

## ✅ What We Have (Done)

| Feature | Status | Notes |
|---------|--------|-------|
| **Landing Page** | ✅ | Hero, How It Works, Features, CTA, footer |
| **Auth (Email/Password)** | ✅ | Sign up, sign in, email verification, session mgmt |
| **Role-Based Access** | ✅ | `user_roles` table with admin/user enum, `isAdmin` context |
| **Services Catalog** | ✅ | Dynamic from DB, shows price + BTC price + features |
| **BTC Purchase Flow** | ✅ | QR code generation, copy-to-clipboard, order creation |
| **BTC Address per Service** | ✅ | Configurable in DB, set by admins per service |
| **User Dashboard** | ✅ | Order history with status badges |
| **Admin Panel** | ✅ | View pending orders, confirm payments, CRUD services |
| **Service Editing** | ✅ | Inline edit name, price, BTC address, features, active toggle |
| **RLS Policies** | ✅ | Orders scoped to user, admin role checks |
| **Responsive Navbar** | ✅ | Conditional links for auth/admin state |

## 🚧 What We Need to Launch

### Critical (Must Have)

- [ ] **SEO meta tags** — `index.html` still has placeholder title ("bit-buy-boss") and generic OG tags
- [ ] **Seed at least one service** — Catalog is empty; need at least one live service with a real BTC address
- [ ] **Mobile-responsive navbar** — No hamburger menu; nav breaks on small screens
- [ ] **Error/empty states** — Purchase page shows nothing if service has no BTC address configured

### Important (Should Have)

- [ ] **Email notifications** — No notifications when order status changes (payment confirmed, etc.)
- [ ] **Order status lifecycle** — Only `pending` → `confirmed` exists; add `completed`, `cancelled` flows
- [ ] **Terms of Service / Privacy Policy** — Required for any public-facing product
- [ ] **Leaked password protection** — Currently disabled in auth config (security warning)
- [ ] **Admin: delete services** — Can edit but not remove services
- [ ] **Admin: view all orders** — Currently filtered to pending only; add tabs for all statuses

### Nice to Have

- [ ] **Custom domain** — Currently on lovable.app preview URL
- [ ] **Dark/light mode toggle** — Theme tokens exist but no user-facing toggle
- [ ] **Analytics dashboard** — Order volume, revenue tracking for admins
- [ ] **Multiple payment methods** — Lightning Network, on-chain options
- [ ] **Rate limiting** — No protection against order spam

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Lovable Cloud (Supabase) — Auth, Postgres, RLS
- **Payments:** Bitcoin (QR code via `qrcode.react`, manual admin confirmation)
- **State:** React Query, React Context (Auth)

## Project Structure

```
src/
├── components/       # Navbar, shadcn/ui primitives
├── contexts/         # AuthContext (user, session, isAdmin)
├── hooks/            # use-toast, use-mobile
├── integrations/     # Supabase client & types (auto-generated)
├── pages/
│   ├── Index.tsx     # Landing page
│   ├── Auth.tsx      # Login / Sign up
│   ├── Services.tsx  # Service catalog
│   ├── Purchase.tsx  # BTC payment flow
│   ├── Dashboard.tsx # User order history
│   ├── Admin.tsx     # Admin panel (orders + services CRUD)
│   └── NotFound.tsx  # 404
└── lib/              # Utilities
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `services` | Service catalog (name, price, btc_price, btc_address, features, is_active) |
| `orders` | Purchase records (user_id, service_id, status, btc_amount, btc_address) |
| `user_roles` | Role assignments (user_id, role: admin/user) |

## Getting Started

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

## Deployment

Open [Lovable](https://lovable.dev/projects/bfe5124d-daa5-4727-a6e3-a915fb1a9f64) and click **Share → Publish**.
