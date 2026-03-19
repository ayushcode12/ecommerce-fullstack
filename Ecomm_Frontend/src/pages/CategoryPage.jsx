import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../api/axiosInstance"
import ProductCard from "../components/ProductCard"

const CategoryPage = ({ refreshCartCount, cartQuantities, wishlistIds, refreshWishlistIds }) => {
  const { id } = useParams()
  const categoryId = Number(id)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true)

        const response = await api.get(`/products?page=0&size=12&categoryId=${categoryId}`)
        setProducts(response.data.content || [])
      } catch (error) {
        console.log("Failed to fetch category products", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (!Number.isNaN(categoryId)) {
      fetchCategoryProducts()
    }
  }, [categoryId])

  const categoryTitle = products.length > 0 ? products[0].categoryName : "Category"

  useEffect(() => {
    document.title = `${categoryTitle} | Urban Threads`
  }, [categoryTitle])

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-[1600px] space-y-6 px-3 py-5 sm:space-y-8 sm:px-4 sm:py-6 md:px-6 md:py-10 lg:px-8">
        <div className="surface-card rounded-3xl p-5 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
            Category collection
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
            {categoryTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-600">Explore products in this category.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="surface-card animate-pulse rounded-3xl p-4">
                <div className="h-36 rounded-xl bg-slate-200" />
                <div className="mt-4 h-4 w-24 rounded bg-slate-200" />
                <div className="mt-2 h-5 w-2/3 rounded bg-slate-200" />
                <div className="mt-2 h-4 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="surface-card rounded-3xl p-10 text-center text-slate-600">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
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
      </div>
    </div>
  )
}

export default CategoryPage


