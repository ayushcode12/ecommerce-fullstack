import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Boxes,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ShoppingCart,
  Truck,
  UserCircle2,
  XCircle
} from "lucide-react"
import api from "../../api/axiosInstance"
import AdminShell from "../../components/admin/AdminShell"
import { OrderStatusDonutChart, RecentOrdersTrendChart } from "../../components/admin/AdminCharts"
import getApiErrorMessage from "../../utils/getApiErrorMessage"
import { formatCurrency, formatOrderDate, getStatusMeta } from "../../utils/orderTracking"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    document.title = "Admin Dashboard | Urban Threads"
  }, [])

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setErrorMessage("")
        const response = await api.get("/admin/dashboard")
        setDashboard(response.data)
      } catch (error) {
        console.log("Failed to load admin dashboard:", error.response?.data || error.message)
        setErrorMessage(getApiErrorMessage(error, "Failed to load dashboard."))
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const stats = dashboard
    ? [
        { label: "Users", value: dashboard.totalUsers, icon: UserCircle2 },
        { label: "Products", value: dashboard.totalProducts, icon: Boxes },
        { label: "Orders", value: dashboard.totalOrders, icon: ShoppingCart },
        { label: "Revenue", value: formatCurrency(dashboard.totalRevenue), icon: CircleDollarSign }
      ]
    : []

  const statusChartData = dashboard
    ? [
        { key: "PENDING", label: "Pending", value: Number(dashboard.pendingOrders || 0), color: "#f59e0b" },
        { key: "CONFIRMED", label: "Confirmed", value: Number(dashboard.confirmedOrders || 0), color: "#0ea5e9" },
        { key: "SHIPPED", label: "Shipped", value: Number(dashboard.shippedOrders || 0), color: "#6366f1" },
        { key: "DELIVERED", label: "Delivered", value: Number(dashboard.deliveredOrders || 0), color: "#10b981" },
        { key: "CANCELED", label: "Canceled", value: Number(dashboard.canceledOrders || 0), color: "#ef4444" }
      ]
    : []

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Track business health, order pipeline, and recent activities from one place."
    >
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="surface-card animate-pulse rounded-2xl p-5">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="mt-4 h-8 w-28 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        <div className="surface-card rounded-2xl p-8 text-center text-rose-700">{errorMessage}</div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="surface-card rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{stat.label}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-display text-3xl font-bold text-slate-900">{stat.value}</p>
                  <div className="rounded-xl bg-rose-50 p-2 text-rose-700">
                    <stat.icon size={18} />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="surface-card rounded-2xl p-5">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                <Clock3 size={13} />
                Pending
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900">{dashboard.pendingOrders}</p>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">
                <PackageCheck size={13} />
                Confirmed
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900">{dashboard.confirmedOrders}</p>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">
                <Truck size={13} />
                Shipped
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900">{dashboard.shippedOrders}</p>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">
                <PackageCheck size={13} />
                Delivered
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900">{dashboard.deliveredOrders}</p>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-rose-700">
                <XCircle size={13} />
                Canceled
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900">{dashboard.canceledOrders}</p>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <OrderStatusDonutChart data={statusChartData} />
            <RecentOrdersTrendChart orders={dashboard.recentOrders || []} />
          </section>

          <section className="surface-card rounded-2xl p-4 sm:p-5 md:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900">Recent Orders</h2>
                <p className="mt-1 text-sm text-slate-600">Latest 5 orders across all customers.</p>
              </div>
              <button
                onClick={() => navigate("/admin/orders")}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700 sm:w-auto"
              >
                Manage orders
              </button>
            </div>

            {dashboard.recentOrders?.length ? (
              <div className="space-y-2">
                {dashboard.recentOrders.map((order) => {
                  const statusMeta = getStatusMeta(order.status)
                  return (
                    <button
                      key={order.orderId}
                      onClick={() => navigate(`/admin/orders?focus=${order.orderId}`)}
                      className="flex w-full flex-col gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-left transition hover:border-rose-200 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">Order #{order.orderId}</p>
                        <p className="text-xs text-slate-600">
                          {order.userName || "Unknown"} - {order.userEmail || "No email"}
                        </p>
                        <p className="text-xs text-slate-500">Placed: {formatOrderDate(order.createdAt)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusMeta.badgeClass}`}
                        >
                          {statusMeta.label}
                        </span>
                        <p className="font-semibold text-rose-700">{formatCurrency(order.totalAmount)}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 p-6 text-center text-sm text-slate-600">
                No recent orders yet.
              </div>
            )}
          </section>
        </>
      )}
    </AdminShell>
  )
}

export default AdminDashboard


