import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../api/axiosInstance"

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200">
        <p className="text-slate-600 text-lg">Loading order details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200 py-16 px-6">

      <div className="max-w-[1000px] mx-auto space-y-12">

        {/* PAGE TITLE */}
        <h1 className="text-4xl font-bold text-slate-800 text-center">
          Order Details
        </h1>

        {/* ORDER SUMMARY CARD */}
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 text-center space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-700">
              Order #{orderDetails.orderId}
            </h2>

            <span className="inline-block mt-3 px-4 py-1 text-sm font-medium rounded-full bg-emerald-100 text-emerald-600">
              {orderDetails.status}
            </span>
          </div>

          <div>
            <p className="text-slate-500">Total Amount</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              ₹{orderDetails.totalAmount}
            </p>
          </div>
        </div>

        {/* ITEMS SECTION */}
        <div className="space-y-6">
          {orderDetails.items.map((item) => (
            <div
              key={item.productId}
              className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {item.productName}
                </h3>

                <p className="text-slate-600 mt-1">
                  ₹{item.priceAtPurchase} × {item.quantity}
                </p>
              </div>

              <div className="text-lg font-bold text-emerald-600">
                ₹{item.totalPrice}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default OrderDetails