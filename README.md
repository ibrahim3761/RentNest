# 🏠 RentNest — Rental Property Management API

A full-featured RESTful API for managing rental properties. Supports role-based access control for Tenants, Landlords, and Admins with Stripe payment integration.

## 🔗 Links

- **Live API:** https://rent-nest-lilac.vercel.app
- **GitHub:** https://github.com/ibrahim3761/RentNest

## 🔐 Admin Credentials

```
Email    : admin@rentnest.com
Password : Admin@123
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Language | TypeScript |
| ORM | Prisma v7 |
| Database | PostgreSQL (Prisma Postgres) |
| Authentication | JWT (Access + Refresh Token) |
| Payment | Stripe Checkout |
| Deployment | Vercel |

## 📁 Project Structure

```
RentNest/
├── prisma/
│   ├── schema/
│   │   ├── schema.prisma      # Generator config
│   │   ├── enums.prisma       # All enums
│   │   ├── user.prisma
│   │   ├── category.prisma
│   │   ├── property.prisma
│   │   ├── rental.prisma
│   │   ├── payment.prisma
│   │   └── review.prisma
│   ├── migrations/            # 6 migrations
│   └── seed.ts
├── src/
│   ├── config/                # Environment config
│   ├── errors/                # AppError class
│   ├── lib/                   # Prisma & Stripe clients
│   ├── middlewares/           # Auth, error handler, not found
│   ├── modules/
│   │   ├── auth/
│   │   ├── categoris/
│   │   ├── property/
│   │   ├── landlord/
│   │   ├── rentals/
│   │   ├── reviews/
│   │   ├── payments/
│   │   └── admin/
│   ├── utility/               # catchAsync, sendResponse, jwt
│   ├── app.ts
│   └── server.ts
├── prisma.config.ts
├── tsup.config.ts
├── vercel.json
└── tsconfig.json
```

## 🗄️ Database Schema

### Models
- **User** — Tenant, Landlord, Admin with ban/active status
- **Category** — Property categories (Apartment, House, Studio etc.)
- **Property** — Listings with filters, pagination, search
- **RentalRequest** — Tenant requests with full status flow
- **Payment** — Stripe payment records
- **Review** — Property reviews after completed rentals

### Enums
```
Role          → TENANT | LANDLORD | ADMIN
UserStatus    → ACTIVE | BANNED
RentalStatus  → PENDING | APPROVED | REJECTED | ACTIVE | COMPLETED
PaymentStatus → PENDING | COMPLETED | FAILED
```

## 🔄 Rental Flow

```
Tenant submits request  →  PENDING
Landlord approves       →  APPROVED
Tenant pays via Stripe  →  ACTIVE   (webhook handles this)
Landlord marks done     →  COMPLETED
Tenant leaves review    →  Review created
```

## 📋 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Auth |
| PUT | `/api/auth/me` | Update current user | Auth |
| POST | `/api/auth/refresh-token` | Refresh access token | Public |

### Categories — `/api/categories`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/categories` | Get all categories | Public |
| POST | `/api/categories` | Create category | Admin |
| DELETE | `/api/categories/:categoryId` | Delete category | Admin |

### Properties — `/api/properties`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/properties` | Get all available properties | Public |
| GET | `/api/properties/:propertyId` | Get property details | Public |

**Supported Query Filters:**
```
?searchTerm=   Search in title, description, location, city
?city=         Filter by city
?categoryId=   Filter by category
?minPrice=     Minimum price
?maxPrice=     Maximum price
?bedrooms=     Number of bedrooms
?page=         Page number (default: 1)
?limit=        Items per page (default: 10)
?sortBy=       Field to sort by (default: createdAt)
?sortOrder=    asc | desc (default: desc)
```

### Landlord — `/api/landlord`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/landlord/properties` | Create property listing | Landlord |
| PUT | `/api/landlord/properties/:propertyId` | Update property listing | Landlord |
| DELETE | `/api/landlord/properties/:propertyId` | Delete property listing | Landlord/Admin |
| GET | `/api/landlord/requests` | Get all rental requests | Landlord |
| PATCH | `/api/landlord/requests/:requestId` | Approve/reject/complete request | Landlord |

### Rentals — `/api/rentals`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/rentals` | Submit rental request | Tenant |
| GET | `/api/rentals` | Get my rental requests | Tenant |
| GET | `/api/rentals/:requestId` | Get rental request details | Tenant |

### Reviews — `/api/reviews`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/reviews` | Submit review (completed rentals only) | Tenant |
| GET | `/api/reviews/:propertyId` | Get property reviews + avg rating | Public |

### Payments — `/api/payments`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/payments/create` | Create Stripe checkout session | Tenant |
| POST | `/api/payments/confirm` | Stripe webhook handler | Stripe |
| GET | `/api/payments` | Get payments | Tenant/Admin |
| GET | `/api/payments/:paymentId` | Get payment details | Tenant/Admin |

### Admin — `/api/admin`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/users` | Get all users | Admin |
| PATCH | `/api/admin/users/:userId` | Ban/unban user | Admin |
| GET | `/api/admin/properties` | Get all properties | Admin |
| GET | `/api/admin/rentals` | Get all rental requests | Admin |

## 📦 Response Format

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": {}
}
```

**With pagination:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errorDetails": null
}
```

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Prisma Postgres)
- Stripe account + Stripe CLI

### Installation

```bash
# Clone the repo
git clone https://github.com/ibrahim3761/RentNest.git
cd RentNest

# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Fill in your environment variables
```

### Environment Variables

```env
PORT=5000
APP_URL=http://localhost:3000
DATABASE_URL=your_database_url
BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database (creates admin + categories)
npm run db:seed
```

### Running the Server

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

### Testing Stripe Webhooks Locally

```bash
# Run in a separate terminal
stripe listen --forward-to localhost:5000/api/payments/confirm
```

**Stripe Test Card:**
```
Card Number : 4242 4242 4242 4242
Expiry      : Any future date
CVC         : Any 3 digits
```

## 🌱 Seed Data

Running `npm run db:seed` creates:
- 7 default categories: Apartment, House, Studio, Villa, Room, Office, Duplex