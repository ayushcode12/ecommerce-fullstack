import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Banknote, CheckCircle2, CreditCard, Mail, Phone, RefreshCw, Search, User } from "lucide-react"
import toast from "react-hot-toast"
import api from "../../api/axiosInstance"
import AdminShell from "../../components/admin/AdminShell"
import getApiErrorMessage from "../../utils/getApiErrorMessage"
import { formatCurrency, formatOrderDate, getStatusMeta } from "../../utils/orderTracking"

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED"]

const AdminOrders = () => {
  const [searchParams] = useSearchParams()
  const focusOrderId = searchParams.get("focus")

  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [filters, setFilters] = useState({
    keyword: "",
    status: ""
  })
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    document.title = "Admin Orders | Urban Threads"
  }, [])

  const fetchOrders = async (targetPage = 0) => {
    try {
      setLoadingOrders(true)

      const response = await api.get("/admin/orders", {
        params: {
          page: targetPage,
          size: 10,
          sortBy: "createdAt",
          direction: "desc",
          keyword: filters.keyword.trim() || undefined,
          status: filters.status || undefined
        }
      })

      const content = response.data.content || []
      setOrders(content)
      setPage(targetPage)
      setTotalPages(response.data.totalPages || 0)
    } catch (error) {
      console.log("Failed to load admin orders:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to load orders"))
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    fetchOrders(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!focusOrderId || orders.length === 0) return

    const targetCard = document.getElementById(`admin-order-${focusOrderId}`)
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: "smooth", block: "center" })
      targetCard.classList.add("ring-2", "ring-rose-200")
      setTimeout(() => targetCard.classList.remove("ring-2", "ring-rose-200"), 1600)
    }
  }, [focusOrderId, orders])

  const onFilterSubmit = async (event) => {
    event.preventDefault()
    await fetchOrders(0)
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId)
      await api.put(`/admin/orders/${orderId}/status`, { status })
      toast.success(`Order #${orderId} updated to ${status}`)
      await fetchOrders(page)
    } catch (error) {
      console.log("Failed to update order status:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to update order status"))
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <AdminShell
      title="Order Management"
      subtitle="Monitor all incoming orders, customer details, and operational order status."
      actions={
        <button
          onClick={() => fetchOrders(page)}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-rose-200 hover:text-rose-700"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      }
    >
      <section className="surface-card rounded-2xl p-4 sm:p-5 md:p-6">
        <form onSubmit={onFilterSubmit} className="grid gap-3 sm:grid-cols-[1fr_200px_auto]">
          <label className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.keyword}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  keyword: event.target.value
                }))
              }
              placeholder="Search by customer email"
              className="field-input field-input-icon"
            />
          </label>

          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                status: event.target.value
              }))
            }
            className="field-input"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-primary px-4 py-2 text-sm">
            Apply
          </button>
        </form>
      </section>

      <section className="space-y-3">
        {loadingOrders ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="surface-card animate-pulse rounded-2xl p-4">
              <div className="h-4 w-52 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-80 rounded bg-slate-200" />
              <div className="mt-3 h-9 rounded bg-slate-200" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="surface-card rounded-2xl p-10 text-center text-slate-600">
            No orders found for current filters.
          </div>
        ) : (
          orders.map((order) => {
            const statusMeta = getStatusMeta(order.status)
            const address = [
              order.shippingLine1,
              order.shippingLine2,
              order.shippingCity,
              order.shippingState,
              order.shippingPostalCode
            ]
              .filter(Boolean)
              .join(", ")

            return (
              <article
                id={`admin-order-${order.orderId}`}
                key={order.orderId}
                className="surface-card rounded-2xl p-4 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900">Order #{order.orderId}</h3>
                    <p className="mt-1 text-xs text-slate-500">Placed {formatOrderDate(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                      {order.paymentMethod === "Cash on Delivery" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                          <Banknote size={10} />
                          COD
                        </span>
                      ) : order.paymentMethod === "Online (Razorpay)" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                          <CreditCard size={10} />
                          Paid Online
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 font-semibold text-rose-700">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                  <p className="inline-flex items-center gap-2 text-slate-700">
                    <User size={14} className="text-rose-700" />
                    {order.userName || "Unknown customer"}
                  </p>
                  <p className="inline-flex items-center gap-2 text-slate-700">
                    <Mail size={14} className="text-rose-700" />
                    {order.userEmail || "No email"}
                  </p>
                  <p className="inline-flex items-center gap-2 text-slate-700">
                    <Phone size={14} className="text-rose-700" />
                    {order.shippingPhone || "No phone"}
                  </p>
                  <p className="inline-flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={14} className="text-rose-700" />
                    {order.items?.length || 0} products
                  </p>
                </div>

                <p className="mt-2 text-sm text-slate-600">{address || "No shipping snapshot available."}</p>

                <div className="mt-3 flex flex-col items-start gap-3 border-t border-[var(--border)] pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        disabled={updatingOrderId === order.orderId || order.status === status}
                        onClick={() => updateOrderStatus(order.orderId, status)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                          order.status === status
                            ? "bg-rose-100 text-rose-700"
                            : "border border-[var(--border)] bg-white text-slate-700 hover:border-rose-200 hover:text-rose-700"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  {updatingOrderId === order.orderId && (
                    <p className="text-xs font-semibold text-slate-500">Updating status...</p>
                  )}
                </div>
              </article>
            )
          })
        )}
      </section>

      {totalPages > 1 && (
        <section className="flex items-center justify-end gap-2">
          <button
            disabled={page === 0}
            onClick={() => fetchOrders(page - 1)}
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs font-semibold text-slate-500">
            Page {page + 1} / {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => fetchOrders(page + 1)}
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </section>
      )}
    </AdminShell>
  )
}

export default AdminOrders


