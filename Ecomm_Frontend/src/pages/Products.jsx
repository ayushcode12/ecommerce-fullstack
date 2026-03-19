import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import api from "../api/axiosInstance"
import { Search } from "lucide-react"

const ALLOWED_SORT_BY = new Set(["id", "price", "name"])
const ALLOWED_DIRECTION = new Set(["asc", "desc"])

const Products = ({ refreshCartCount, cartQuantities, wishlistIds, refreshWishlistIds }) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const initialKeyword = searchParams.get("keyword")?.trim() || ""
  const initialCategoryIdParam = searchParams.get("categoryId")
  const parsedCategoryId = initialCategoryIdParam ? Number(initialCategoryIdParam) : null
  const initialCategoryId =
    Number.isFinite(parsedCategoryId) && parsedCategoryId > 0 ? parsedCategoryId : null
  const initialSortByParam = searchParams.get("sortBy") || "id"
  const initialDirectionParam = searchParams.get("direction") || "asc"
  const initialSortBy = ALLOWED_SORT_BY.has(initialSortByParam) ? initialSortByParam : "id"
  const initialDirection = ALLOWED_DIRECTION.has(initialDirectionParam)
    ? initialDirectionParam
    : "asc"

  const [products, setProducts] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchInput, setSearchInput] = useState(initialKeyword)
  const [keyword, setKeyword] = useState(initialKeyword)
  const [categoryId, setCategoryId] = useState(initialCategoryId)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [direction, setDirection] = useState(initialDirection)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [categories, setCategories] = useState([])

  const loadMoreRef = useRef(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    document.title = "Shop Products | Urban Threads"
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories")
        setCategories(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.log("Failed to fetch categories:", error.response?.data || error.message)
        setCategories([])
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      const normalizedKeyword = searchInput.trim()

      if (normalizedKeyword !== keyword) {
        setPage(0)
        setProducts([])
        setKeyword(normalizedKeyword)
      }
    }, 420)

    return () => clearTimeout(timer)
  }, [searchInput, keyword])

  useEffect(() => {
    const nextParams = new URLSearchParams()

    if (keyword) nextParams.set("keyword", keyword)
    if (categoryId) nextParams.set("categoryId", String(categoryId))
    if (sortBy !== "id") nextParams.set("sortBy", sortBy)
    if (direction !== "asc") nextParams.set("direction", direction)

    const current = searchParams.toString()
    const next = nextParams.toString()

    if (current !== next) {
      setSearchParams(nextParams, { replace: true })
    }
  }, [keyword, categoryId, sortBy, direction, searchParams, setSearchParams])

  useEffect(() => {
    const currentRequestId = requestIdRef.current + 1
    requestIdRef.current = currentRequestId

    const fetchProducts = async () => {
      try {
        if (page === 0) {
          setLoadingInitial(true)
        } else {
          setLoadingMore(true)
        }

        const response = await api.get("/products", {
          params: {
            page,
            size: 6,
            keyword,
            categoryId,
            sortBy,
            direction
          }
        })

        if (requestIdRef.current !== currentRequestId) return

        const content = response.data.content || []
        const apiTotalPages = response.data.totalPages || 0

        setTotalPages(apiTotalPages)
        setProducts((prevProducts) => {
          if (page === 0) return content

          const existingIds = new Set(prevProducts.map((item) => item.id))
          const nextProducts = content.filter((item) => !existingIds.has(item.id))
          return [...prevProducts, ...nextProducts]
        })
      } catch (error) {
        console.log("Failed to fetch products:", error.response?.data || error.message)
        if (page === 0) {
          setProducts([])
          setTotalPages(0)
        }
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setLoadingInitial(false)
          setLoadingMore(false)
        }
      }
    }

    fetchProducts()
  }, [page, keyword, categoryId, sortBy, direction])

  const hasMore = page + 1 < totalPages
  const selectedCategory = categories.find((category) => Number(category.id) === Number(categoryId))

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loadingInitial || loadingMore) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]

        if (firstEntry.isIntersecting) {
          setPage((prevPage) => prevPage + 1)
        }
      },
      { rootMargin: "220px 0px" }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingInitial, loadingMore])

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-[1600px] space-y-6 px-3 py-5 sm:space-y-8 sm:px-4 sm:py-6 md:px-6 md:py-10 lg:px-8">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
              Catalog
            </p>
            <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
              All Products
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Browse trending fits, compare styles, and discover your next favorite outfit.
            </p>
          </div>
          <div className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 sm:px-4 sm:py-2 sm:text-sm">
            {products.length} items loaded
          </div>
        </div>

        <section className="surface-card rounded-3xl p-4 md:p-5">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-[1fr_240px]">
            <label className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search products by name or keyword"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="field-input !pl-12"
              />
            </label>

            <select
              value={`${sortBy}-${direction}`}
              onChange={(event) => {
                const [newSortBy, newDirection] = event.target.value.split("-")

                if (newSortBy !== sortBy || newDirection !== direction) {
                  setPage(0)
                  setProducts([])
                  setSortBy(newSortBy)
                  setDirection(newDirection)
                }
              }}
              className="field-input"
            >
              <option value="id-asc">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
          {categoryId && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Category: {selectedCategory?.name || `#${categoryId}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPage(0)
                  setProducts([])
                  setCategoryId(null)
                }}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
              >
                Clear category filter
              </button>
            </div>
          )}
        </section>

        <section>
          {loadingInitial ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="surface-card animate-pulse rounded-3xl border border-[var(--border)] p-5"
                >
                  <div className="h-44 rounded-2xl bg-slate-200" />
                  <div className="mt-4 h-4 w-24 rounded bg-slate-200" />
                  <div className="mt-2 h-5 w-3/4 rounded bg-slate-200" />
                  <div className="mt-2 h-4 rounded bg-slate-200" />
                  <div className="mt-6 flex items-center justify-between">
                    <div className="h-7 w-24 rounded bg-slate-200" />
                    <div className="h-10 w-20 rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="surface-card rounded-3xl p-10 text-center text-slate-600">
              No products found for this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {products.map((product) => (
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

        {!loadingInitial && products.length > 0 && (
          <section className="flex justify-center py-2">
            {loadingMore ? (
              <p className="text-sm text-slate-600">Loading more products...</p>
            ) : hasMore ? (
              <p className="text-sm text-slate-500">Scroll to load more</p>
            ) : (
              <p className="text-sm text-slate-500">You have reached the end.</p>
            )}
          </section>
        )}

        <div ref={loadMoreRef} className="h-1" />
      </div>
    </div>
  )
}

export default Products



