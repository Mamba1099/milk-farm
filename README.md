# 🥛 Milk Farm Management System

A comprehensive, modern web application for managing dairy farm operations built with Next.js 15, TypeScript, and Prisma.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![React](https://img.shields.io/badge/React-19.1.1-blue)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

The Milk Farm Management System is a full-stack application designed to streamline dairy farm operations. It provides comprehensive tools for managing animals, tracking milk production, recording sales, monitoring animal health, and generating detailed analytics.

## ✨ Features

### 🐄 Animal Management
- **Animal Registry**: Complete animal profiles with photos, breeding records, and health status
- **Breeding Management**: Track servings, outcomes, and breeding schedules
- **Health Monitoring**: Record treatments, vaccinations, and health status updates
- **Life Cycle Tracking**: Monitor animals from birth to disposal with detailed records

### 🥛 Production Management
- **Daily Production Recording**: Morning and evening milk production tracking
- **Production Analytics**: Detailed charts and statistics for production trends
- **Balance Management**: Automated milk balance calculations and tracking
- **Calf Feeding**: Monitor and record calf feeding quantities and schedules

### 💰 Sales Management
- **Sales Recording**: Track milk sales with customer details and payment methods
- **Revenue Analytics**: Comprehensive sales reports and revenue tracking
- **Daily/Monthly Reports**: Filtering options for today, yesterday, all time, and custom date ranges
- **Payment Tracking**: Support for cash and mobile money (M-Pesa) transactions

### 📊 Analytics & Reporting
- **Production Trends**: Visual charts showing daily, weekly, and monthly production
- **Financial Reports**: Revenue analysis and expense tracking
- **Animal Statistics**: Breeding success rates, health metrics, and productivity analytics
- **Treatment Costs**: Monitor veterinary expenses and treatment effectiveness

### 👥 User Management
- **Role-Based Access**: Farm Manager and Employee roles with different permissions
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Profile Management**: User profiles with photo uploads and activity tracking

### 🔒 Security Features
- **Production-Ready Security**: XSS protection, CORS configuration, and security headers
- **Input Validation**: Comprehensive validation using Zod schemas
- **Rate Limiting**: Protection against abuse and malicious requests
- **Error Handling**: Graceful error handling with user-friendly messages

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - Modern component library
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **TanStack Query** - Server state management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Production database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Runtime type validation

### Tools & Utilities
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Lucide React** - Beautiful icons
- **date-fns** - Date manipulation
- **axios** - HTTP client

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/milk-farm.git
   cd milk-farm
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/milk_farm"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-key"

# File Upload
UPLOAD_DIR="public/uploads"

# App Configuration
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Database Setup

1. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

2. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

3. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

4. **View database with Prisma Studio**
   ```bash
   npx prisma studio
   ```

## 🏃‍♂️ Usage

### Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

## 📡 API Documentation

The API follows RESTful conventions with the following main endpoints:

### Animals
- `GET /api/animals` - List all animals
- `POST /api/animals` - Create new animal
- `GET /api/animals/[id]` - Get animal details
- `PUT /api/animals/[id]` - Update animal
- `DELETE /api/animals/[id]` - Delete animal

### Production
- `GET /api/production` - List production records
- `POST /api/production` - Record new production
- `GET /api/production/summary` - Get production summary

### Sales
- `GET /api/sales` - List sales records
- `POST /api/sales` - Record new sale
- `GET /api/sales/stats` - Get sales statistics

### Analytics
- `GET /api/analytics/daily-production` - Daily production trends
- `GET /api/analytics/monthly-sales` - Monthly sales data
- `GET /api/analytics/top-producing-cows` - Top performers

### Authentication
- `POST /api/auth` - User login
- `POST /api/register` - User registration
- `GET /api/auth/me` - Get current user

## 📂 Project Structure

```
milk-farm/
├── app/                          # Next.js App Router
│   ├── (admin)/                 # Admin dashboard pages
│   │   ├── animals/             # Animal management
│   │   ├── production/          # Production tracking
│   │   ├── sales/               # Sales management
│   │   ├── analytics/           # Analytics dashboard
│   │   └── settings/            # System settings
│   ├── (core)/                  # Public pages
│   │   ├── login/               # Authentication
│   │   └── signup/              # User registration
│   ├── api/                     # API routes
│   │   ├── animals/             # Animal endpoints
│   │   ├── production/          # Production endpoints
│   │   ├── sales/               # Sales endpoints
│   │   ├── analytics/           # Analytics endpoints
│   │   └── auth/                # Authentication endpoints
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── not-found.tsx            # 404 page
├── components/                   # Reusable components
│   ├── ui/                      # UI components (ShadCN)
│   ├── animals/                 # Animal-specific components
│   ├── production/              # Production components
│   ├── dashboard/               # Dashboard components
│   └── auth/                    # Authentication components
├── lib/                         # Utility libraries
│   ├── services/                # Business logic
│   ├── types/                   # TypeScript definitions
│   ├── validators/              # Zod schemas
│   └── utils.ts                 # Helper functions
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Migration files
├── public/                      # Static assets
│   ├── uploads/                 # User uploads
│   └── assets/                  # Images and icons
└── hooks/                       # Custom React hooks
```

## 👥 User Roles

### Farm Manager 🧑‍💼
- **Complete System Access**: All CRUD operations
- **User Management**: Create and manage employee accounts
- **Financial Overview**: Access to all sales and expense data
- **System Configuration**: Manage farm settings and preferences
- **Analytics**: Full access to all reports and analytics

### Employee 👨‍🌾
- **Daily Operations**: Record production, sales, and animal care
- **Animal Management**: Update animal health and feeding records
- **Limited Analytics**: Access to relevant operational reports
- **Profile Management**: Update own profile and preferences

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📋 Additional Documentation

- [Registration Guide](./REGISTRATION_GUIDE.md) - Detailed user registration process
- [API Documentation](./docs/api.md) - Complete API reference
- [Deployment Guide](./docs/deployment.md) - Production deployment instructions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for modern dairy farm management**

For support or questions, please open an issue or contact the development team.
