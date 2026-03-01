import { useEffect, useState } from "react"; 
import api from "../api/axiosInstance"
import { useParams } from "react-router-dom";

const OrderDetails = () => {

  const { orderId } = useParams()
  const [orderDetails, setOrderDetails] = useState(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`)
      
        setOrderDetails(response.data)
      } catch (error) {
        console.log("Failed to fetch order details:", error.response?.data || error.message)
      }
    }
    fetchOrderDetails()
  }, [orderId])

  if (!orderDetails) {
    return <p>Loading order details...</p>
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
      <p><strong>Status:</strong> {orderDetails.status}</p>
      <p><strong>Total Amount:</strong> ₹{orderDetails.totalAmount}</p>
      
      <h3>Items:</h3>
      {orderDetails.items.map(item => (
        <div key={item.productId} style={{ marginBottom: "10px" }}>
          <p><strong>{item.productName}</strong></p>
          <p>Qty: {item.quantity}</p>
          <p>Price: ₹{item.priceAtPurchase}</p>
          <p>Subtotal: ₹{item.totalPrice}</p>
        </div>
      ))}
    </div>
  )
}

export default OrderDetails