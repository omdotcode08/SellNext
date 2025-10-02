# SellNext - Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

## Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   - Update `server/.env` file with your actual MongoDB password:
   ```
   MONGODB_URI=mongodb+srv://ommanglani88dbuser:YOUR_ACTUAL_PASSWORD@sellnextcluster.0s4k5f3.mongodb.net/?retryWrites=true&w=majority&appName=SellNextcluster
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```
   The server will run on http://localhost:5000

## Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install axios
   ```

3. **Start the frontend:**
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:5173

## Database Setup

Your MongoDB database will be automatically set up when you:
1. Replace `<db_password>` in the connection string with your actual password
2. Start the backend server
3. Create your first user account

## Features Now Working

### Authentication
- ✅ Real user registration with MongoDB
- ✅ Real user login with JWT tokens
- ✅ Profile updates stored in database
- ✅ Secure password hashing

### Products
- ✅ Add real products to database
- ✅ View products from database
- ✅ User-specific product listings
- ✅ Product search and filtering

### Context Integration
- ✅ AuthContext with real API
- ✅ CartContext for shopping cart
- ✅ Real-time user data updates

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/user/:userId` - Get user's products

## Testing the Setup

1. **Start both servers** (backend on :5000, frontend on :5173)
2. **Create a new account** on the signup page
3. **Login** with your credentials
4. **Add a product** using the Sell page
5. **View your product** on the Buy page
6. **Check your profile** to see your listed products

## Troubleshooting

### MongoDB Connection Issues
- Ensure your IP is whitelisted in MongoDB Atlas
- Check that the password in the connection string is correct
- Verify the database name matches your cluster

### CORS Issues
- Make sure the backend is running on port 5000
- Check that CLIENT_URL in .env matches your frontend URL

### Authentication Issues
- Clear browser localStorage/sessionStorage
- Check that JWT_SECRET is set in backend .env
- Verify the API_URL in frontend .env matches backend URL

## Next Steps

After setup, you can:
- Add more product categories
- Implement image upload functionality
- Add messaging between users
- Implement payment integration
- Add product reviews and ratings