import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Sparkles, Truck, ShieldCheck, BadgeCheck } from "lucide-react"
import api from "../api/axiosInstance"
import ProductCard from "../components/ProductCard"

const HomePage = ({ refreshCartCount, cartQuantities }) => {
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  useEffect(() => {
    document.title = "Urban Threads | Fashion for Every Day"
  }, [])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoadingFeatured(true)
        const response = await api.get(`/products?page=0&size=4&sortBy=id&direction=asc`)
        setFeaturedProducts(response.data.content || [])
      } catch (error) {
        console.log("Failed to fetch featured products", error)
      } finally {
        setLoadingFeatured(false)
      }
    }

    fetchFeatured()
  }, [])

  const categories = [
    {
      id: 1,
      name: "T-Shirts",
      detail: "Everyday basics, oversized fits, and graphic tees"
    },
    {
      id: 2,
      name: "Shirts",
      detail: "Casual, smart-casual, and formal shirt styles"
    },
    {
      id: 3,
      name: "Bottomwear",
      detail: "Jeans, pants, cargos, and everyday comfort fits"
    }
  ]

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-[1400px] space-y-8 px-3 py-5 sm:space-y-10 sm:px-4 sm:py-6 md:space-y-12 md:px-6 md:py-10 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-700 via-rose-600 to-amber-700 p-4 text-white shadow-2xl sm:rounded-[2rem] sm:p-7 md:p-10 lg:p-12">
          <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-amber-300/25 blur-3xl" />
          <div className="absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
                <Sparkles size={14} />
                New Season Drop
              </p>

              <h1 className="font-display text-2xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Trendy clothing for every style and every day
              </h1>

              <p className="mt-4 max-w-2xl text-sm text-rose-50 sm:text-base md:text-lg">
                Discover t-shirts, shirts, jeans, cargos, and more.
                Shop top fits with fast delivery and dependable support.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {["T-Shirts", "Shirts", "Jeans", "Pants", "Cargo"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/40 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/90"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-3">
                <button onClick={() => navigate("/products")} className="btn-primary w-full sm:w-auto">
                  Explore Collection
                </button>
                <button
                  onClick={() => navigate("/products?sortBy=price&direction=desc")}
                  className="w-full rounded-xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/20 sm:w-auto"
                >
                  Shop New Arrivals
                </button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-3 shadow-2xl backdrop-blur-md">
                <img
                  src="/hero-fashion.svg"
                  alt="Fashion apparel collection"
                  className="h-[320px] w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {[
            { icon: Truck, title: "Fast Delivery", desc: "Dispatch in 24 hours for major cities." },
            { icon: ShieldCheck, title: "Premium Fabrics", desc: "Comfortable, durable materials for all-day wear." },
            { icon: BadgeCheck, title: "Trusted by Shoppers", desc: "Growing community of repeat fashion customers." }
          ].map((item) => (
            <div key={item.title} className="surface-card rounded-2xl p-5">
              <item.icon size={20} className="text-rose-700" />
              <h3 className="mt-3 font-display text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white/90 p-4 shadow-xl sm:p-6 md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-rose-100/70 blur-3xl" />

          <div className="relative mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                Curated Collections
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 md:text-3xl">
                Shop by Category
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Jump directly into trending clothing categories.
              </p>
            </div>
            <div className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-rose-700 sm:px-4 sm:py-2 sm:text-xs">
              {categories.length} Collections
            </div>
          </div>

          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(`/category/${category.id}`)}
                className="group rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-slate-50 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl sm:p-6"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-white">
                    {category.id}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Collection
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-slate-900 transition group-hover:text-rose-700 sm:text-2xl">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{category.detail}</p>

                <div className="mt-6 text-sm font-semibold text-rose-700">
                  Explore category {"->"}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
                Featured Styles
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Popular picks curated for quick outfit upgrades.
              </p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700 sm:w-auto"
            >
              View all products
            </button>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="surface-card animate-pulse rounded-3xl p-4">
                  <div className="h-36 rounded-xl bg-slate-200" />
                  <div className="mt-4 h-4 w-24 rounded bg-slate-200" />
                  <div className="mt-2 h-5 w-2/3 rounded bg-slate-200" />
                  <div className="mt-2 h-4 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="surface-card rounded-3xl p-8 text-center text-slate-600">
              No featured styles available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  refreshCartCount={refreshCartCount}
                  cartQuantity={cartQuantities?.[product.id] || 0}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default HomePage

