import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import Products from './pages/Products'
import HomePage from './pages/HomePage'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import ProductDetails from './pages/ProductDetails'
import CategoryPage from './pages/CategoryPage'
import AddAddress from './pages/AddAddress'
import Wishlist from './pages/Wishlist'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOrders from './pages/admin/AdminOrders'
import ProtectedRoute from './auth/ProtectedRoute'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from "react"
import api from "./api/axiosInstance"
import { Toaster } from "react-hot-toast"
import Footer from "./components/Footer"

function App() {

  const location = useLocation()

  const hideNavbarRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname)

  const [cartCount, setCartCount] = useState(0)
  const [cartQuantities, setCartQuantities] = useState({})
  const [wishlistIds, setWishlistIds] = useState(new Set())

  const refreshCartCount = async () => {
    if (localStorage.getItem("role") !== "USER") {
      setCartCount(0)
      setCartQuantities({})
      return
    }

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

  const refreshWishlistIds = async () => {
    if (localStorage.getItem("role") !== "USER") {
      setWishlistIds(new Set())
      return
    }

    try {
      const response = await api.get("/wishlist/ids")
      const ids = Array.isArray(response.data) ? response.data : []
      setWishlistIds(new Set(ids))
    } catch (error) {
      console.log("Failed to refresh wishlist ids", error)
      setWishlistIds(new Set())
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshCartCount()
    refreshWishlistIds()
  }, [])

  useEffect(() => {
    const handleAuthChanged = () => {
      refreshCartCount()
      refreshWishlistIds()
    }

    window.addEventListener("auth-changed", handleAuthChanged)
    return () => window.removeEventListener("auth-changed", handleAuthChanged)
  }, [])

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {!shouldHideNavbar && <Navbar cartCount={cartCount} wishlistCount={wishlistIds.size} />}
      <Toaster position="top-right" />

      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/"
          element={
            <HomePage
              refreshCartCount={refreshCartCount}
              cartQuantities={cartQuantities}
              wishlistIds={wishlistIds}
              refreshWishlistIds={refreshWishlistIds}
            />
          }
        />
        <Route
          path="/category/:id"
          element={
            <CategoryPage
              refreshCartCount={refreshCartCount}
              cartQuantities={cartQuantities}
              wishlistIds={wishlistIds}
              refreshWishlistIds={refreshWishlistIds}
            />
          }
        />

        <Route
          path="/products"
          element={
            <Products
              refreshCartCount={refreshCartCount}
              cartQuantities={cartQuantities}
              wishlistIds={wishlistIds}
              refreshWishlistIds={refreshWishlistIds}
            />
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProductDetails
              refreshCartCount={refreshCartCount}
              wishlistIds={wishlistIds}
              refreshWishlistIds={refreshWishlistIds}
            />
          }
        />

        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist
              refreshCartCount={refreshCartCount}
              refreshWishlistIds={refreshWishlistIds}
            />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart refreshCartCount={refreshCartCount} />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders refreshCartCount={refreshCartCount} />
          </ProtectedRoute>
        } />

        <Route path="/orders/:orderId" element={
          <ProtectedRoute>
            <OrderDetails refreshCartCount={refreshCartCount} />
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

        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/products" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminProducts />
          </ProtectedRoute>
        } />

        <Route path="/admin/categories" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminCategories />
          </ProtectedRoute>
        } />

        <Route path="/admin/orders" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminOrders />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />

      </Routes>
      {!shouldHideNavbar && <Footer />}
    </div>
  )
}

export default App
