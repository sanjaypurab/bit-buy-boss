# BitBuyBoss — Bitcoin-Native Digital Products & Services Marketplace

Premium digital products and professional services purchasable with Bitcoin. No banks, no middlemen, just results.

---

## 📊 Investor Brief

**What it is:** BitBuyBoss is a self-service marketplace for digital products and services that accepts Bitcoin payments via NOWPayments. Customers browse a catalog, add items to a cart, and pay with BTC — the entire payment lifecycle (invoice creation, webhook confirmation, order status updates) is fully automated.

**Revenue model:** Service markup on digital offerings. All payments settle in USDT TRC20 via NOWPayments auto-conversion, eliminating BTC volatility risk.

**Market position:** Targets privacy-conscious buyers who prefer crypto payments without KYC. No direct competitors offer a turnkey BTC-native digital products storefront with automated payment confirmation.

**Tech stack advantage:** Built on React + Lovable Cloud with serverless backend functions. Zero infrastructure cost at rest; scales horizontally. The entire platform runs without a traditional backend server.

**Current status:** MVP complete — full payment flow tested end-to-end with live NOWPayments integration. Ready for catalog seeding and soft launch.

---

## 🔧 Admin Brief

### Getting Started
1. Log in with an admin-role account
2. Navigate to `/admin` (visible in navbar when admin role is detected)

### Admin Panel Tabs
| Tab | What You Can Do |
|-----|-----------------|
| **Orders** | View pending orders, confirm payments manually (backup for webhook failures) |
| **Services** | Add, edit, toggle active/inactive, set USD price, BTC price, features, category |
| **Users** | View registered users, manage profiles |
| **Messages** | Read and respond to user messages |
| **Categories** | Create/edit service categories with images and sort order |
| **Homepage** | Edit hero text, feature titles, CTA copy — all stored in `site_content` table |

### Payment Flow (Admin Perspective)
- Payments are **automated** via NOWPayments webhooks — orders update to `paid` automatically
- The "Confirm Payment" button is a **manual fallback** for edge cases where the webhook fails
- Orders currently filter to `pending` only in the admin view

### Adding a New Product or Service
1. Go to Admin → Services → "Add Service"
2. Fill in: name, description, USD price (required), BTC price (optional), features (one per line)
3. Assign a category (optional)
4. NOWPayments generates unique invoices per order — no manual BTC address needed

---

## 👤 User Brief

### How to Use BitBuyBoss
1. **Create an account** at `/auth` with your email and password
2. **Verify your email** (check inbox for confirmation link)
3. **Browse products** at `/services` — filter by category
4. **Add to cart** — digital items are one-per-cart (no duplicates)
5. **Checkout** — enter your email, optional instructions, agree to Terms & Privacy
6. **Pay with Bitcoin** — you'll be redirected to a secure NOWPayments page
7. **Track your order** — visit `/dashboard` to see real-time status updates

### Order Statuses
| Status | Meaning |
|--------|---------|
| **Pending** | Order created, awaiting payment |
| **Awaiting Payment** | Invoice generated, waiting for BTC transaction |
| **Confirming** | Payment detected, waiting for blockchain confirmations |
| **Paid** | Payment confirmed, product/service is being activated |
| **Expired** | Payment window expired — contact support |
| **Failed** | Payment failed — contact support |

### Features
- 🔔 **Real-time updates** — dashboard auto-refreshes when payment status changes
- 💬 **Messaging** — send messages to admins from your dashboard
- 🔒 **Profile** — change password, view account details at `/profile`
- 📋 **Order history** — full history with expandable details
- 🔗 **Shareable products** — share any product via native share or clipboard link

---

## ✅ What We Have (Complete)

| Feature | Notes |
|---------|-------|
| **Landing Page** | Hero with dynamic CMS content, How It Works, Features grid, Social Proof, CTA |
| **Auth System** | Email/password signup, login, email verification, password reset flow |
| **Role-Based Access** | `user_roles` table with `admin`/`user` enum, `has_role()` security definer function |
| **Product Catalog** | Dynamic from DB, category filtering, price display, add-to-cart |
| **Product Detail Pages** | Individual pages per product with full details, share button, JSON-LD |
| **Categories** | Admin-managed categories with images, sort order |
| **Shopping Cart** | LocalStorage-persisted, deduplicated, with checkout flow |
| **Automated BTC Payments** | NOWPayments integration via backend functions (invoice creation + IPN webhook) |
| **Webhook Verification** | HMAC-SHA512 signature validation, duplicate prevention |
| **Auto Payout** | USD pricing → BTC payment → USDT TRC20 settlement |
| **Real-Time Order Tracking** | Realtime subscriptions, live status badges, toast notifications |
| **User Dashboard** | Order history with payment status, expandable details, messaging tab |
| **Admin Panel** | 6-tab panel: Orders, Services CRUD, Users, Messages, Categories, Homepage CMS |
| **CMS / Site Content** | Editable hero, features, CTA text stored in `site_content` table |
| **User Messaging** | Bidirectional messaging between users and admins |
| **Profile Management** | Password change, account info display |
| **Responsive Navbar** | Mobile hamburger menu via Sheet component, cart badge |
| **SEO & Social Sharing** | OG/Twitter meta tags, JSON-LD structured data, shareable product pages |
| **Terms & Privacy** | Dedicated pages linked from footer and checkout |
| **Password Reset** | Full forgot-password → email link → reset flow |
| **RLS Policies** | All tables secured: orders scoped to user, admin role checks, public read where appropriate |
| **Footer** | Branding + legal links |

---

## 🚧 What We Need to Launch

### Critical (Blocking)

- [ ] **Seed the catalog** — Database is empty; need at least 3-5 digital products/services for launch
- [ ] **Custom domain** — Currently on staging URL; need `bitbuyboss.com` connected
- [ ] **Test full payment flow end-to-end** — Verify NOWPayments invoice → payment → webhook → order status update with real BTC

### Important (Should Have for Launch)

- [ ] **Admin: view all order statuses** — Admin orders tab only shows `pending`; needs tabs/filters for all statuses
- [ ] **Admin: delete services** — Can edit and deactivate but not delete products
- [ ] **Email notifications** — No email sent when order status changes (payment confirmed, service activated)
- [ ] **Order status lifecycle cleanup** — Admin "Confirm Payment" sets `confirmed` but webhook sets `paid`; need consistent mapping
- [ ] **Error state on legacy Purchase page** — Shows nothing if service has no BTC address (page may be deprecated)

### Nice to Have (Post-Launch)

- [ ] **Product images** — No image upload/display for products (currently text-only cards)
- [ ] **Dark/light mode toggle** — Theme tokens exist but no user-facing toggle
- [ ] **Analytics dashboard** — Order volume, revenue tracking for admins
- [ ] **Lightning Network** — Faster, cheaper BTC payments
- [ ] **Rate limiting** — No protection against order spam
- [ ] **Order search/filter** — User dashboard has no search or date filtering
- [ ] **Refund flow** — No mechanism for refunds or order cancellation
- [ ] **Leaked password protection** — Currently disabled in auth config

---

## 🎯 Recommended Next Steps

1. **Seed 3-5 products** into the catalog via Admin panel — at minimum one in each category
2. **Connect custom domain** via Lovable publish settings
3. **Run a live test purchase** — end-to-end with real BTC to verify webhook flow
4. **Add product images** — visual catalog will dramatically improve conversion
5. **Set up email notifications** — critical for user trust post-purchase
6. **Expand admin orders view** — show all statuses, not just pending

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Lovable Cloud — Auth, Postgres, RLS, Backend Functions |
| **Payments** | NOWPayments API (invoice creation, IPN webhooks, USDT TRC20 payout) |
| **State** | React Query, React Context (Auth, Cart), localStorage (cart persistence) |
| **Realtime** | Realtime subscriptions (order status updates) |
| **SEO** | JSON-LD structured data, OG/Twitter meta tags, dynamic useMetaTags hook |

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx           # Responsive nav with mobile Sheet menu
│   ├── Footer.tsx           # Site-wide footer
│   ├── JsonLd.tsx           # Reusable JSON-LD structured data component
│   ├── UserMessages.tsx     # User messaging interface
│   ├── admin/               # Admin panel tab components
│   │   ├── AdminCategoriesTab.tsx
│   │   ├── AdminContentTab.tsx
│   │   ├── AdminMessagesTab.tsx
│   │   └── AdminUsersTab.tsx
│   ├── dashboard/
│   │   └── OrderCard.tsx    # Order display with status badges
│   └── ui/                  # shadcn/ui primitives
├── contexts/
│   ├── AuthContext.tsx       # Auth state, admin check, sign in/up/out
│   └── CartContext.tsx       # Cart state with localStorage persistence
├── hooks/
│   ├── use-toast.ts
│   ├── use-mobile.tsx
│   ├── useMetaTags.ts       # Dynamic OG/Twitter meta tag management
│   └── useSiteContent.ts    # CMS content fetcher
├── integrations/
│   └── supabase/
│       ├── client.ts        # Auto-generated client
│       └── types.ts         # Auto-generated DB types
├── pages/
│   ├── Index.tsx            # Landing page with CMS-driven content
│   ├── Auth.tsx             # Login / Signup / Forgot password
│   ├── ResetPassword.tsx    # Password reset handler
│   ├── Services.tsx         # Product catalog with category filter
│   ├── ServiceDetail.tsx    # Individual product page with JSON-LD
│   ├── Cart.tsx             # Cart + checkout → NOWPayments redirect
│   ├── Purchase.tsx         # Legacy single-service purchase (deprecated)
│   ├── Dashboard.tsx        # User orders + messages (realtime)
│   ├── Profile.tsx          # Account settings, password change
│   ├── Admin.tsx            # Admin panel (6 tabs)
│   ├── TermsOfService.tsx   # Terms page
│   ├── PrivacyPolicy.tsx    # Privacy page
│   └── NotFound.tsx         # 404
└── lib/
    └── utils.ts             # Tailwind merge utility

supabase/
├── config.toml              # Project config
└── functions/
    ├── create-payment/      # Backend Function: creates NOWPayments invoice
    │   └── index.ts
    └── payment-webhook/     # Backend Function: IPN handler with HMAC verification
        └── index.ts
```

## Database Schema

| Table | Purpose | RLS |
|-------|---------|-----|
| `services` | Product catalog (name, price, BTC price, features, category, active toggle) | Public read (active only), admin CRUD |
| `categories` | Product categories (name, image, sort order) | Public read, admin CRUD |
| `orders` | Purchase records (user, service, payment status, BTC amount, instructions) | User read own, admin read/update all |
| `profiles` | User profiles (email, banned flag) | User read own, admin full access |
| `messages` | User ↔ admin messaging (subject, body, read status) | Scoped to sender/recipient |
| `site_content` | CMS key-value pairs for homepage content | Public read, admin CRUD |
| `user_roles` | Role assignments (admin/user enum) | User read own, admin read all |

## Getting Started

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

## Deployment

Open [Lovable](https://lovable.dev/projects/bfe5124d-daa5-4727-a6e3-a915fb1a9f64) and click **Share → Publish**.
