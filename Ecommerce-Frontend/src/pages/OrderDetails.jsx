import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  CreditCard,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
  XCircle
} from "lucide-react"
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

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const STEP_ICONS = {
  PENDING: PackageCheck,
  PLACED: PackageCheck,
  CONFIRMED: ShieldCheck,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELED: XCircle
}

const getStepClasses = (state) => {
  if (state === "done") {
    return {
      card: "border-teal-200 bg-teal-50",
      icon: "text-teal-700",
      title: "text-teal-800"
    }
  }

  if (state === "active") {
    return {
      card: "border-teal-300 bg-white ring-2 ring-teal-100",
      icon: "text-teal-700",
      title: "text-slate-900"
    }
  }

  if (state === "canceled") {
    return {
      card: "border-rose-200 bg-rose-50",
      icon: "text-rose-700",
      title: "text-rose-700"
    }
  }

  if (state === "blocked") {
    return {
      card: "border-slate-200 bg-slate-50",
      icon: "text-slate-400",
      title: "text-slate-400"
    }
  }

  return {
    card: "border-[var(--border)] bg-white",
    icon: "text-slate-500",
    title: "text-slate-600"
  }
}

const getStepCaption = (state) => {
  if (state === "done") return "Completed"
  if (state === "active") return "In Progress"
  if (state === "canceled") return "Stopped"
  if (state === "blocked") return "Unavailable"
  return "Pending"
}

const OrderDetails = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [orderDetails, setOrderDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    document.title = `Order #${orderId} | Home Chemicals`
  }, [orderId])

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoadingDetails(true)
        setErrorMessage("")
        const response = await api.get(`/orders/${orderId}`)
        setOrderDetails(response.data)
      } catch (error) {
        console.log("Failed to fetch order details:", error.response?.data || error.message)
        setErrorMessage(getApiErrorMessage(error, "Failed to fetch order details."))
      } finally {
        setLoadingDetails(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const timelineSteps = useMemo(
    () => getTimelineSteps(orderDetails?.status),
    [orderDetails?.status]
  )

  if (loadingDetails) {
    return (
      <div className="page-wrap">
        <div className="mx-auto w-full max-w-[1200px] space-y-4 px-4 py-6 md:px-6 md:py-10 lg:px-8">
          <div className="surface-card animate-pulse rounded-3xl p-6">
            <div className="h-6 w-56 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-72 rounded bg-slate-200" />
            <div className="mt-5 h-20 rounded bg-slate-200" />
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="surface-card animate-pulse rounded-2xl p-5">
              <div className="h-5 w-48 rounded bg-slate-200" />
              <div className="mt-4 h-28 rounded bg-slate-200" />
            </div>
            <div className="surface-card animate-pulse rounded-2xl p-5">
              <div className="h-5 w-40 rounded bg-slate-200" />
              <div className="mt-4 h-24 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (errorMessage || !orderDetails) {
    return (
      <div className="page-wrap">
        <div className="mx-auto w-full max-w-[1000px] space-y-5 px-4 py-6 md:px-6 md:py-10 lg:px-8">
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur hover:bg-white"
          >
            <ArrowLeft size={15} />
            Back to Orders
          </button>
          <div className="surface-card rounded-3xl p-8 text-center text-rose-700">
            {errorMessage || "Order not found."}
          </div>
        </div>
      </div>
    )
  }

  const statusMeta = getStatusMeta(orderDetails.status)
  const estimatedDelivery = getEstimatedDeliveryDate(orderDetails.createdAt, orderDetails.status)
  const itemCount = (orderDetails.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
  const progressPercent = getProgressPercent(orderDetails.status)
  const itemsSubtotal = (orderDetails.items || []).reduce((sum, item) => sum + toNumber(item.totalPrice), 0)

  const hasDetailedBreakdown =
    orderDetails.subTotalAmount !== null && orderDetails.subTotalAmount !== undefined &&
    orderDetails.shippingAmount !== null && orderDetails.shippingAmount !== undefined &&
    orderDetails.platformFeeAmount !== null && orderDetails.platformFeeAmount !== undefined &&
    orderDetails.taxAmount !== null && orderDetails.taxAmount !== undefined

  const subTotalAmount = hasDetailedBreakdown ? toNumber(orderDetails.subTotalAmount) : itemsSubtotal
  const shippingAmount = hasDetailedBreakdown ? toNumber(orderDetails.shippingAmount) : 0
  const platformFeeAmount = hasDetailedBreakdown ? toNumber(orderDetails.platformFeeAmount) : 0
  const taxAmount = hasDetailedBreakdown ? toNumber(orderDetails.taxAmount) : 0

  const totalPaidAmount =
    orderDetails.totalAmount !== null && orderDetails.totalAmount !== undefined
      ? toNumber(orderDetails.totalAmount)
      : subTotalAmount + shippingAmount + platformFeeAmount + taxAmount

  const shippingName = orderDetails.shippingFullName?.trim() || ""
  const shippingLabel = orderDetails.shippingLabel?.trim() || ""
  const shippingLine1 = orderDetails.shippingLine1?.trim() || ""
  const shippingLine2 = orderDetails.shippingLine2?.trim() || ""
  const shippingCity = orderDetails.shippingCity?.trim() || ""
  const shippingState = orderDetails.shippingState?.trim() || ""
  const shippingPostalCode = orderDetails.shippingPostalCode?.trim() || ""
  const shippingLandmark = orderDetails.shippingLandmark?.trim() || ""
  const shippingPhone = orderDetails.shippingPhone?.trim() || ""

  const cityState = [shippingCity, shippingState].filter(Boolean).join(", ")
  const cityStatePostal = [cityState, shippingPostalCode].filter(Boolean).join(" ")
  const hasAddressSnapshot = Boolean(
    shippingName || shippingLine1 || shippingLine2 || cityStatePostal || shippingPhone
  )

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-[1200px] space-y-5 px-3 py-5 sm:space-y-6 sm:px-4 sm:py-6 md:px-6 md:py-10 lg:px-8">
        <button
          onClick={() => navigate("/orders")}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur hover:bg-white"
        >
          <ArrowLeft size={15} />
          Back to Orders
        </button>

        <section className="relative overflow-hidden rounded-3xl border border-teal-300 bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-700 p-5 text-white shadow-2xl sm:p-6 md:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-14 bottom-0 h-36 w-36 rounded-full bg-amber-300/20 blur-2xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-100">Order Tracking</p>
              <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl md:text-4xl">Order #{orderDetails.orderId}</h1>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-teal-50">
                <CalendarClock size={15} />
                Placed on {formatOrderDate(orderDetails.createdAt)}
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="inline-flex rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                {statusMeta.label}
              </span>
              <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">{formatCurrency(totalPaidAmount)}</p>
            </div>
          </div>

          <div className="relative mt-5 grid gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-100">Items</p>
              <p className="mt-1 text-lg font-bold">{itemCount}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-100">Progress</p>
              <p className="mt-1 text-lg font-bold">{Math.round(progressPercent)}%</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-100">Expected</p>
              <p className="mt-1 text-lg font-bold">{estimatedDelivery || "Closed"}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <section className="surface-card rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold text-slate-900">Tracking Timeline</h2>
                <p className="text-sm font-semibold text-slate-500">Current Stage: {statusMeta.label}</p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-4 hidden gap-3 md:grid md:grid-cols-4">
                {timelineSteps.map((step) => {
                  const classes = getStepClasses(step.state)
                  const Icon = STEP_ICONS[step.key] || CircleDashed

                  return (
                    <div key={step.key} className={`rounded-xl border p-3 ${classes.card}`}>
                      <p className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] ${classes.icon}`}>
                        <Icon size={13} />
                        {step.label}
                      </p>
                      <p className={`mt-1 text-xs font-semibold ${classes.title}`}>{getStepCaption(step.state)}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 space-y-2 md:hidden">
                {timelineSteps.map((step) => {
                  const classes = getStepClasses(step.state)
                  const Icon = STEP_ICONS[step.key] || CircleDashed
                  return (
                    <div key={step.key} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${classes.card}`}>
                      <p className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] ${classes.icon}`}>
                        <Icon size={13} />
                        {step.label}
                      </p>
                      <span className={`text-[11px] font-semibold ${classes.title}`}>
                        {getStepCaption(step.state)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="surface-card rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold text-slate-900">Items ({itemCount})</h2>
                <p className="text-sm text-slate-500">
                  {orderDetails.items?.length || 0} product{(orderDetails.items?.length || 0) === 1 ? "" : "s"}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {(orderDetails.items || []).map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="rounded-xl border border-[var(--border)] bg-white p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{item.productName}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatCurrency(item.priceAtPurchase)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-display text-xl font-bold text-teal-700">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 sm:space-y-6">
            <section className="surface-card rounded-2xl p-5 md:p-6">
              <h2 className="font-display text-xl font-bold text-slate-900">Delivery Address</h2>

              <div className="mt-4 rounded-xl border border-[var(--border)] bg-white p-4 text-sm">
                {hasAddressSnapshot ? (
                  <>
                    <p className="inline-flex items-center gap-2 font-semibold text-slate-900">
                      <MapPin size={14} className="text-teal-700" />
                      {shippingName || "Saved Address"}
                      {shippingLabel && <span className="text-slate-500">({shippingLabel})</span>}
                    </p>
                    {shippingLine1 && <p className="mt-2 text-slate-700">{shippingLine1}</p>}
                    {shippingLine2 && <p className="mt-1 text-slate-700">{shippingLine2}</p>}
                    {cityStatePostal && <p className="mt-1 text-slate-700">{cityStatePostal}</p>}
                    {shippingLandmark && (
                      <p className="mt-1 text-slate-500">Landmark: {shippingLandmark}</p>
                    )}
                    {shippingPhone && (
                      <p className="mt-2 inline-flex items-center gap-2 text-slate-600">
                        <Phone size={13} className="text-teal-700" />
                        {shippingPhone}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-slate-600">
                    Address snapshot not available for this order.
                  </div>
                )}
              </div>
            </section>

            <section className="surface-card rounded-2xl p-5 md:p-6">
              <h2 className="font-display text-xl font-bold text-slate-900">Payment Summary</h2>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subTotalAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingAmount === 0
                      ? "Free"
                      : formatCurrency(shippingAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Platform Fee</span>
                  <span>{formatCurrency(platformFeeAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              </div>

              <div className="my-4 border-t border-[var(--border)]" />

              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">Total Paid</p>
                <p className="font-display text-2xl font-bold text-teal-700">
                  {formatCurrency(totalPaidAmount)}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                {!hasDetailedBreakdown && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-semibold text-amber-700">
                    Detailed fee split is not available for this older order.
                  </p>
                )}
                <p className="inline-flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 font-semibold text-teal-700">
                  <ShieldCheck size={13} />
                  Payment-ready summary aligned for gateway records
                </p>
                <p className="inline-flex items-center gap-2 text-slate-500">
                  <CheckCircle2 size={13} className="text-teal-700" />
                  Receipt ID: HC-{orderDetails.orderId}
                </p>
                <p className="inline-flex items-center gap-2 text-slate-500">
                  <CreditCard size={13} className="text-teal-700" />
                  Payment mode assignment can be plugged in next.
                </p>
                <p className="inline-flex items-center gap-2 text-slate-500">
                  <PackageCheck size={13} className="text-teal-700" />
                  Invoice generation can be attached from this breakdown.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
