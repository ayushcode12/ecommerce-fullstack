import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import HomePage from './pages/HomePage'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import ProductDetails from './pages/ProductDetails'
import ProtectedRoute from './auth/ProtectedRoute'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from "react"
import api from "./api/axiosInstance"
import { Toaster } from "react-hot-toast"
import Footer from "./components/Footer"

function App() {

  const location = useLocation()

  const hideNavbarRoutes = ["/login", "/register"]
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname)

  const [cartCount, setCartCount] = useState(0)

  const refreshCartCount = async () => {
    try {
      const response = await api.get("/cart")
      const totalQuantity = response.data.cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      )
      setCartCount(totalQuantity)
    } catch (error) {
      console.log("Failed to refresh cart count", error)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshCartCount()
  }, [])

  return (
    <div>
      {!shouldHideNavbar && <Navbar cartCount={cartCount} />}
      <Toaster position="top-right" />

      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<HomePage />} />

        <Route
          path="/products"
          element={<Products refreshCartCount={refreshCartCount} />}
        />

        <Route path="/product/:id" element={<ProductDetails refreshCartCount={refreshCartCount} />} />

        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart refreshCartCount={refreshCartCount} />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />

        <Route path="/orders/:orderId" element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        } />

      </Routes>
      {!shouldHideNavbar && <Footer />}
    </div>
  )
}

export default App