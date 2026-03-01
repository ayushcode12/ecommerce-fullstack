/* eslint-disable react-hooks/set-state-in-effect */
import Navbar from './components/Navbar'
import Login from './pages/Login'
import HomePage from './pages/HomePage'
import Products from './pages/Products'
import ProtectedRoute from './auth/ProtectedRoute'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from "react"
import api from "./api/axiosInstance"
import { Toaster } from "react-hot-toast"

function App() {

  const [cartCount, setCartCount] = useState(0)

  const refreshCartCount = async () => {
    const token = localStorage.getItem("token")

    // If not logged in, reset cart count safely
    if (!token) {
      setCartCount(0)
      return
    }

    try {
      const response = await api.get("/cart")

      const totalQuantity = response.data.cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      )

      setCartCount(totalQuantity)
    } catch (error) {
      console.log("Failed to refresh cart count", error)
      setCartCount(0)
    }
  }

  useEffect(() => {
    refreshCartCount()
  }, [])

  return (
    <div>
      <Navbar cartCount={cartCount} />

      <Toaster position="top-right" />

      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path='/' element={<HomePage />} />

        <Route 
          path='/products' 
          element={
            <Products refreshCartCount={refreshCartCount} />
          } 
        />

        <Route path='/login' element={<Login />} />

        {/* PROTECTED ROUTES */}
        <Route
          path='/cart'
          element={
            <ProtectedRoute>
              <Cart refreshCartCount={refreshCartCount} />
            </ProtectedRoute>
          }
        />

        <Route
          path='/orders'
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />

      </Routes>
    </div>
  )
}

export default App