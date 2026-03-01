import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

const Orders = () => {
  const [orders, setOrders] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders")
        setOrders(response.data)
      } catch (error) {
        console.log("Failed to fetch orders:", error.response?.data || error.message)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map(order => (
          <div 
            key={order.orderId} 
            onClick={() => navigate(`/orders/${order.orderId}`)}
            style={{ 
              marginBottom: "20px",
              cursor: "pointer"
            }}
          >
            <h3>Order ID: {order.orderId}</h3>
            <p>Status: {order.status}</p>
            <p>Total Amount: ₹{order.totalAmount}</p>
            
            <h4>Items:</h4>
            {order.items.map(item => (
              <div key={item.productId} style={{ marginBottom: "8px" }}>
                <p>{item.productName}</p>
                <p>Qty: {item.quantity} × ₹{item.priceAtPurchase}</p>
                <p>Subtotal: ₹{item.totalPrice}</p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>  
  )
}

export default Orders