import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axiosInstance"

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
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200 py-16 px-6">

      <div className="max-w-[1200px] mx-auto space-y-12">

        <h1 className="text-4xl font-bold text-slate-800 text-center">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl shadow-xl text-center">
            <p className="text-slate-600 text-lg">
              You haven’t placed any orders yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order.orderId}
                onClick={() => navigate(`/orders/${order.orderId}`)}
                className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 cursor-pointer transition hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                  {/* Order Info */}
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      Order #{order.orderId}
                    </h2>

                    <span className="inline-block mt-2 px-4 py-1 text-sm font-medium rounded-full bg-emerald-100 text-emerald-600">
                      {order.status}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="text-2xl font-bold text-emerald-600">
                    ₹{order.totalAmount}
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-6 border-t border-slate-200 pt-6 space-y-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.productId} className="text-slate-600 text-sm">
                      {item.productName} — {item.quantity} × ₹{item.priceAtPurchase}
                    </div>
                  ))}

                  {order.items.length > 3 && (
                    <p className="text-slate-400 text-sm">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders