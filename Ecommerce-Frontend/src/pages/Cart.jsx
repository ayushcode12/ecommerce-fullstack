import{ useEffect, useState } from 'react'
import axios from 'axios'

const Cart = () => {

  const [cartItems, setCartItems] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)

  const fetchCartItems = async () => {
    try{
      const token = localStorage.getItem("token")
      const response = await axios.get(
        "http://localhost:8080/cart",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

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
      const token = localStorage.getItem("token")
      await axios.put(
        `http://localhost:8080/cart/update?productId=${productId}&quantity=${newQuantity}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      await fetchCartItems()
    } catch (error) {
      console.log("Failed to update cart item quantity:", error.response?.data || error.message)
      alert("Failed to update cart item quantity. Please try again.")
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
        </>
      )}
    </div>
  )
}

export default Cart