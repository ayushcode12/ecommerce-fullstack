import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../api/axiosInstance"
import ProductCard from "../components/ProductCard"

const CategoryPage = ({ refreshCartCount }) => {

  const { id } = useParams()
  const categoryId = Number(id)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true)

        const response = await api.get(
          `/products?page=0&size=12&categoryId=${categoryId}`
        )

        setProducts(response.data.content)
      } catch (error) {
        console.log("Failed to fetch category products", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (!isNaN(categoryId)) {
      fetchCategoryProducts()
    }
  }, [categoryId])

  const categoryTitle =
    products.length > 0 ? products[0].categoryName : "Category"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200 py-16 px-6">

      <div className="max-w-[1600px] mx-auto space-y-12">

        {/* PAGE TITLE */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-800">
            {categoryTitle}
          </h1>
          <p className="text-slate-600">
            Explore products in this category.
          </p>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <p className="text-center text-slate-600">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl shadow-xl text-center">
            <p className="text-slate-600 text-lg">
              No products found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                refreshCartCount={refreshCartCount}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default CategoryPage