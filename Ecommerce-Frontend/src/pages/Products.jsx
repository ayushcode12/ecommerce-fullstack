import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import api from '../api/axiosInstance'

const Products = ({ refreshCartCount }) => {

  const [products, setProducts] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [keyword, setKeyword] = useState("")
  const [sortBy, setSortBy] = useState("id")
  const [direction, setDirection] = useState("asc")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get(
          `/products?page=${page}&size=6&keyword=${keyword}&sortBy=${sortBy}&direction=${direction}`
        )

        setProducts(response.data.content)
        setTotalPages(response.data.totalPages)
      } catch (error) {
        console.log("Failed to fetch products:", error.response?.data || error.message)
      }
    }

    fetchProducts()
  }, [page, keyword, sortBy, direction])

  return (
    <div className="animate-fadeIn">
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200">

        <div className="max-w-[1600px] mx-auto px-8 py-20 space-y-16">

          {/* PAGE TITLE */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800">
              All Products
            </h1>
            <p className="text-slate-600 mt-2">
              Explore our complete range of professional cleaning solutions.
            </p>
          </div>

          {/* SEARCH + SORT */}
          <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => {
                setPage(0)
                setKeyword(e.target.value)
              }}
              className="px-5 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-80 shadow-sm"
            />

            <select
              value={`${sortBy}-${direction}`}
              onChange={(e) => {
                const [newSortBy, newDirection] = e.target.value.split("-")
                setPage(0)
                setSortBy(newSortBy)
                setDirection(newDirection)
              }}
              className="px-5 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-72 shadow-sm"
            >
              <option value="id-asc">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </section>

          {/* PRODUCTS GRID */}
          <section className="bg-white rounded-3xl p-12 shadow-xl border border-slate-200">
            {products.length === 0 ? (
              <p className="text-slate-600">No products found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    refreshCartCount={refreshCartCount}
                  />
                ))}
              </div>
            )}
          </section>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <section className="flex justify-center items-center gap-8">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="bg-slate-900 text-white px-7 py-3 rounded-xl hover:bg-slate-800 transition shadow-md disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-slate-700 font-semibold text-lg">
                Page {page + 1} of {totalPages}
              </span>

              <button
                disabled={page + 1 === totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-slate-800 text-white px-6 py-3 rounded-xl disabled:opacity-40 hover:bg-slate-700 transition shadow"
              >
                Next
              </button>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}

export default Products