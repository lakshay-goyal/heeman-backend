# Heeman Backend API

This repository contains the backend service for the Heeman platform, exposing REST APIs for both the customer-facing frontend and the administrative dashboard.

## Features

- **Authentication:** Integrated session and account management via `better-auth`.
- **Database Management:** Uses Prisma ORM connected to a PostgreSQL database.
- **Product & Category APIs:** CRUD operations for e-commerce catalog data with comprehensive filtering.
- **Coupons Engine:** Logic for evaluating public, private, and global discount codes.
- **Wishlist Management:** Track user wishlists for the e-commerce store.
- **Billing Configuration:** API routes to manage and retrieve global billing, tax, and shipping charge configurations.
- **Uploads & Notifications:** NodeMailer integration for emails, and support for file/image external storage uploads (via Supabase and Multer).
- **Custom Inquiries:** REST endpoints for users to submit requests for customized items, complete with associated imagery.

## Tech Stack

- **Runtime & Execution:** [Bun](https://bun.sh/)
- **Web Framework:** [Express.js](https://expressjs.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database Engine:** PostgreSQL
- **Auth Provider:** [Better Auth](https://better-auth.com/)
- **Language:** TypeScript

## Getting Started

1. **Install Dependencies:**
   ```bash
   bun install
   ```

2. **Database Setup:**
   Configure your PostgreSQL connection string in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/heeman"
   ```

3. **Apply Prisma Migrations:**
   ```bash
   bun x prisma migrate dev
   bun x prisma generate
   ```

4. **Start the Server:**
   To run the application in development mode with watch (hot-reload):
   ```bash
   bun run dev
   ```
   To build and start for production:
   ```bash
   bun run build
   ```
