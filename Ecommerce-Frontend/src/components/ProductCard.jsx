import api from '../api/axiosInstance'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ProductCard = ({ product, refreshCartCount }) => {

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleAddToCart = async (e) => {
    e.stopPropagation() // 🚀 Prevent card click navigation

    setLoading(true)
    try {
      await api.post(`/cart/add?productId=${product.id}&quantity=1`)
      toast.success("Product added to cart!")
      if (refreshCartCount) {
        await refreshCartCount()
      }
    } catch (error) {
      console.log("Failed to add product to cart:", error.response?.data || error.message)
      toast.error("Failed to add product to cart.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200 
                 transition-all duration-500 
                 hover:-translate-y-3 hover:shadow-2xl hover:border-emerald-300 cursor-pointer"
    >

      {/* Image Section */}
      <div className="h-48 bg-slate-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>

      <div className="p-6 space-y-4">

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

        {/* Bottom Section */}
        <div className="mt-6 flex items-center justify-between">

          {/* Price */}
          <p className="text-2xl font-bold text-emerald-600">
            ₹{product.price}
          </p>

          {/* Add Button */}
          <button
            disabled={loading}
            onClick={handleAddToCart}
            className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-md ${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg"
            }`}
          >
            {loading ? "Adding..." : "Add"}
          </button>

        </div>

      </div>

    </div>
  )
}

export default ProductCard