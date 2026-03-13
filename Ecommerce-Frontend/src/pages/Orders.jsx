import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarClock, ChevronRight, PackageCheck, Truck } from "lucide-react"
import api from "../api/axiosInstance"
import getApiErrorMessage from "../utils/getApiErrorMessage"
import {
  formatCurrency,
  formatOrderDate,
  getEstimatedDeliveryDate,
  getProgressPercent,
  getStatusMeta,
  getTimelineSteps
} from "../utils/orderTracking"

const getStepClasses = (state) => {
  if (state === "done") {
    return {
      dot: "bg-rose-600 border-rose-600",
      text: "text-rose-700"
    }
  }

  if (state === "active") {
    return {
      dot: "bg-white border-rose-600 ring-4 ring-rose-100",
      text: "text-slate-900"
    }
  }

  if (state === "canceled") {
    return {
      dot: "bg-rose-600 border-rose-600",
      text: "text-rose-700"
    }
  }

  if (state === "blocked") {
    return {
      dot: "bg-slate-200 border-slate-200",
      text: "text-slate-400"
    }
  }

  return {
    dot: "bg-white border-slate-300",
    text: "text-slate-500"
  }
}

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "My Orders | Urban Threads"
  }, [])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true)
        setErrorMessage("")
        const response = await api.get("/orders")
        setOrders(response.data || [])
      } catch (error) {
        console.log("Failed to fetch orders:", error.response?.data || error.message)
        setErrorMessage(getApiErrorMessage(error, "Failed to load your orders."))
      } finally {
        setLoadingOrders(false)
      }
    }

    fetchOrders()
  }, [])

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
      ),
    [orders]
  )

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-[1200px] space-y-5 px-3 py-5 sm:space-y-6 sm:px-4 sm:py-6 md:px-6 md:py-10 lg:px-8">
        <div className="surface-card rounded-3xl p-5 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Order Tracking
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">My Orders</h1>
          <p className="mt-2 text-sm text-slate-600">
            Monitor live order status, shipping progress, and delivery timeline.
          </p>
        </div>

        {loadingOrders ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="surface-card animate-pulse rounded-2xl p-5">
                <div className="h-5 w-48 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-full rounded bg-slate-200" />
                <div className="mt-4 h-4 w-64 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : errorMessage ? (
          <div className="surface-card rounded-3xl p-10 text-center text-rose-700">{errorMessage}</div>
        ) : sortedOrders.length === 0 ? (
          <div className="surface-card rounded-3xl p-10 text-center text-slate-600">
            You have not placed any orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => {
              const statusMeta = getStatusMeta(order.status)
              const timelineSteps = getTimelineSteps(order.status)
              const progressPercent = getProgressPercent(order.status)
              const itemCount = (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
              const estimatedDelivery = getEstimatedDeliveryDate(order.createdAt, order.status)

              return (
                <button
                  key={order.orderId}
                  onClick={() => navigate(`/orders/${order.orderId}`)}
                className="surface-card w-full rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:shadow-xl sm:p-5"
              >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-900">Order #{order.orderId}</h2>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                        <CalendarClock size={13} />
                        Placed on {formatOrderDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                      <p className="mt-2 font-display text-2xl font-bold text-rose-700">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:gap-3">
                      {timelineSteps.map((step) => {
                        const classes = getStepClasses(step.state)
                        return (
                          <div key={step.key} className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full border ${classes.dot}`} />
                            <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${classes.text}`}>
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col items-start gap-2 border-t border-[var(--border)] pt-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                    <p className="inline-flex items-center gap-2 text-slate-600">
                      <PackageCheck size={15} className="text-rose-700" />
                      {itemCount} item{itemCount === 1 ? "" : "s"}
                    </p>

                    {estimatedDelivery ? (
                      <p className="inline-flex items-center gap-2 text-slate-600">
                        <Truck size={15} className="text-rose-700" />
                        ETA {estimatedDelivery}
                      </p>
                    ) : (
                      <p className="text-slate-500">Delivery timeline updated in order details</p>
                    )}

                    <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                      View details
                      <ChevronRight size={15} />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders


