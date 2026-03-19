# Urban Threads - Full Stack E-Commerce (Student Project)

A complete e-commerce demo project built with **React + Spring Boot + PostgreSQL**, designed for portfolio and recruiter showcases.

This project demonstrates real-world flows like authentication, cart, address management, wishlist, order lifecycle, reviews, admin analytics, and test-mode payments.

## Highlights

- Modern storefront UI with responsive design
- JWT auth with access/refresh token flow
- Profile management + forgot/reset password flow
- Product listing, filtering, sorting, and search
- Cart with quantity updates and delivery address selection
- Two checkout modes:
  - **Online Payment (Razorpay Test Mode)**
  - **Cash on Delivery (direct order placement)**
- Wishlist and product reviews with star ratings
- Order timeline, payment badges, and cancel flow (before shipped)
- Admin panel:
  - dashboard metrics
  - interactive charts
  - product management
  - category management
  - order management
- Cloudinary-based image handling (with cleanup on product deletion)

## Tech Stack

### Frontend (`Ecomm_Frontend`)
- React 19
- Vite
- Tailwind CSS v4
- React Router
- Axios
- Lucide + React Icons

### Backend (`Ecomm_Backend`)
- Spring Boot 4
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT (jjwt)
- Cloudinary SDK

## Monorepo Structure

```text
Ecommerce-FullStack-Personal/
|- Ecomm_Backend/      # Spring Boot API
|- Ecomm_Frontend/     # React client
|- README.md
```

## Features by Role

### User
- Register, login, logout
- Forgot/reset password
- Browse catalog and product details
- Add/remove cart items and update quantity
- Save/select/edit delivery addresses
- Checkout via COD or Razorpay test checkout
- View orders and order details
- Cancel eligible orders
- Wishlist management
- Profile update and password change
- Submit product reviews and ratings

### Admin
- Dashboard with KPIs and interactive charts
- Manage products (create/edit/delete)
- Manage categories (create/edit/delete with safeguards)
- Manage orders and status workflow

## Payment Flow (Demo-Friendly)

### Online (Razorpay Test Mode)
1. Frontend creates Razorpay order via backend
2. Razorpay checkout popup opens
3. Backend verifies Razorpay signature/payment
4. Order is created only after successful verification

### Cash on Delivery
1. User selects COD
2. No Razorpay popup appears
3. Order is placed directly
4. Orders show clear payment method/state badges

## Local Setup

## 1) Clone
```bash
git clone https://github.com/ayushcode12/ecommerce-fullstack.git
cd ecommerce-fullstack
```

## 2) Backend Setup (`Ecomm_Backend`)

Prerequisites:
- Java 17
- PostgreSQL

Update DB settings in:
`Ecomm_Backend/src/main/resources/application.properties`

Required/important properties:
- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `jwt.secret`
- `jwt.expiration`
- `jwt.refresh-expiration`
- `RAZORPAY_KEY` (env)
- `RAZORPAY_SECRET_KEY` (env)
- Cloudinary env values (optional but recommended for image uploads)

Run backend:
```bash
cd Ecomm_Backend
./mvnw spring-boot:run
```

Backend default:
- `http://localhost:8080`

## 3) Frontend Setup (`Ecomm_Frontend`)

```bash
cd Ecomm_Frontend
npm install
npm run dev
```

Frontend default:
- `http://localhost:5173`

## 4) API Base URL Note

Frontend Axios base URL is currently set in:
`Ecomm_Frontend/src/api/axiosInstance.js`

For deployment, update `BASE_URL` to your deployed backend URL.

## Build Commands

### Frontend
```bash
cd Ecomm_Frontend
npm run build
```

### Backend
```bash
cd Ecomm_Backend
./mvnw clean package
```

## Recruiter Demo Notes

- This is a **student/portfolio project**.
- Payment integration is configured for **test/sandbox usage**.
- Suitable for live demonstration of end-to-end engineering skills:
  - UI/UX implementation
  - secure auth flows
  - API design
  - payment verification flow
  - admin analytics and operations

## Recommended Deployment (Portfolio)

- Frontend: Vercel / Netlify
- Backend: Render / Railway / Fly.io
- Database: Managed PostgreSQL (Neon / Supabase / Render Postgres)
- Media: Cloudinary

Before going live:
- Set production JWT and DB secrets
- Set backend CORS to deployed frontend domain
- Update frontend API base URL
- Configure Razorpay test or live keys based on environment

## Future Enhancements

- Coupons and promotions
- Inventory reservation during payment session
- Email notifications (order + password reset)
- Better observability (logs/metrics/error tracking)
- CI/CD pipeline with automated tests

---

If you are a recruiter reviewing this project, I can also provide:
- a short architecture walkthrough
- API endpoint summary
- and a feature demo script in under 5 minutes.
