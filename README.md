# NovaCart

A full-stack e-commerce store built with Next.js and MongoDB. Supports guest checkout, Stripe payments, real-time order tracking, a live support chat, push notifications, and a complete admin panel with analytics.

Prices are in PKR throughout the store.

## Features

### Storefront
- Product catalog with category filters, search, and a deals page
- Cart and wishlist for both logged-in and guest users (guests are tracked via a browser cookie)
- Checkout with Stripe — Card, Apple Pay, and Google Pay, with a wallet-friendly Cash on Delivery option
- Order history and per-order invoice downloads
- Account pages for profile, saved addresses, and notification settings
- One-time password email verification and password reset via Nodemailer

### Admin panel
- Dashboard with revenue/order analytics over selectable date ranges (Recharts)
- Order management with status updates, plus product, category, user, and discount-code management
- Cloudinary-backed image uploads for products
- Email newsletter subscribers list with toggleable subscriptions
- Broadcast push notifications to all opted-in users
- Admin-side conversation view for support chat

### Real-time features (Firebase)
- Push notifications (FCM) for order status changes and payment confirmations
- Live order tracking from checkout to delivery
- Support chat with guest identity support — runs directly on the Firebase Realtime Database
- Notification bells in the store header and admin panel

## Tech stack

- **Next.js 16** (App Router, TypeScript) + Tailwind CSS 4 + shadcn/ui
- **MongoDB Atlas** with Mongoose
- **Stripe** for payments and webhooks
- **Firebase** (Realtime Database, Cloud Messaging) with the Firebase Admin SDK
- **Cloudinary** for image hosting
- **Nodemailer** (Gmail SMTP) for transactional email

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the required values (MongoDB URI, JWT secret, Stripe keys, SMTP credentials, Firebase config, Cloudinary keys).

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000.

Admin routes live at `/admin/login` — the first user is promoted to admin automatically on signup.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run lint` — lint the project
- `npm run typecheck` — run the TypeScript compiler

## Deployment

Deploy to Vercel and set the environment variables listed in `.env.example` in the Vercel dashboard. If you want webhook-delivered push notifications on Android, register a service worker for Firebase Cloud Messaging.

## Note on Firebase rules

The Realtime Database rules must allow read/write on the `conversations`, `messages`, `notifications`, and `orderUpdates` paths for the real-time features to work. See the deployment notes in the Vercel setup for the exact rules.
