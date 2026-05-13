# SmartDine AI - Restaurant Management System

A modern, AI-powered restaurant management platform built with Next.js 14, TypeScript, Tailwind CSS, and Prisma ORM.

## Features

### 1. Customer Ordering System
- QR code scanning for table-specific menus
- Digital menu with food images, descriptions, and prices
- Shopping cart with quantity management
- AI-powered "Frequently bought together" recommendations
- UPI payment integration
- Real-time order tracking (Received → Preparing → Ready → Delivered)
- Customer feedback with ratings

### 2. Admin Dashboard
- **Overview**: Sales statistics, recent orders, AI insights
- **Orders Management**: View all orders, update order status
- **Menu Management**: Add/edit/delete menu items, manage categories
- **Table Management**: Create tables with QR codes, print QR codes
- **Analytics**: Sales charts, popular items, peak hours, payment statistics
- **AI Insights**: Automatic insights about sales trends and patterns
- **Feedback**: Sentiment analysis of customer reviews

### 3. Kitchen Dashboard
- Live order queue with status updates
- View orders by status (Pending, Preparing, Ready)
- Table numbers and item details
- Preparation time tracking
- Audio notifications for new orders
- One-click status updates

### 4. AI-Powered Features
- **Smart Recommendations**: Suggests items frequently bought together
- **Sentiment Analysis**: Analyzes customer feedback (Positive/Negative/Neutral)
- **Sales Forecasting**: Predicts tomorrow's sales, weekend rush, item demand
- **Business Insights**: Automatically generates insights like:
  - "Sales increased by 15% this week"
  - "Butter Chicken is your best seller"
  - "Peak ordering time is 7 PM"

## Demo Credentials

- **Admin Login**: admin@smartdine.com / admin123
- **Demo Table**: Use `/demo/order` to try the customer experience

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
npm run db:seed
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## Project Structure

```
app/
├── page.tsx                 # Landing page
├── layout.tsx              # Root layout
├── globals.css             # Global styles
├── menu/
│   └── [tableId]/
│       └── page.tsx        # Customer ordering page
├── admin/
│   ├── login/
│   │   └── page.tsx        # Admin login
│   └── dashboard/
│       └── page.tsx        # Admin dashboard
├── kitchen/
│   └── page.tsx            # Kitchen dashboard
├── demo/
│   └── order/
│       └── page.tsx        # Demo ordering page
└── api/
    ├── restaurants/
    ├── tables/
    ├── orders/
    ├── payments/
    ├── feedback/
    ├── analytics/
    └── recommendations/

lib/
├── prisma.ts               # Prisma client
├── utils.ts                # Utility functions
└── constants.ts            # App constants

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Seed data
```

## Features by Module

### Customer Module
- Browse menu by categories
- Add items to cart
- View AI recommendations
- Secure UPI payment
- Track order status
- Submit feedback with ratings

### Admin Module
- View dashboard with key metrics
- Manage orders and update status
- CRUD operations for menu items
- Table management with QR codes
- View analytics charts
- Download reports
- Read customer feedback with sentiment

### Kitchen Module
- View live order queue
- Filter orders by status
- See preparation times
- Update order status quickly
- Audio notifications for new orders

## API Endpoints

- `GET /api/restaurants/[id]` - Get restaurant details
- `GET /api/tables/[id]` - Get table with menu
- `GET /api/orders` - List orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/[id]` - Update order status
- `POST /api/payments` - Process payment
- `GET/POST /api/feedback` - Feedback operations
- `GET /api/analytics` - Get analytics data
- `GET /api/recommendations` - Get item recommendations

## Database Schema

- **Restaurant**: Restaurant details
- **User**: Admin/staff accounts
- **Table**: Restaurant tables with QR codes
- **MenuItem**: Food items with categories
- **Order**: Customer orders
- **OrderItem**: Individual items in orders
- **Payment**: Payment records
- **Feedback**: Customer ratings and reviews
- **Analytics**: Daily sales analytics
- **Notification**: System notifications
- **Recommendation**: AI recommendation data
- **Prediction**: Sales forecasting data

## License

MIT License - Built for demonstration purposes.
