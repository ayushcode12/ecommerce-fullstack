import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import HomePage from './pages/HomePage'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import ProductDetails from './pages/ProductDetails'
import CategoryPage from './pages/CategoryPage'
import AddAddress from './pages/AddAddress'
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
  const [cartQuantities, setCartQuantities] = useState({})

  const refreshCartCount = async () => {
    try {
      const response = await api.get("/cart")
      const cartItems = response.data.cartItems || []

      const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      )

      const quantityMap = cartItems.reduce((acc, item) => {
        acc[item.productId] = item.quantity
        return acc
      }, {})

      setCartCount(totalQuantity)
      setCartQuantities(quantityMap)
    } catch (error) {
      console.log("Failed to refresh cart count", error)
      setCartCount(0)
      setCartQuantities({})
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshCartCount()
  }, [])

  useEffect(() => {
    const handleAuthChanged = () => {
      refreshCartCount()
    }

    window.addEventListener("auth-changed", handleAuthChanged)
    return () => window.removeEventListener("auth-changed", handleAuthChanged)
  }, [])

  return (
    <div>
      {!shouldHideNavbar && <Navbar cartCount={cartCount} />}
      <Toaster position="top-right" />

      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <HomePage
              refreshCartCount={refreshCartCount}
              cartQuantities={cartQuantities}
            />
          }
        />
        <Route
          path="/category/:id"
          element={
            <CategoryPage
              refreshCartCount={refreshCartCount}
              cartQuantities={cartQuantities}
            />
          }
        />

        <Route
          path="/products"
          element={
            <Products
              refreshCartCount={refreshCartCount}
              cartQuantities={cartQuantities}
            />
          }
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

        <Route path="/addresses/new" element={
          <ProtectedRoute>
            <AddAddress />
          </ProtectedRoute>
        } />

        <Route path="/addresses/:addressId/edit" element={
          <ProtectedRoute>
            <AddAddress />
          </ProtectedRoute>
        } />

      </Routes>
      {!shouldHideNavbar && <Footer />}
    </div>
  )
}

export default App
