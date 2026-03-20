# Authentication Module Backend

A production-ready authentication system built with Node.js, Express, TypeScript, and MongoDB. This project implements secure user authentication with JWT tokens, OTP verification, password reset, and role-based authorization.

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Runtime | Node.js v16+ |
| Framework | Express.js 4.x |
| Language | TypeScript 5.x |
| Database | MongoDB |
| ODM | Mongoose 8.x |
| Authentication | JWT |
| Password Hashing | bcryptjs |
| Validation | Zod |
| Email Service | Nodemailer |
| Security | Helmet, CORS |
| Rate Limiting | express-rate-limit |

## 📦 Prerequisites

Before you begin, ensure you have:
- Node.js v16 or higher
- npm or yarn
- MongoDB Atlas 

## 🚀 Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/skandanakv/auth-module-backend.git
cd auth-module-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File

Create `.env` file in root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/auth_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_123456789abcdefgh
JWT_REFRESH_SECRET=your_super_secret_refresh_key_987654321abcdefgh
JWT_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=604800

# Email Configuration
EMAIL_MODE=MOCK
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# OTP Configuration
OTP_EXPIRY=300

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 4: Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:3000`



## 📁 Project Structure
```
auth-module-backend/
├── src/
│   ├── config/
│   │   └── database.ts              # MongoDB connection
│   ├── controllers/
│   │   └── authController.ts        # API business logic
│   ├── middleware/
│   │   ├── authMiddleware.ts        # JWT verification
│   │   └── errorHandler.ts          # Error handling
│   ├── models/
│   │   ├── User.ts                  # User schema
│   │   ├── OTP.ts                   # OTP schema
│   │   └── RefreshToken.ts          # Token schema
│   ├── routes/
│   │   └── authRoutes.ts            # API routes
│   ├── services/
│   │   ├── emailService.ts          # Email sending
│   │   ├── otpService.ts            # OTP generation & verification
│   │   └── tokenService.ts          # JWT token management
│   ├── utils/
│   │   ├── constants.ts             # Configuration constants
│   │   ├── helpers.ts               # Helper functions
│   │   └── validators.ts            # Input validation schemas
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   └── index.ts                     # Main server file
├── .env                              # Environment variables
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── API_DOCUMENTATION.md              # API docs
└── README.md                         # This file
```

## 🔌 API Endpoints

### Public Routes (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-otp` | Verify email with OTP |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/login-otp` | Request OTP for login |
| POST | `/api/auth/refresh-token` | Get new access token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Protected Routes (Requires JWT Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |

## 📚 API Documentation

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "name": "Skandana Kumar",
  "email": "skandana@example.com",
  "phone": "+919876543210",
  "password": "SecurePass123!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "69bd170f5e0698d58f4df59b",
    "email": "skandana@example.com",
    "message": "OTP sent to your email. Please verify to complete registration."
  },
  "timestamp": "2026-03-20T09:46:45.974Z"
}
```

**Error Response (409):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already registered",
  "timestamp": "2026-03-20T..."
}
```

---

### 2. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Description:** Verify email with OTP code

**Request Body:**
```json
{
  "userId": "69bd170f5e0698d58f4df59b",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "message": "You can now login with your credentials"
  },
  "timestamp": "2026-03-20T08:04:47.283Z"
}
```

---

### 3. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user with email and password

**Request Body:**
```json
{
  "email": "skandana@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "69bd170f5e0698d58f4df59b",
      "name": "Skandana Kumar",
      "email": "skandana@example.com",
      "role": "user",
      "emailVerified": true
    }
  },
  "timestamp": "2026-03-20T09:46:45.974Z"
}
```

---

### 4. Login with OTP

**Endpoint:** `POST /api/auth/login-otp`

**Description:** Request OTP for password-less login

**Request Body:**
```json
{
  "email": "skandana@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to email",
  "data": {
    "userId": "69bd170f5e0698d58f4df59b",
    "message": "Enter OTP to login"
  },
  "timestamp": "2026-03-20T..."
}
```

---

### 5. Refresh Token

**Endpoint:** `POST /api/auth/refresh-token`

**Description:** Get new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "timestamp": "2026-03-20T08:13:15.676Z"
}
```

---

### 6. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Request password reset email

**Request Body:**
```json
{
  "email": "skandana@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If email exists, reset link sent",
  "data": {},
  "timestamp": "2026-03-20T..."
}
```

---

### 7. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset password with reset token

**Request Body:**
```json
{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewPass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "message": "Password reset successful. Please login with new password."
  },
  "timestamp": "2026-03-20T08:17:33.508Z"
}
```

---

### 8. Get Current User (Protected)

**Endpoint:** `GET /api/auth/me`

**Description:** Get authenticated user information

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "69bd170f5e0698d58f4df59b",
      "name": "Skandana Kumar",
      "email": "skandana@example.com",
      "phone": "+919876543210",
      "role": "user",
      "emailVerified": true,
      "phoneVerified": false,
      "isActive": true,
      "createdAt": "2026-03-20T09:46:45.974Z",
      "updatedAt": "2026-03-20T09:46:45.974Z"
    }
  },
  "timestamp": "2026-03-20T08:08:00.282Z"
}
```

---

### 9. Logout (Protected)

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout and invalidate refresh token

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {},
  "timestamp": "2026-03-20T08:47:13.826Z"
}
```

---

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,                    // User full name
  email: String (unique),          // Email address
  phone: String (unique),          // Phone number
  password: String (hashed),       // Hashed with bcryptjs
  role: String,                    // 'user', 'admin', 'super_admin'
  emailVerified: Boolean,          // Email verification status
  phoneVerified: Boolean,          // Phone verification status
  isActive: Boolean,               // Account active status
  failedLoginAttempts: Number,     // Failed login count
  lockedUntil: Date,               // Account lock time
  createdAt: Date,                 // Created timestamp
  updatedAt: Date                  // Last update timestamp
}
```

### OTP Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),   // Associated user
  code: String,                    // 6-digit OTP code
  type: String,                    // 'email' or 'phone'
  expiresAt: Date,                 // Auto-delete after expiry
  attempts: Number,                // Wrong attempt count
  isUsed: Boolean,                 // One-time use flag
  createdAt: Date,
  updatedAt: Date
}
```

### RefreshToken Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),   // Associated user
  token: String (unique),          // JWT token
  expiresAt: Date,                 // Auto-delete after expiry
  isRevoked: Boolean,              // Revocation status
  createdAt: Date,
  updatedAt: Date
}
```



## 👨‍💻 Author

Skandana KV



