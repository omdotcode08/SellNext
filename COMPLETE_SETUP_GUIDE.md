# 🚀 SellNext - Complete Setup Guide

## 📋 What We've Built

Your SellNext marketplace now has:
- ✅ **Real MongoDB Integration** - No more mock data!
- ✅ **Context API Throughout** - Username in navbar, profile, cart count
- ✅ **JWT Authentication** - Secure login/signup
- ✅ **Real Product Management** - Add/view products from database
- ✅ **Shopping Cart** - Full cart functionality with context
- ✅ **Responsive Design** - Works on all devices

## 🛠 Setup Steps

### Step 1: Update MongoDB Password
1. Open `server/.env`
2. Replace `<db_password>` with your actual MongoDB Atlas password:
   ```env
   MONGODB_URI=mongodb+srv://ommanglani88dbuser:YOUR_ACTUAL_PASSWORD@sellnextcluster.0s4k5f3.mongodb.net/?retryWrites=true&w=majority&appName=SellNextcluster
   ```

### Step 2: Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm run install-all
```

### Step 3: Start Development
```bash
# Option 1: Start both servers simultaneously
npm run dev-all

# Option 2: Start separately (use 2 terminals)
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

### Step 4: Test the Setup
1. Visit http://localhost:5173
2. Click "Test Backend Connection" (blue box at top)
3. Should show "✅ Backend Connected Successfully!"

## 🎯 Testing Real Features

### Test Authentication
1. **Sign Up**: Create a new account
2. **Login**: Use your credentials
3. **Check Header**: Should show "Welcome, YourName"
4. **Check Profile**: Should show "Hi YourName!"

### Test Product Management
1. **Add Product**: Go to Sell page, fill form, submit
2. **View Products**: Go to Buy page, see your product
3. **Add to Cart**: Click "Add to Cart" on any product
4. **Check Cart**: Click cart icon in header

### Test Context Integration
- **Username Display**: Appears in header and profile
- **Cart Count**: Shows number in header cart icon
- **Real Data**: All data comes from MongoDB

## 📁 Project Structure

```
SellNext/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Shows "Welcome, {username}" + cart
│   │   ├── TestConnection.jsx  # Backend connection test
│   │   └── Footer.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Real MongoDB auth
│   │   ├── CartContext.jsx     # Shopping cart state
│   │   └── NotificationContext.jsx
│   ├── pages/
│   │   ├── Home.jsx           # Landing page with test
│   │   ├── Login.jsx          # Real login with API
│   │   ├── Signup.jsx         # Real signup with API
│   │   ├── Buy.jsx            # Real products from DB
│   │   ├── Sell.jsx           # Add products to DB
│   │   ├── Profile.jsx        # "Hi {username}!" + real data
│   │   └── Cart.jsx           # Full cart functionality
│   └── services/
│       └── api.js             # API service layer
├── server/
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Product.js         # Product schema
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   └── products.js        # Product endpoints
│   └── server.js              # Main server file
└── .env                       # Frontend environment
```

## 🔧 API Endpoints Available

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with search/filter)
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/user/:userId` - Get user's products

## 🎨 Context API Usage Examples

### AuthContext
```jsx
import { useAuth } from '../contexts/AuthContext'

const { user, isAuthenticated, login, logout } = useAuth()

// Show username
<p>Welcome, {user?.fullName?.split(' ')[0]}</p>

// Check if logged in
{isAuthenticated && <ProfileLink />}
```

### CartContext
```jsx
import { useCart } from '../contexts/CartContext'

const { cartItems, addToCart, getCartCount } = useCart()

// Show cart count
<span>{getCartCount()}</span>

// Add to cart
<button onClick={() => addToCart(product)}>
  Add to Cart
</button>
```

## 🚨 Troubleshooting

### "Backend Connection Failed"
- Check if backend is running: `npm run server`
- Verify port 5000 is not in use
- Check MongoDB password in `server/.env`

### "Authentication Failed" 
- Clear browser storage (F12 → Application → Storage → Clear)
- Check JWT_SECRET in `server/.env`
- Restart backend server

### "Cannot Connect to Database"
- Verify MongoDB Atlas password
- Check IP whitelist in MongoDB Atlas
- Ensure internet connection

### CORS Errors
- Backend must run on port 5000
- Frontend must run on port 5173
- Check CLIENT_URL in `server/.env`

## 🎉 What's Working Now

### ✅ Context API Integration
- **Header**: Shows "Welcome, {username}" and cart count
- **Profile**: Shows "Hi {username}!" instead of "My Profile"  
- **Cart**: Real-time cart count and management
- **Authentication**: Persistent login across page refreshes

### ✅ Real Database Features
- **User Registration**: Creates real users in MongoDB
- **User Login**: JWT-based authentication
- **Product Creation**: Add products that save to database
- **Product Viewing**: See real products from database
- **Profile Management**: Update real user data

### ✅ Shopping Cart
- **Add to Cart**: Products added to cart context
- **Cart Count**: Shows in header navigation
- **Cart Management**: View, update, remove items
- **Persistent Cart**: Survives page refreshes

## 🚀 Next Steps

Your marketplace is now fully functional! You can:

1. **Remove Test Component**: Delete TestConnection from Home.jsx
2. **Add Image Upload**: Implement real image upload for products
3. **Add Messaging**: User-to-user communication
4. **Add Reviews**: Product and seller ratings
5. **Add Payment**: Integrate payment processing
6. **Deploy**: Deploy to production (Vercel + MongoDB Atlas)

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Ensure both servers are running
4. Check browser console for errors

Your SellNext marketplace is ready for real users! 🎊