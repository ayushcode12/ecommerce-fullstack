const STATUS_SEQUENCE = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"]

const STATUS_META = {
  PENDING: {
    label: "Pending",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200"
  },
  CONFIRMED: {
    label: "Confirmed",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200"
  },
  SHIPPED: {
    label: "Shipped",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  DELIVERED: {
    label: "Delivered",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  CANCELED: {
    label: "Canceled",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200"
  }
}

const normalizeStatus = (status) => {
  const normalized = String(status || "").toUpperCase()
  return STATUS_META[normalized] ? normalized : "PENDING"
}

export const getStatusMeta = (status) => STATUS_META[normalizeStatus(status)]

export const getProgressPercent = (status) => {
  const normalized = normalizeStatus(status)
  if (normalized === "CANCELED") return 25

  const index = STATUS_SEQUENCE.indexOf(normalized)
  const safeIndex = index === -1 ? 0 : index
  return ((safeIndex + 1) / STATUS_SEQUENCE.length) * 100
}

export const getTimelineSteps = (status) => {
  const normalized = normalizeStatus(status)

  if (normalized === "CANCELED") {
    return [
      { key: "PLACED", label: "Order Placed", state: "done" },
      { key: "CANCELED", label: "Order Canceled", state: "canceled" },
      { key: "SHIPPED", label: "Shipped", state: "blocked" },
      { key: "DELIVERED", label: "Delivered", state: "blocked" }
    ]
  }

  const steps = [
    { key: "PENDING", label: "Order Placed" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "DELIVERED", label: "Delivered" }
  ]

  const activeIndex = STATUS_SEQUENCE.indexOf(normalized)

  return steps.map((step, index) => {
    if (index < activeIndex) return { ...step, state: "done" }
    if (index === activeIndex) return { ...step, state: "active" }
    return { ...step, state: "pending" }
  })
}

export const formatOrderDate = (createdAt) => {
  if (!createdAt) return "-"
  const parsed = new Date(createdAt)
  if (Number.isNaN(parsed.getTime())) return "-"

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed)
}

export const getEstimatedDeliveryDate = (createdAt, status) => {
  const normalized = normalizeStatus(status)
  if (!createdAt || normalized === "DELIVERED" || normalized === "CANCELED") {
    return null
  }

  const parsed = new Date(createdAt)
  if (Number.isNaN(parsed.getTime())) return null

  parsed.setDate(parsed.getDate() + 4)
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parsed)
}

export const formatCurrency = (value) => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount)
}
