/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../api/axiosInstance"
import toast from "react-hot-toast"

const ProductDetails = ({ refreshCartCount }) => {

  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`)
        setProduct(response.data)
      } catch (error) {
        console.log("Failed to fetch product", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    try {
      setAdding(true)
      await api.post(`/cart/add?productId=${product.id}&quantity=1`)
      toast.success("Added to cart")
      refreshCartCount()
    } catch (error) {
      toast.error("Failed to add to cart")
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading product...
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200 py-16 px-6">

      <div className="max-w-[1200px] mx-auto bg-white p-12 rounded-3xl shadow-xl border border-slate-200 grid md:grid-cols-2 gap-12">

        {/* IMAGE */}
        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="rounded-2xl shadow-md w-full object-cover"
          />
        </div>

        {/* DETAILS */}
        <div className="space-y-6">

          <h1 className="text-4xl font-bold text-slate-800">
            {product.name}
          </h1>

          <p className="text-slate-600 text-lg">
            {product.description}
          </p>

          <div className="text-3xl font-bold text-emerald-600">
            ₹{product.price}
          </div>

          <p className="text-sm text-slate-500">
            Category: {product.categoryName}
          </p>

          <p className="text-sm text-slate-500">
            In Stock: {product.stockQuantity}
          </p>

          <button
            disabled={adding}
            onClick={handleAddToCart}
            className={`px-10 py-4 rounded-xl text-white font-semibold transition shadow-md ${
              adding
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>

        </div>

      </div>
    </div>
  )
}

export default ProductDetails