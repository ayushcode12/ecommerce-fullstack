import api from '../api/axiosInstance'
import toast from 'react-hot-toast'
import { useState } from 'react'

const ProductCard = ({ product, refreshCartCount }) => {

  const [Loading , setLoading] = useState(false)

  const handleAddToCart = async () => {

    setLoading(true)
    try {
      await api.post(`/cart/add?productId=${product.id}&quantity=1`)
      toast.success("Product added to cart!")
      await refreshCartCount()
    } catch (error) {
      console.log("Failed to add product to cart:", error.response?.data || error.message)
      toast.error("Failed to add product to cart. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="group bg-white rounded-2xl p-6 shadow-md border border-slate-200 
                    transition-all duration-500 
                    hover:-translate-y-3 hover:shadow-2xl hover:border-emerald-300">

      {/* Top Section */}
      <div className="space-y-4">

        {/* Category Badge */}
        <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">
          {product.categoryName}
        </span>

        {/* Product Name */}
        <h3 className="text-xl font-bold text-slate-900 leading-snug">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
          {product.description}
        </p>

      </div>

      {/* Bottom Section */}
      <div className="mt-8 flex items-center justify-between">

        {/* Price */}
        <div>
          <p className="text-2xl font-bold text-emerald-600">
            ₹{product.price}
          </p>
        </div>

        {/* Add Button */}
        <button
          disabled={Loading}
          onClick={handleAddToCart}
          className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-md ${
            Loading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg"
          }`}
        >
          {Loading ? "Adding..." : "Add"}
        </button>

      </div>

    </div>
  )
}

export default ProductCard
