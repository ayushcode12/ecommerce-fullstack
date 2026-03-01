 
import{ useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'
import toast from "react-hot-toast"

const Cart = ({refreshCartCount}) => {

  const [cartItems, setCartItems] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const navigate = useNavigate()

  const fetchCartItems = async () => {
    try{
      const response = await api.get("/cart")
      console.log("Cart items fetched successfully:", response.data)

      setCartItems(response.data.cartItems)
      setTotalAmount(response.data.totalCartAmount)
    }catch(error){
      console.log("Failed to fetch cart items:", error.response?.data || error.message)
    } 
  }

  useEffect(() => {
    fetchCartItems()
  }, [])

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await api.put(`cart/update?productId=${productId}&quantity=${newQuantity}`)
      await fetchCartItems()
      await refreshCartCount()
    } catch (error) {
      console.log("Failed to update cart item quantity:", error.response?.data || error.message)
      toast.error("Failed to update cart item quantity. Please try again.")
    }
  }

  const handleCheckout = async () => {
    try {
      await api.post("/orders/checkout")
      toast.success("Checkout successful!")
      await refreshCartCount()
      navigate("/orders")
    } catch (error) {
      console.log("Failed to checkout:", error.response?.data || error.message)
      toast.error("Failed to checkout. Please try again.")
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.productId} style={{ marginBottom: "10px"}}>
              <p><strong>{item.productName}</strong></p>
              <p>Price: ₹{item.price}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                <span style={{ margin: "0 10px" }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
              </div>
              <p>Subtotal: ₹{item.price * item.quantity}</p>
            </div>
          ))}

          <h3>Total Amount: ₹{totalAmount}</h3>

          <button 
            disabled={checkoutLoading}
            onClick={handleCheckout} 
            style={{ 
              padding: "10px", 
              backgroundColor: checkoutLoading ? "#95a5a6" : "#1abc9c", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer" 
            }}
          >
            {checkoutLoading ? "Processing..." : "Checkout"}
          </button>
        </>
      )}
    </div>
  )
}

export default Cart