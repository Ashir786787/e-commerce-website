<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Objective
- Build a professional e-commerce website (NovaCart) with Stripe payments, guest checkout, order management, admin panel, and discount code system for Vercel deployment

## Important Details
- Tech stack: Next.js 16.2.10 (App Router), React 19.2.4, TypeScript, MongoDB Atlas (Mongoose 9.7.4), Tailwind CSS 4, shadcn/ui, Lucide icons, Sonner toasts, Nodemailer (Gmail SMTP), Stripe (v22.3.2), Recharts (v3), Cloudinary (v2)
- Brand name: **NovaCart**
- Currency: PKR — All prices use `Rs.` format with `Intl.NumberFormat("en-PK")`
- Design: indigo/violet accents (`#4f46e5`), rounded-2xl/3xl cards
- Auth: JWT in `novacart_token` httpOnly cookie via `response.cookies.set()` (fixed), guest fallback via `resolveUserId()`
- All order pages use `resolveUserId()` (logged-in + guest support)
- Must deploy on Vercel — all env vars must be set in Vercel Dashboard
- Discount codes: same code usable by multiple users, each user only once; percentage off subtotal; random 6-char alphanumeric (no I/O/0/1); validated server-side at order creation

## Completed
- Guest cart/wishlist + Vercel timeout fix, globals.css font fix, order pages auth
- Payment status race condition fix (success page updates Order DB directly)
- MissingSchemaError fix (side-effect imports for Product model)
- Webhook graceful fallback when STRIPE_WEBHOOK_SECRET missing
- Double slash fix in Stripe URLs, checkout cancel page, login cookie bug
- Admin panel (dashboard + users listing + user detail + MobileNav)
- Invoice flow (order detail page → invoice content, invoice page → redirect, success page link updated)
- Product card height fix
- **Discount code system** — full implementation:
  - `src/models/DiscountCode.ts` — schema with `code`, `discountPercent`, `isActive`, `expiresAt`, `usedBy[]`
  - `src/lib/discount.ts` — `generateCode()`, `validateDiscountCode()`, `markCodeUsed()`
  - `src/app/api/discount/validate/route.ts` — POST endpoint for code validation (needs auth)
  - `src/app/api/admin/discount-codes/route.ts` — POST (generate) + GET (list)
  - `src/components/checkout/DiscountCodeInput.tsx` — client component (input/apply/remove)
  - `src/models/Order.ts` — added `discountCode`, `discountPercent` fields
  - `src/services/order.service.ts` — validates code, applies discount, marks `usedBy` in transaction
  - `src/controllers/order.controller.ts` — passes `discountCode` from request to `createOrder`
  - `src/components/checkout/CheckoutForm.tsx` — manages discount state, sends code in order body
  - `src/components/checkout/OrderSummary.tsx` — accepts discount props, shows discount input + line item
- **Admin sidebar active-state + Recharts dashboard**:
  - `src/lib/admin-navigation.ts` — `isAdminNavActive()` helper (prefix match on href; Dashboard href is `/admin/dashboard`)
  - `src/components/admin/AdminSidebar.tsx` — client sidebar with `usePathname()` active highlighting (`bg-indigo-600 text-white`)
  - `src/app/admin/(protected)/layout.tsx` renders `AdminSidebar`; `AdminMobileNav.tsx` uses same active logic
  - `src/app/admin/(protected)/dashboard/page.tsx` — dashboard with period selector (7d/30d/90d/12m/all, `AnalyticsPeriodSelect` with `basePath` prop) + stat cards + charts
  - `src/components/admin/dashboard/{RevenueChart,OrderStatusChart,PaymentStatusChart,TopProductsChart}.tsx` — Recharts AreaChart (revenue trend), donut charts (order/payment status), vertical BarChart (top products)
- **Admin route restructure (`/admin/login` + `/admin/dashboard`)**:
  - All admin pages live under `src/app/admin/(protected)/…` route group; `src/app/admin/page.tsx` just `redirect("/admin/dashboard")`
  - `src/app/admin/login/page.tsx` + `src/components/admin/AdminLoginForm.tsx` — dark admin login; posts `/api/auth/login`, checks role via `/api/auth/me`, non-admin is auto-logged-out
  - `requireAdmin()` no-auth catch → `/admin/login`; `src/proxy.ts` exempts `/admin/login` + `/admin` and sends unauthenticated `/admin/*` → `/admin/login` (checkout still → `/login`); `AdminLogoutButton` → `/admin/login`
- **Real-time notifications (Firebase RTDB)** — path `notifications/{targetKey}/{id}` where `targetKey` = user id (user-targeted) or `admin` (broadcast); node = `{ type, title, body, link?, read, createdAt }`:
  - `src/services/notification.service.ts` — `createNotification()` (optional `notificationId` for fixed-key writes), `createNotificationSafe()` (never throws), `subscribeToNotifications()`, `markNotificationRead()`, `markAllNotificationsRead()`; **lazy, guarded Firebase init** — if `NEXT_PUBLIC_FIREBASE_*` vars are missing it logs a warning and no-ops, so order/chat flows never break
  - `src/components/notifications/NotificationBell.tsx` — reusable client bell (unread badge, dropdown, mark-all-read) in `admin/(protected)/layout.tsx` header (`targetKey="admin"`) and `SiteHeader` (`targetKey={user.id}`)
  - Triggers (all fire-and-forget via `void createNotificationSafe(...)`): new order → admin (`order.service.ts`), order status change → user (`api/admin/orders/[id]` PATCH), payment confirmed → user (`api/webhooks/stripe` when status flips to paid), new chat message → both (`chat.service.ts` sendChatMessage), low stock ≤5 → admin (`order.service.ts`, fixed key `lowstock_{productId}` so repeat orders update instead of stack)
- **Cloudinary product image uploads**:
  - `src/lib/cloudinary.ts` — `uploadImage()` via `uploader.upload_stream`, `deleteImage()`, `isCloudinaryConfigured()`; uses `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` env vars
  - `src/app/api/admin/upload/route.ts` — admin-only POST (image types jpeg/png/webp/gif/avif, max 4MB)
  - `src/components/admin/ProductForm.tsx` — per-image upload UI (thumb preview, Upload to Cloudinary button, URL fallback); product images now `{url, publicId}[]`
  - `next.config.ts` — `res.cloudinary.com` added to `images.remotePatterns`

## Deploy
- Vercel Dashboard → Settings → Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, plus all 7 `NEXT_PUBLIC_FIREBASE_*` vars (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`, `DATABASE_URL`)
- **Firebase Console → Build → Realtime Database → Rules** must grant the app read/write on the notification paths (mirror the existing permissive chat rules). Example rules for a rules-blanket project:
  ```json
  {
    "rules": {
      "conversations": { ".read": true, ".write": true },
      "messages": { "$conversationId": { ".read": true, ".write": true } },
      "notifications": { "$targetKey": { ".read": true, ".write": true } }
    }
  }
  ```
- Push to GitHub, import repo on Vercel, `npm run build` should pass (verified: 43 routes, zero errors)