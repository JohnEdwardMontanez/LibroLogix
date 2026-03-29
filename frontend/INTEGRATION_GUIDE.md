# LibroLogix - Bookstore Inventory & Stock Management System

A professional, mobile-first inventory management system for bookstores. This React frontend is designed to work with your C#/FastAPI backend and SQLite database.

## Features

### 📚 Book Records (Inventory Management)
- View all books with detailed information (ID, Name, Author, Price, Publish Date, Stock)
- Search functionality by book name, author, or ID
- Add, edit, and delete book records
- Color-coded stock level indicators (Critical: ≤10%, Low: ≤30%, Normal: >30%)
- Status tracking (Active/Inactive)

### 📦 Stock Management
- Real-time stock tracking with visual indicators
- Stock level percentages and progress bars
- Restock functionality with capacity management
- Statistics dashboard showing:
  - Critical stock items (≤10%)
  - Low stock items (≤30%)
  - Total books in inventory
  - Total stock value
- Individual book stock details and value calculations

### 📊 Sales Dashboard
- Sales records with profit tracking
- Performance metrics:
  - Total revenue
  - Total profit
  - Total sales count
  - Average profit per sale
- Daily, weekly, and monthly sales tracking
- Edit and delete sales records

### 👤 Profile & Settings
- Admin profile management
- Contact information display
- Notification settings
- Quick statistics overview
- System information
- Secure logout functionality

## Navigation

The app includes a bottom navigation bar with 4 main sections:
- **Inventory**: Browse and manage book records
- **Stock**: Monitor and restock inventory
- **Sales**: View sales reports and analytics
- **Profile**: Manage settings and view statistics

## Backend Integration

This frontend is designed to integrate with your backend API. Here's what you need to implement:

### API Endpoints Required

#### Books/Inventory
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get single book
- `POST /api/books` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book
- `GET /api/books/search?q={query}` - Search books

#### Stock Management
- `GET /api/stock` - Get stock levels
- `PUT /api/stock/{bookId}` - Update stock (restock)
- `GET /api/stock/low` - Get low stock alerts
- `GET /api/stock/critical` - Get critical stock alerts

#### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/{id}` - Get single sale
- `POST /api/sales` - Create new sale
- `PUT /api/sales/{id}` - Update sale
- `DELETE /api/sales/{id}` - Delete sale
- `GET /api/sales/stats` - Get sales statistics

#### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/profile` - Get admin profile

### Data Models

#### Book Model
```json
{
  "id": "string",
  "name": "string",
  "author": "string",
  "price": "number",
  "publishDate": "string (DD/MM/YYYY)",
  "status": "Active | Inactive",
  "stockRemaining": "number",
  "totalStock": "number",
  "costPrice": "number"
}
```

#### Sale Model
```json
{
  "id": "string",
  "bookId": "string",
  "bookName": "string",
  "author": "string",
  "saleDate": "string (DD/MM/YYYY)",
  "salePrice": "number",
  "dailySales": "number",
  "weeklySales": "number (optional)",
  "monthlySales": "number",
  "profit": "number"
}
```

## Technology Stack

### Frontend
- React 18.3.1
- React Router 7.13.0
- TypeScript
- Tailwind CSS v4
- Lucide React (Icons)

### Recommended Backend (as per requirements)
- C# for business logic
- FastAPI for REST API
- SQLite for database

## Design System

- **Primary Color**: `#571977` (Deep Purple)
- **Secondary Color**: `#caabd5` (Light Purple)
- **Accent Colors**: 
  - Success: `#4caf50` (Green)
  - Warning: `#FFB300` (Yellow)
  - Danger: `#FF3D00` (Red)
  - Info: `#1976D2` (Blue)

## Mobile-First Design

The application is optimized for mobile devices with:
- Touch-friendly buttons (minimum 44px touch targets)
- Responsive layouts
- Bottom navigation for easy thumb access
- Smooth transitions and animations
- Color-coded visual indicators for quick scanning

## Current Status

✅ Frontend UI fully implemented with mock data
⏳ Awaiting backend API integration

To connect this frontend to your backend:
1. Update API base URL in the code
2. Replace mock data fetches with actual API calls
3. Implement authentication token management
4. Add error handling for API failures
5. Set up CORS on your FastAPI backend

## Development Notes

- All forms include validation
- Modals provide clear user feedback
- Stock levels automatically calculate percentages
- Profit calculations included in sales
- Responsive design works on all mobile devices
