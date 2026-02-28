import{ useEffect, useState } from 'react'
import axios from 'axios'

const Cart = () => {

  const [cartItems, setCartItems] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
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
    fetchCartItems()
  }, [])

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
              <p>Quantity: {item.quantity}</p>
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