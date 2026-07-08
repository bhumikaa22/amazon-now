# Amazon Now ⚡

> A full-stack quick-commerce web app — get anything delivered in 10 minutes.

![React](https://img.shields.io/badge/React-Frontend-blue) ![Node](https://img.shields.io/badge/Node.js-Backend-green) ![SQLite](https://img.shields.io/badge/SQLite-Database-orange)

## Features

- 🔍 **Natural language search** — type "my phone is dying" and get chargers
- ⭐ **AI-ranked results** — top pick auto-recommended
- 🛒 **Real-time cart** — persistent across sessions
- 💊 **Bundle suggestions** — contextual add-ons
- 🔐 **JWT Authentication** — signup, login, protected routes
- 📦 **Order history** — reorder in one tap
- 👤 **Profile management** — name, address, notifications
- ❓ **Help center** — searchable FAQ

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Node.js, Express |
| Database | SQLite (node:sqlite built-in) |
| Auth | JWT + bcrypt |
| Styling | Pure CSS with CSS variables |

## Project Structure

```
amazonnow/
  backend/
    db/           # Database connection + seeding
    middleware/   # JWT auth middleware
    routes/       # API routes (auth, products, cart, orders, profile)
    server.js     # Express entry point
  frontend/
    src/
      api/        # Axios API calls
      components/ # Navbar, CartDrawer, ProductCard, etc.
      context/    # Auth, Cart, Toast global state
      pages/      # Home, Login, Signup
```

## Local Setup

### Prerequisites
- Node.js v22.5+
- npm

### 1. Clone the repo

```bash
git clone https://github.com/bhumikaa22/amazon-now.git
cd amazon-now
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```
PORT=4000
JWT_SECRET=your_secret_key_here
```

Start the server:

```bash
node server.js
```

API runs at `http://localhost:4000`

### 3. Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Login |
| GET | /api/products/search?q= | Search products |
| GET | /api/cart | Get cart |
| POST | /api/cart | Add to cart |
| PUT | /api/cart/:id | Update quantity |
| DELETE | /api/cart/:id | Remove item |
| POST | /api/orders/checkout | Place order |
| GET | /api/orders | Order history |
| POST | /api/orders/:id/reorder | Reorder |
| GET | /api/profile | Get profile |
| PUT | /api/profile | Update profile |

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default 4000) |
| JWT_SECRET | Secret key for signing JWT tokens |

