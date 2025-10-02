const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Mock auth routes for testing
app.post('/api/auth/signup', (req, res) => {
  res.json({
    success: true,
    message: 'User created successfully',
    token: 'mock-jwt-token',
    user: {
      id: '1',
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      location: req.body.location,
      userType: req.body.userType
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful',
    token: 'mock-jwt-token',
    user: {
      id: '1',
      fullName: 'Test User',
      email: req.body.email,
      phone: '1234567890',
      location: 'Mumbai',
      userType: ['buyer']
    }
  });
});

// Mock products route
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    products: [
      {
        _id: '1',
        title: 'iPhone 13 Pro',
        description: 'Excellent condition iPhone 13 Pro',
        price: 65000,
        originalPrice: 119900,
        category: 'Electronics',
        condition: 'Excellent',
        images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'],
        seller: {
          fullName: 'John Doe',
          rating: 4.8
        },
        location: 'Mumbai',
        views: 156,
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/products', (req, res) => {
  res.json({
    success: true,
    message: 'Product created successfully',
    product: {
      _id: Date.now().toString(),
      ...req.body,
      seller: {
        fullName: 'Test User'
      },
      views: 0,
      createdAt: new Date().toISOString()
    }
  });
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`✅ Simple server running on http://localhost:${PORT}`);
  console.log(`✅ Test health: http://localhost:${PORT}/api/health`);
});