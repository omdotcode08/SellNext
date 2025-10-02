import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Buy from './pages/Buy'
import Sell from './pages/Sell'
import Item from './pages/Item'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import OwnerProfile from './pages/OwnerProfile'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { CartProvider } from './contexts/CartContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { MessagingProvider } from './contexts/MessagingContext'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MessagingProvider>
          <CartProvider>
            <FavoritesProvider>
              <Router>
          <div className="min-h-screen bg-gray-50 font-inter">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/buy" element={<Buy />} />
                <Route path="/sell" element={<Sell />} />
                <Route path="/item/:id" element={<Item />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/owner/:ownerId" element={<OwnerProfile />} />
              </Routes>
            </main>
            <Footer />
          </div>
              </Router>
            </FavoritesProvider>
          </CartProvider>
        </MessagingProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
