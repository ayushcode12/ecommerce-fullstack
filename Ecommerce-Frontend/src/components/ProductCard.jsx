import api from '../api/axiosInstance'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag } from "lucide-react"
import getApiErrorMessage from "../utils/getApiErrorMessage"

const ProductCard = ({ product, refreshCartCount, cartQuantity = 0 }) => {
  const [updatingQuantity, setUpdatingQuantity] = useState(false)
  const [quantity, setQuantity] = useState(0)
  const navigate = useNavigate()
  const productImage =
    product.imageUrl ||
    (Array.isArray(product.imageUrls) && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : "/fallback.svg")

  useEffect(() => {
    setQuantity(cartQuantity || 0)
  }, [cartQuantity])

  const handleAddToCart = async (event) => {
    event.stopPropagation()

    setUpdatingQuantity(true)
    try {
      await api.post(`/cart/add?productId=${product.id}&quantity=1`)
      toast.success("Product added to cart.")
      setQuantity((prevQuantity) => Math.max(1, prevQuantity + 1))
      if (refreshCartCount) {
        await refreshCartCount()
      }
    } catch (error) {
      console.log("Failed to add product to cart:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to add product to cart."))
    } finally {
      setUpdatingQuantity(false)
    }
  }

  const handleQuantityUpdate = async (event, delta) => {
    event.stopPropagation()

    const nextQuantity = quantity + delta
    if (nextQuantity < 0) return

    setUpdatingQuantity(true)
    try {
      await api.put(`/cart/update?productId=${product.id}&quantity=${nextQuantity}`)
      setQuantity(nextQuantity)
      if (refreshCartCount) {
        await refreshCartCount()
      }
    } catch (error) {
      console.log("Failed to update quantity:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to update quantity."))
    } finally {
      setUpdatingQuantity(false)
    }
  }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group surface-card cursor-pointer overflow-hidden rounded-3xl border border-[var(--border)] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100 sm:h-56">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent opacity-0 transition group-hover:opacity-100" />
        <img
          src={productImage}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.target.src = "/fallback.svg"
          }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
        <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          {product.categoryName}
        </span>

        <h3 className="font-display text-lg font-bold leading-snug text-slate-900 sm:text-xl">
          {product.name}
        </h3>

        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
          {product.description}
        </p>

        <div className="mt-5 flex flex-col items-start gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl font-bold text-teal-700 sm:text-2xl">Rs {product.price}</p>

          {quantity > 0 ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-2 py-1">
              <button
                disabled={updatingQuantity}
                onClick={(event) => handleQuantityUpdate(event, -1)}
                className="rounded-lg p-1.5 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus size={14} />
              </button>

              <span className="min-w-6 text-center text-sm font-semibold text-slate-800">
                {updatingQuantity ? "..." : quantity}
              </span>

              <button
                disabled={updatingQuantity}
                onClick={(event) => handleQuantityUpdate(event, 1)}
                className="rounded-lg p-1.5 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              disabled={updatingQuantity}
              onClick={handleAddToCart}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 sm:w-auto ${
                updatingQuantity ? "cursor-not-allowed bg-slate-400" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              <ShoppingBag size={14} />
              {updatingQuantity ? "Adding..." : "Add"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
