# BitBuyBoss — Bitcoin-Native Digital Products & Services Marketplace

Premium digital products and professional services purchasable with Bitcoin. No banks, no middlemen, just results.

🌐 **Live at:** [bitbuyboss.store](https://www.bitbuyboss.store)

---

## 📊 Investor Brief

**What it is:** BitBuyBoss is a self-service marketplace for digital products and services that accepts Bitcoin payments via NOWPayments. Customers browse a catalog, add items to a cart, and pay with BTC — the entire payment lifecycle (invoice creation, webhook confirmation, order status updates) is fully automated.

**Revenue model:** Service markup on digital offerings. All payments settle in USDT TRC20 via NOWPayments auto-conversion, eliminating BTC volatility risk.

**Market position:** Targets privacy-conscious buyers who prefer crypto payments without KYC. No direct competitors offer a turnkey BTC-native digital products storefront with automated payment confirmation.

**Tech stack advantage:** Built on React + Lovable Cloud with serverless backend functions. Zero infrastructure cost at rest; scales horizontally. The entire platform runs without a traditional backend server.

**Current status:** MVP complete — full payment flow tested end-to-end with live NOWPayments integration. Product image uploads, email notifications, and SEO structured data all implemented. Ready for catalog seeding and soft launch.

---

## 🔧 Admin Brief

### Getting Started
1. Log in with an admin-role account
2. Navigate to `/admin` (visible in navbar when admin role is detected)

### Admin Panel Tabs
| Tab | What You Can Do |
|-----|-----------------|
| **Orders** | View pending orders, confirm payments manually (backup for webhook failures) |
| **Services** | Add/edit products with images, toggle active/inactive, set USD price, BTC price, features, category |
| **Users** | View registered users, manage profiles |
| **Messages** | Read and respond to user messages |
| **Categories** | Create/edit service categories with images and sort order |
| **Homepage** | Edit hero text, feature titles, CTA copy — all stored in `site_content` table |

### Payment Flow (Admin Perspective)
- Payments are **automated** via NOWPayments webhooks — orders update to `paid` automatically
- The "Confirm Payment" button is a **manual fallback** for edge cases where the webhook fails
- Orders currently filter to `pending` only in the admin view

### Adding a New Product
1. Go to Admin → Services → "Add Service"
2. Fill in: name, description, USD price (required), BTC price (optional), features (one per line)
3. **Upload a product image** (stored in `service-images` bucket)
4. Assign a category (optional)
5. NOWPayments generates unique invoices per order — no manual BTC address needed

---

## 👤 User Brief

### How to Use BitBuyBoss
1. **Create an account** at `/auth` with your email and password
2. **Verify your email** (check inbox for confirmation link)
3. **Browse products** at `/services` — filter by category, view product images
4. **Add to cart** — digital items are one-per-cart (no duplicates)
5. **Checkout** — enter your email, optional instructions, agree to Terms & Privacy
6. **Pay with Bitcoin** — you'll be redirected to a secure NOWPayments page
7. **Track your order** — visit `/dashboard` to see real-time status updates
8. **Receive email notifications** — get notified when your order status changes

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
- 📧 **Email notifications** — automated emails on order status changes
- 💬 **Messaging** — send messages to admins from your dashboard
- 🔒 **Profile** — change password, view account details at `/profile`
- 📋 **Order history** — full history with expandable details
- 🔗 **Shareable products** — share any product via native share or clipboard link

---

## ✅ What We Have (Complete)

| Feature | Status | Notes |
|---------|--------|-------|
| **Landing Page** | ✅ | Hero with dynamic CMS content, How It Works, Features grid, Social Proof, CTA |
| **Auth System** | ✅ | Email/password signup, login, email verification, password reset flow |
| **Role-Based Access** | ✅ | `user_roles` table with `admin`/`user` enum, `has_role()` security definer function |
| **Product Catalog** | ✅ | Dynamic from DB, category filtering, product images, price display, add-to-cart |
| **Product Images** | ✅ | Upload via admin panel, stored in `service-images` bucket, displayed in catalog & detail pages |
| **Product Detail Pages** | ✅ | Individual pages with full details, product image, share button, JSON-LD structured data |
| **Categories** | ✅ | Admin-managed categories with images, sort order |
| **Shopping Cart** | ✅ | LocalStorage-persisted, deduplicated, with checkout flow |
| **Automated BTC Payments** | ✅ | NOWPayments integration via backend functions (invoice creation + IPN webhook) |
| **Webhook Verification** | ✅ | HMAC-SHA512 signature validation, duplicate prevention |
| **Auto Payout** | ✅ | USD pricing → BTC payment → USDT TRC20 settlement |
| **Real-Time Order Tracking** | ✅ | Realtime subscriptions, live status badges, toast notifications |
| **User Dashboard** | ✅ | Order history with payment status, expandable details, messaging tab |
| **Admin Panel** | ✅ | 6-tab panel: Orders, Services CRUD with image upload, Users, Messages, Categories, Homepage CMS |
| **CMS / Site Content** | ✅ | Editable hero, features, CTA text stored in `site_content` table |
| **User Messaging** | ✅ | Bidirectional messaging between users and admins |
| **Email Notifications** | ✅ | Branded emails on `bitbuyboss.store` domain for auth and order status changes |
| **Profile Management** | ✅ | Password change, account info display |
| **Responsive Navbar** | ✅ | Mobile hamburger menu via Sheet component, cart badge |
| **SEO & Structured Data** | ✅ | OG/Twitter meta tags, JSON-LD (Product, Offer, ItemList schemas), dynamic `useMetaTags` hook |
| **Terms & Privacy** | ✅ | Dedicated pages linked from footer and checkout |
| **Password Reset** | ✅ | Full forgot-password → email link → reset flow |
| **RLS Policies** | ✅ | All tables secured: orders scoped to user, admin role checks, public read where appropriate |
| **Storage Bucket** | ✅ | `service-images` with public read, admin-only write/delete policies |
| **Footer** | ✅ | Branding + legal links |
| **Custom Domain** | ✅ | Live at bitbuyboss.store |

---

## 🚧 What We Need to Launch

### Critical (Blocking Launch)

- [ ] **Seed the catalog** — Database is empty; need at least 3-5 digital products/services with images
- [ ] **Test full payment flow end-to-end** — Verify NOWPayments invoice → payment → webhook → order status update → email notification with real BTC

### Important (Should Have for Launch)

- [ ] **Admin: view all order statuses** — Admin orders tab only shows `pending`; needs tabs/filters for all statuses
- [ ] **Admin: delete services** — Can edit and deactivate but not delete products
- [ ] **Order status lifecycle cleanup** — Admin "Confirm Payment" sets `confirmed` but webhook sets `paid`; need consistent mapping
- [ ] **Error state on legacy Purchase page** — `/purchase` page may be deprecated; consider removing or redirecting

### Nice to Have (Post-Launch)

- [ ] **Dark/light mode toggle** — Theme tokens exist but no user-facing toggle
- [ ] **Analytics dashboard** — Order volume, revenue tracking for admins
- [ ] **Lightning Network** — Faster, cheaper BTC payments
- [ ] **Rate limiting** — No protection against order spam
- [ ] **Order search/filter** — User dashboard has no search or date filtering
- [ ] **Refund flow** — No mechanism for refunds or order cancellation
- [ ] **Leaked password protection** — Currently disabled in auth config

---

## 🎯 Recommended Next Steps

1. **Seed 3-5 products** into the catalog via Admin panel — with images, descriptions, and features
2. **Run a live test purchase** — end-to-end with real BTC to verify the full flow including email notifications
3. **Expand admin orders view** — add status filter tabs so admins can see all orders, not just pending
4. **Add delete capability** for services in admin panel
5. **Remove or redirect `/purchase`** — legacy page superseded by the cart checkout flow
6. **Set up analytics** — track order volume and revenue in admin dashboard

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Lovable Cloud — Auth, Postgres, RLS, Backend Functions, Storage |
| **Payments** | NOWPayments API (invoice creation, IPN webhooks, USDT TRC20 payout) |
| **State** | React Query, React Context (Auth, Cart), localStorage (cart persistence) |
| **Realtime** | Realtime subscriptions (order status updates) |
| **SEO** | JSON-LD structured data (Product, Offer, ItemList), OG/Twitter meta tags, dynamic useMetaTags hook |
| **Email** | Branded email notifications via bitbuyboss.store domain |
| **Storage** | service-images bucket with public read, admin-managed uploads |

## Database Schema

| Table | Purpose | RLS |
|-------|---------|-----|
| `services` | Product catalog (name, price, BTC price, features, category, image_url, active toggle) | Public read (active only), admin CRUD |
| `categories` | Product categories (name, image, sort order) | Public read, admin CRUD |
| `orders` | Purchase records (user, service, payment status, BTC amount, instructions) | User read own, admin read/update all |
| `profiles` | User profiles (email, banned flag) | User read own, admin full access |
| `messages` | User ↔ admin messaging (subject, body, read status) | Scoped to sender/recipient |
| `site_content` | CMS key-value pairs for homepage content | Public read, admin CRUD |
| `user_roles` | Role assignments (admin/user enum) | User read own, admin read all |

## Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `service-images` | Product thumbnails and images | Public read, admin upload/update/delete |

## Getting Started

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

## Deployment

Open [Lovable](https://lovable.dev/projects/bfe5124d-daa5-4727-a6e3-a915fb1a9f64) and click **Share → Publish**.
