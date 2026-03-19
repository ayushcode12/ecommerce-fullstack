import { useNavigate } from "react-router-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import { Sparkles, Truck, ShieldCheck, BadgeCheck, ArrowRight } from "lucide-react"
import api from "../api/axiosInstance"
import ProductCard from "../components/ProductCard"

const normalizeCategoryName = (value = "") => value.toLowerCase().replace(/[^a-z0-9]/g, "")

const getCategoryDetail = (name = "") => {
  const normalized = normalizeCategoryName(name)

  if (normalized.includes("tshirt") || normalized.includes("tee")) {
    return "Oversized, essentials, and graphic styles for daily wear."
  }

  if (normalized.includes("shirt")) {
    return "Casual and formal pieces for office, events, and weekends."
  }

  if (normalized.includes("jean") || normalized.includes("denim")) {
    return "Slim, straight, and relaxed denim fits in versatile washes."
  }

  if (normalized.includes("pant") || normalized.includes("trouser")) {
    return "Comfort-first trousers tailored for modern everyday looks."
  }

  if (normalized.includes("cargo")) {
    return "Utility-inspired fits with pockets and effortless styling."
  }

  if (normalized.includes("new") || normalized.includes("arrival")) {
    return "Fresh drops updated regularly to keep your wardrobe current."
  }

  return "Discover curated pieces designed for your everyday wardrobe."
}

const HomePage = ({ refreshCartCount, cartQuantities, wishlistIds, refreshWishlistIds }) => {
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const categoriesSectionRef = useRef(null)

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await api.get("/categories")
        setCategories(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.log("Failed to fetch categories", error.response?.data || error.message)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const sortedCategories = useMemo(
    () =>
      [...categories]
        .filter(
          (category) =>
            category?.id && category?.name && Number(category.productCount || 0) > 0
        )
        .sort(
          (a, b) =>
            Number(b.productCount || 0) - Number(a.productCount || 0) ||
            a.name.localeCompare(b.name)
        ),
    [categories]
  )

  const quickCategories = sortedCategories.slice(0, 5)

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-[1500px] space-y-8 px-3 py-5 sm:space-y-10 sm:px-4 sm:py-6 md:space-y-12 md:px-6 md:py-10 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-800 p-4 text-white shadow-[0_26px_70px_rgba(15,23,42,0.4)] sm:rounded-[2rem] sm:p-7 md:p-10 lg:p-12">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
                <Sparkles size={14} />
                New Season Drop
              </p>

              <h1 className="font-display text-2xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Build standout looks with premium everyday fashion
              </h1>

              <p className="mt-4 max-w-2xl text-sm text-slate-200 sm:text-base md:text-lg">
                Discover t-shirts, shirts, jeans, cargos, and essentials curated for
                comfort, trend, and confidence.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {quickCategories.length > 0 &&
                  quickCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => navigate(`/products?categoryId=${category.id}`)}
                      className="rounded-full border border-white/35 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/95 transition hover:bg-white/20"
                    >
                      {category.name}
                    </button>
                  ))}
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-3">
                <button onClick={() => navigate("/products")} className="btn-primary w-full sm:w-auto">
                  Explore Catalog
                </button>
                <button
                  onClick={() => {
                    if (categoriesSectionRef.current) {
                      categoriesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
                      return
                    }

                    navigate("/products")
                  }}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Explore Categories
                </button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-md">
                <img
                  src="/hero-fashion.svg"
                  alt="Fashion apparel collection"
                  className="h-[420px] w-full rounded-2xl bg-slate-900/20 p-2 object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {[
            { icon: Truck, title: "Fast Delivery", desc: "Quick dispatch and reliable tracking for every order." },
            { icon: ShieldCheck, title: "Quality Checked", desc: "Fabric, fit, and finish reviewed before shipping." },
            { icon: BadgeCheck, title: "Trusted Shopping", desc: "Secure checkout and responsive customer support." }
          ].map((item) => (
            <div key={item.title} className="surface-card rounded-2xl p-5">
              <item.icon size={20} className="text-rose-700" />
              <h3 className="mt-3 font-display text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </section>

        <section
          ref={categoriesSectionRef}
          className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white/90 p-4 shadow-xl sm:p-6 md:p-8"
        >
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
                Jump directly into your preferred clothing style.
              </p>
            </div>
            <div className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-rose-700 sm:px-4 sm:py-2 sm:text-xs">
              {sortedCategories.length} Collections
            </div>
          </div>

          {loadingCategories ? (
            <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="surface-card animate-pulse rounded-2xl p-6">
                  <div className="h-7 w-7 rounded-full bg-slate-200" />
                  <div className="mt-5 h-6 w-2/3 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-full rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : sortedCategories.length === 0 ? (
            <div className="surface-card rounded-2xl p-8 text-center text-sm text-slate-600">
              Categories are not available right now. Please add categories from admin panel first.
            </div>
          ) : (
            <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedCategories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => navigate(`/products?categoryId=${category.id}`)}
                  className="group rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-slate-50 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl sm:p-6"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                      {Number(category.productCount || 0)} items
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-slate-900 transition group-hover:text-rose-700 sm:text-2xl">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{getCategoryDetail(category.name)}</p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-rose-700">
                    Shop this category
                    <ArrowRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
                Featured Styles
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Top picks curated to help you style faster.
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
                  wishlistIds={wishlistIds}
                  refreshWishlistIds={refreshWishlistIds}
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
