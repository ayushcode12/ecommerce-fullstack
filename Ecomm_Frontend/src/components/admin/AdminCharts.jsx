import { useEffect, useMemo, useState } from "react"
import { CircleDot, TrendingUp } from "lucide-react"
import { formatCurrency } from "../../utils/orderTracking"

const polarToCartesian = (cx, cy, radius, angleDeg) => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad)
  }
}

const describeDonutArc = (cx, cy, innerRadius, outerRadius, startAngle, endAngle) => {
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle)
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle)
  const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle)
  const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEnd.x} ${innerEnd.y}`,
    "Z"
  ].join(" ")
}

const formatShortDate = (createdAt) => {
  if (!createdAt) return "-"
  const parsed = new Date(createdAt)
  if (Number.isNaN(parsed.getTime())) return "-"
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short"
  }).format(parsed)
}

export const OrderStatusDonutChart = ({ data = [] }) => {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0)
  const defaultActive = data.find((item) => item.value > 0)?.key || data[0]?.key || null
  const [activeKey, setActiveKey] = useState(defaultActive)

  const chartSegments = useMemo(() => {
    if (!data.length || total <= 0) return []

    let start = -90
    return data.map((item, index) => {
      const ratio = Number(item.value || 0) / total
      const sweep = index === data.length - 1 ? 360 - (start + 90) : Math.max(0, ratio * 360)
      const end = start + sweep
      const segment = {
        ...item,
        startAngle: start,
        endAngle: end,
        ratio
      }
      start = end
      return segment
    })
  }, [data, total])

  const activeSegment =
    chartSegments.find((segment) => segment.key === activeKey) || chartSegments[0] || data[0] || null

  useEffect(() => {
    if (!activeSegment && defaultActive) {
      setActiveKey(defaultActive)
    }
  }, [activeSegment, defaultActive])

  return (
    <section className="surface-card rounded-2xl p-4 sm:p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold text-slate-900">Order Status Mix</h3>
          <p className="mt-1 text-sm text-slate-600">Hover or tap a segment to inspect distribution.</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
          <CircleDot size={12} />
          Interactive
        </span>
      </div>

      {total <= 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 p-8 text-center text-sm text-slate-600">
          No order data available yet.
        </div>
      ) : (
        <div className="grid items-center gap-5 md:grid-cols-[260px_1fr]">
          <div className="mx-auto w-full max-w-[240px]">
            <svg viewBox="0 0 240 240" className="h-full w-full">
              {chartSegments.map((segment) => {
                const isActive = segment.key === activeSegment?.key
                const path = describeDonutArc(
                  120,
                  120,
                  isActive ? 62 : 68,
                  isActive ? 104 : 98,
                  segment.startAngle,
                  segment.endAngle
                )

                return (
                  <path
                    key={segment.key}
                    d={path}
                    fill={segment.color}
                    opacity={isActive ? 1 : 0.75}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setActiveKey(segment.key)}
                    onFocus={() => setActiveKey(segment.key)}
                  />
                )
              })}

              <circle cx="120" cy="120" r="52" fill="#ffffff" />
              <text x="120" y="109" textAnchor="middle" className="fill-slate-500 text-[10px] font-semibold uppercase tracking-[0.14em]">
                Total Orders
              </text>
              <text x="120" y="131" textAnchor="middle" className="fill-slate-900 text-[24px] font-bold">
                {total}
              </text>
            </svg>
          </div>

          <div className="space-y-2.5">
            {chartSegments.map((segment) => {
              const isActive = segment.key === activeSegment?.key
              const percent = Math.round(segment.ratio * 100)

              return (
                <button
                  key={segment.key}
                  onMouseEnter={() => setActiveKey(segment.key)}
                  onFocus={() => setActiveKey(segment.key)}
                  onClick={() => setActiveKey(segment.key)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                    isActive
                      ? "border-slate-300 bg-white shadow-sm"
                      : "border-[var(--border)] bg-slate-50 hover:bg-white"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span className="text-sm font-semibold text-slate-800">{segment.label}</span>
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {segment.value} ({percent}%)
                  </span>
                </button>
              )
            })}

            {activeSegment && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
                <p className="font-semibold">{activeSegment.label}</p>
                <p className="text-xs">
                  {activeSegment.value} orders ({Math.round(activeSegment.ratio * 100)}% of total)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export const RecentOrdersTrendChart = ({ orders = [] }) => {
  const [metric, setMetric] = useState("amount")
  const [activeIndex, setActiveIndex] = useState(null)

  const chartData = useMemo(() => {
    return [...orders]
      .sort((left, right) => new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime())
      .map((order) => ({
        label: formatShortDate(order.createdAt),
        amount: Number(order.totalAmount || 0),
        items: (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        orderId: order.orderId
      }))
  }, [orders])

  const maxValue = Math.max(1, ...chartData.map((item) => Number(item[metric] || 0)))
  const width = 560
  const height = 240
  const paddingX = 36
  const paddingTop = 24
  const paddingBottom = 36
  const chartHeight = height - paddingTop - paddingBottom
  const chartWidth = width - paddingX * 2
  const stepX = chartData.length > 1 ? chartWidth / (chartData.length - 1) : 0
  const activePoint = activeIndex !== null ? chartData[activeIndex] : null

  const points = chartData.map((item, index) => {
    const x = paddingX + index * stepX
    const y = paddingTop + (1 - Number(item[metric] || 0) / maxValue) * chartHeight
    return { ...item, x, y, index }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : ""

  const metricLabel = metric === "amount" ? "Order Value" : "Items per Order"

  return (
    <section className="surface-card rounded-2xl p-4 sm:p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold text-slate-900">Recent Orders Trend</h3>
          <p className="mt-1 text-sm text-slate-600">Switch metrics and hover points to inspect exact values.</p>
        </div>
        <div className="inline-flex rounded-xl border border-[var(--border)] bg-slate-50 p-1">
          <button
            onClick={() => setMetric("amount")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
              metric === "amount" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600"
            }`}
          >
            Value
          </button>
          <button
            onClick={() => setMetric("items")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
              metric === "items" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600"
            }`}
          >
            Items
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 p-8 text-center text-sm text-slate-600">
          No recent orders to plot.
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[var(--border)] bg-white p-3">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full">
              <defs>
                <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.03" />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3].map((step) => {
                const y = paddingTop + (chartHeight * step) / 3
                return (
                  <line
                    key={step}
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                )
              })}

              {areaPath && <path d={areaPath} fill="url(#trendAreaGradient)" />}
              {linePath && <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />}

              {points.map((point) => {
                const isActive = point.index === activeIndex
                return (
                  <g key={point.orderId}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? 6 : 4}
                      fill={isActive ? "#4338ca" : "#4f46e5"}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setActiveIndex(point.index)}
                      onFocus={() => setActiveIndex(point.index)}
                    />
                    <text
                      x={point.x}
                      y={height - 12}
                      textAnchor="middle"
                      className="fill-slate-500 text-[10px] font-semibold"
                    >
                      {point.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
              <p className="inline-flex items-center gap-2 font-semibold">
                <TrendingUp size={14} />
                {metricLabel}
              </p>
              <p className="mt-1 text-xs">
                Peak: {metric === "amount" ? formatCurrency(maxValue) : `${maxValue} items`}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {activePoint ? (
                <>
                  <p className="font-semibold">Order #{activePoint.orderId}</p>
                  <p className="text-xs">
                    {activePoint.label} -{" "}
                    {metric === "amount" ? formatCurrency(activePoint.amount) : `${activePoint.items} items`}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold">Hover a point</p>
                  <p className="text-xs">View exact value for each recent order.</p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
