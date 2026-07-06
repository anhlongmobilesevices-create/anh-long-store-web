# Anh Long Mobile - Admin Dashboard

Professional landing page and admin dashboard for phone repair services.

## Features

- **Admin Dashboard**: Manage portfolio items (create, edit, delete)
- **JWT Authentication**: Secure login system
- **PostgreSQL Database**: Persistent data storage
- **React Frontend**: Modern UI with Vite
- **Express Backend**: RESTful API

## Setup

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/anh_long_db
JWT_SECRET=your-secret-key
PORT=3001
```

### Database Setup

Create the portfolio table:

```sql
CREATE TABLE portfolio (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Development

```bash
# Terminal 1: Start backend
pnpm run server

# Terminal 2: Start frontend
pnpm run dev
```

Visit `http://localhost:3000`

### Login Credentials

- Email: `admin@anhlongmobile.com`
- Password: `admin123`

## Deployment

### Railway

1. Push to GitHub
2. Connect GitHub to Railway
3. Set environment variables in Railway dashboard
4. Deploy

## Project Structure

```
client/
  src/
    components/
      AdminDashboard.jsx
      Login.jsx
    App.jsx
    main.jsx
    index.css
  index.html

server/
  index.js

vite.config.js
package.json
```
