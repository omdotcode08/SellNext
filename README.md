# SellNext - Local Marketplace

A modern React-based marketplace application with MongoDB backend integration.

## 🚀 Quick Start

### 1. Update MongoDB Password
Before starting, you need to update your MongoDB connection string:

1. Open `server/.env`
2. Replace `<db_password>` with your actual MongoDB Atlas password:
   ```
   MONGODB_URI=mongodb+srv://ommanglani88dbuser:YOUR_ACTUAL_PASSWORD@sellnextcluster.0s4k5f3.mongodb.net/?retryWrites=true&w=majority&appName=SellNextcluster
   ```

### 2. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm run install-all
```

### 3. Start Development Servers
```bash
# Start both frontend and backend simultaneously
npm run dev-all
```

Or start them separately:
```bash
# Terminal 1 - Backend (http://localhost:5000)
npm run server

# Terminal 2 - Frontend (http://localhost:5173)
npm run dev
```

## 🎯 Features Implemented

### ✅ Context API Integration
- **AuthContext**: Real user authentication with MongoDB
- **CartContext**: Shopping cart functionality
- **NotificationContext**: Toast notifications

### ✅ Real Database Integration
- User registration and login with MongoDB
- JWT-based authentication
- Product CRUD operations
- User-specific product listings

### ✅ Updated Components
- **Header**: Shows "Welcome, {username}" and cart count
- **Profile**: Shows "Hi {username}!" instead of "My Profile"
- **Buy Page**: Real products from database with "Add to Cart"
- **Sell Page**: Creates real products in database
- **Cart Page**: Full shopping cart functionality

## 🛠 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user  
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with filtering)
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## 🧪 Testing the Setup

1. **Update MongoDB password** in `server/.env`
2. **Start both servers** using `npm run dev-all`
3. **Visit** http://localhost:5173
4. **Create account** → **Login** → **Add product** → **View in Buy section**

## 📁 Project Structure

```
SellNext/
├── src/                    # Frontend React app
│   ├── components/         # Reusable components
│   ├── contexts/          # React Context providers
│   ├── pages/             # Page components
│   └── services/          # API service layer
├── server/                # Backend Express app
│   ├── config/            # Database configuration
│   ├── middleware/        # Express middleware
│   ├── models/            # MongoDB models
│   └── routes/            # API routes
└── README.md
```

## 🔧 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (server/.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

## 🚨 Troubleshooting

### MongoDB Connection Error
- Ensure your IP is whitelisted in MongoDB Atlas
- Replace `<db_password>` with actual password
- Check network connectivity

### CORS Issues
- Verify backend runs on port 5000
- Check CLIENT_URL in server/.env

### Authentication Issues
- Clear browser storage (localStorage/sessionStorage)
- Verify JWT_SECRET is set in backend

## 🎉 What's Working Now

- ✅ Real user signup/login with database
- ✅ Context API showing usernames throughout app
- ✅ Add products that save to MongoDB
- ✅ View real products from database
- ✅ Shopping cart with context state
- ✅ Profile management with real data
- ✅ JWT-based authentication
- ✅ Responsive design with Tailwind CSS

Your marketplace is now fully connected to MongoDB and ready for real users! 🚀