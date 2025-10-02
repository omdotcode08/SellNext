# SellNext Backend Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **Git**

## Quick Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies (from root directory)
cd ..
npm install
```

### 2. Environment Configuration

The backend requires a `.env` file in the `server` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sellnext

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL for CORS
CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Or start MongoDB daemon (Linux/Mac)
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a cluster and get your connection string
- Update `MONGODB_URI` in `.env` file

### 4. Start the Backend Server

```bash
cd server
npm start
```

The server will start on `http://localhost:5000`

### 5. Start the Frontend

```bash
# From root directory
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product (requires auth)
- `PUT /api/products/:id` - Update product (requires auth)
- `DELETE /api/products/:id` - Delete product (requires auth)
- `GET /api/products/user/:userId` - Get user's products

### Health Check
- `GET /api/health` - Server health check

## Database Schema

### User Model
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  location: String,
  userType: [String], // ['buyer', 'seller']
  bio: String,
  rating: Number,
  reviewCount: Number
}
```

### Product Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  originalPrice: Number,
  category: String,
  condition: String,
  images: [String],
  seller: ObjectId (ref: User),
  location: String,
  status: String, // 'active', 'sold', 'pending', 'inactive'
  views: Number,
  deliveryOptions: [String]
}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify MongoDB service is accessible

2. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Kill existing processes using the port

3. **CORS Issues**
   - Ensure `CLIENT_URL` in `.env` matches frontend URL
   - Check if frontend is running on correct port

4. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token format in requests
   - Ensure user is properly authenticated

### Testing the Connection

1. Visit `http://localhost:5000/api/health` in browser
2. Should return: `{"success": true, "message": "SellNext API is running!"}`
3. Use the Test Connection component in the frontend

## Development Tips

- Use `npm run dev` for backend development with auto-restart
- Check server logs for detailed error messages
- Use MongoDB Compass for database visualization
- Test API endpoints with Postman or similar tools

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT_SECRET
3. Configure proper MongoDB connection string
4. Set up proper CORS origins
5. Use environment variables for sensitive data



