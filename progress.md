## 🚀 12-Hour E-Commerce Challenge Checklist

### 🏁 Initial Setup (0-1 hour)

- [x] Parse the spec and note **core requirements** and **stretch goals**.
- [x] Sketch data models (products, categories, users, carts, orders, flash sales, audit logs).
- [ ] Define user roles and permissions.
- [ ] Outline endpoints (CRUD, checkout, flash sale, real-time updates).
- [ ] Draft a high-level architecture diagram (API, DB, WebSocket, etc.).

---

### 💾 Back End Development (1-4 hours)

#### 🗂️ Data Models

- [ ] Define Mongoose schemas:
  - [x] Product (name, description, price, stock, etc.)
  - [x] Category (name, description)
  - [x] User (roles: Admin, Seller, Customer)
  - [x] Cart (per customer, holds items)
  - [ ] Order (references products, status, totals)
  - [ ] FlashSale (active sale windows, price overrides, per-customer limits)
  - [ ] AuditLog (who did what, when)

#### ⚙️ CRUD APIs

- [x] Products: CRUD (Admin full access, Seller only own)
- [x] Categories: CRUD (Admin)
- [x] Users: CRUD (Admin)
- [x] Carts: Customer manage own cart
- [ ] Orders: place and read own orders
- [ ] FlashSale: create/activate/stop (Admin only)

#### 🔍 Features

- [x] Full-text search on product name and description.
- [x] Cursor-based pagination for products.

#### 🔐 Authentication & Authorization

- [x] Implement JWT-based login.
- [x] Secure routes based on roles:
  - [x] Admin: full access
  - [x] Seller: own products & inventory
  - [ ] Customer: catalog browsing, manage cart, place orders

#### 💰 Checkout Logic

- [ ] Endpoint that:
  - [ ] Atomically reserves stock
  - [ ] Calculates totals (including tax, discount codes)
  - [ ] Emits an order record
  - [ ] Broadcasts `InventoryChanged` event

#### 📝 Audit Log

- [ ] Record product edits (create, update, delete).
- [ ] Record order status changes.

#### ⚡ Real-Time Events

- [ ] Setup WebSocket/SSE endpoint.
- [ ] Emit real-time stock updates to connected clients.

---

### 🎨 Front End Development (4-7 hours)

#### 🌐 Setup

- [ ] Create React 18+ app (or Angular 17+ if preferred).
- [ ] Connect to API and WebSocket endpoint.

#### 📦 Views

- [ ] Catalog grid:
  - [ ] Display products
  - [ ] Search & category filter
  - [ ] Real-time stock badge updates
- [ ] Cart & checkout flow:
  - [ ] Show cart contents
  - [ ] Checkout form to place orders
- [ ] Admin dashboard:
  - [ ] List all products
  - [ ] Low-stock alert badges

#### 🧪 Tests

- [ ] Write at least 5 meaningful unit/component tests.

---

### 🔧 Additional Tasks (7-9 hours)

- [ ] Implement role-based checks on the frontend.
- [ ] Build flash-sale logic for sale windows & per-customer purchase limits.
- [ ] Add audit log viewer (optional for admin).
- [ ] Validate data integrity (e.g., no checkout if stock insufficient).

---

### 🐳 Docker & CI Setup (9-10 hours)

- [ ] Create Dockerfile for Node API.
- [ ] Create Dockerfile for React/Angular frontend.
- [ ] Compose MongoDB, API, and frontend in `docker-compose.yml`.
- [ ] One-command bootstrap (`docker-compose up --build`).

---

### 📦 Postman/OpenAPI & Seed Script (9-10 hours)

- [ ] Document all API routes in Postman or OpenAPI.
- [ ] Create a seed script to insert:
  - [ ] Demo users (Admin, Seller, Customer)
  - [ ] 20 demo products
  - [ ] 1 active flash sale

---

### 🧹 Polish & Stretch Goals (10-11 hours)

- [ ] Polish UX: accessibility, error states, loading spinners.
- [ ] Add optimistic UI for add-to-cart.
- [ ] (Optional) Use Next.js or Angular Universal for SSR on catalog.
- [ ] Add rate-limiting middleware for flash sale endpoints.
- [ ] Write a Cypress/Playwright test for full checkout (optional).

---

### ✅ Final Checklist & Deliverables (11-12 hours)

- [ ] Record a ≤ 3-minute demo video/GIF:
  - [ ] Show flash sale
  - [ ] Real-time badge updates
  - [ ] Stock decrement on checkout
- [ ] Write `README.md`:
  - [ ] How to run locally and via Docker
  - [ ] Domain assumptions
  - [ ] Major decisions (~1 page)
- [ ] Save automated test coverage report (≥ 70% line coverage).
- [ ] Push incremental commits to GitHub.
- [ ] Verify all endpoints & real-time features work end-to-end.
- [ ] Attach final architecture brief (diagram + ~500-800 words).
- [ ] Celebrate! 🎉

---

### 🔬 Stretch Goals (If Time Left)

- [ ] GitHub Actions CI pipeline: test → build → push Docker images.

---

### 💡 Notes & Assumptions

- [ ] Use sensible references/embedding in MongoDB.
- [ ] No payment gateway integration—simulate payment.
- [ ] Use WebSocket or SSE for real-time updates.
- [ ] Focus on core flows—prioritize minimum-viable but production-ready.

---
