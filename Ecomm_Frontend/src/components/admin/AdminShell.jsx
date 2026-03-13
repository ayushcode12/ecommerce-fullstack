import { Link, NavLink } from "react-router-dom"
import { BarChart3, Boxes, ClipboardList, LayoutDashboard } from "lucide-react"

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList }
]

const AdminShell = ({ title, subtitle, actions = null, children }) => {
  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-[1600px] px-3 py-5 sm:px-4 sm:py-6 md:px-6 md:py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          <aside className="surface-card rounded-3xl p-4 lg:sticky lg:top-[96px] lg:h-fit lg:p-5">
            <Link
              to="/admin"
              className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
            >
              <BarChart3 size={15} />
              Admin Control
            </Link>

            <nav className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "border border-rose-200 bg-rose-50 text-rose-700"
                        : "border border-transparent text-slate-700 hover:border-[var(--border)] hover:bg-white"
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="space-y-6">
            <section className="surface-card rounded-3xl p-5 md:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                    Admin Panel
                  </p>
                  <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
                    {title}
                  </h1>
                  {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
              </div>
            </section>

            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminShell

