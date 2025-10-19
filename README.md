COFFESST – Coffee E-Commerce Platform

COFFESST is a modern coffee e-commerce application built using Next.js, Tailwind CSS, Prisma ORM, and MySQL.
It provides a complete shopping experience for users and a fully functional admin dashboard for managing products, orders, and categories.

📌 Features
👤 User

View products by category and detailed product pages

Add products to cart and proceed to checkout

Checkout with COD, Bank Transfer, or E-Wallet

Order history & payment status tracking

Login/Register and profile management

Users must log in before checkout (automatic redirect to login page)

🔐 Admin

Access protected by middleware (only ADMIN role allowed)

Dashboard showing:

Total orders, total revenue, average order value (AOV)

Sales charts for the last 7, 14, and 30 days

Product sales data

Manage Orders:

Search, filter, and sort orders

Update order status: PROCESSED, SHIPPED, COMPLETED, CANCELED

Update payment status: PENDING, SUCCESS, FAILED

View payment proof

Manage Products:

Add, edit, soft delete products

View deleted products

Manage Categories:

Add, edit, delete categories

View deleted categories

⚙️ Installation & Setup
git clone <repository-url>
cd coffeesst
npm install


Create a .env file:

DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/coffeesst"
JWT_SECRET="your_jwt_secret_key"


Run database migration and development server:

npx prisma migrate dev
npm run dev


Access the app at http://localhost:3000

🗂 Folder Structure
src/
 ├─ app/
 │   ├─ admin/        → Admin dashboard & management pages
 │   ├─ api/          → API routes (auth, products, orders, payments, uploads)
 │   ├─ cart/         → Shopping cart page
 │   ├─ checkout/     → Checkout & payment page
 │   ├─ profile/      → User profile & order history
 │   └─ page.js       → Home page
 ├─ components/       → UI components
 ├─ lib/              → Prisma, auth handler, utilities
 └─ middleware.js     → Route protection (user & admin)

🔒 Authentication & Middleware

JWT-based authentication with cookies

Users must log in before checking out or accessing profile pages

Unauthorized access redirects to the login page

Admin routes are protected—non-admin users are automatically redirected

💾 Database

Prisma ORM as database handler

MySQL as primary database

Soft delete implemented for products and categories (deletedAt field)

Relations between User, Order, OrderItem, Product, Payment, and Category

✅ Status & Future Improvements

✔ Fully functional for basic e-commerce workflow
⬜ Add product reviews & ratings
⬜ Add upload validation & image compression
⬜ Add chart filtering by category or product type
⬜ Add email notification for order status updates

📄 License

This project is developed for educational and development purposes.
Feel free to use, modify, or contribute.
