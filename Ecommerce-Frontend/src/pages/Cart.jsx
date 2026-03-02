/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axiosInstance"
import toast from "react-hot-toast"

const Cart = ({ refreshCartCount }) => {

  const [cartItems, setCartItems] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const navigate = useNavigate()

  const fetchCartItems = async () => {
    try {
      const response = await api.get("/cart")
      setCartItems(response.data.cartItems)
      setTotalAmount(response.data.totalCartAmount)
    } catch (error) {
      console.log("Failed to fetch cart items:", error.response?.data || error.message)
    }
  }

  useEffect(() => {
    fetchCartItems()
  }, [])

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await api.put(`/cart/update?productId=${productId}&quantity=${newQuantity}`)
      await fetchCartItems()
      await refreshCartCount()
    } catch (error) {
      toast.error("Failed to update quantity")
    }
  }

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true)
      await api.post("/orders/checkout")
      toast.success("Checkout successful!")
      await refreshCartCount()
      navigate("/orders")
    } catch (error) {
      toast.error("Checkout failed")
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200 py-16 px-6">

      <div className="max-w-[1200px] mx-auto space-y-10">

        <h1 className="text-4xl font-bold text-slate-800 text-center">
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl shadow-xl text-center">
            <p className="text-slate-600 text-lg">
              Your cart is currently empty.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl transition shadow-md"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* CART ITEMS */}
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      {item.productName}
                    </h2>
                    <p className="text-slate-600 mt-1">
                      ₹{item.price} per unit
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-10 h-10 bg-slate-200 hover:bg-slate-300 rounded-lg text-lg font-bold"
                    >
                      -
                    </button>

                    <span className="text-lg font-semibold text-slate-800">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-10 h-10 bg-slate-200 hover:bg-slate-300 rounded-lg text-lg font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-lg font-bold text-emerald-600">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* TOTAL SECTION */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 text-center space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800">
                Total Amount
              </h2>

              <p className="text-3xl font-bold text-emerald-600">
                ₹{totalAmount}
              </p>

              <button
                disabled={checkoutLoading}
                onClick={handleCheckout}
                className={`px-12 py-4 rounded-xl text-white font-semibold transition shadow-md ${
                  checkoutLoading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg"
                }`}
              >
                {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cart