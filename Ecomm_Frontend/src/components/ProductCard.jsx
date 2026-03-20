import api from '../api/axiosInstance'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react"
import getApiErrorMessage from "../utils/getApiErrorMessage"

const ProductCard = ({
  product,
  refreshCartCount,
  cartQuantity = 0,
  wishlistIds = new Set(),
  refreshWishlistIds
}) => {
  const [updatingQuantity, setUpdatingQuantity] = useState(false)
  const [updatingWishlist, setUpdatingWishlist] = useState(false)
  const [quantity, setQuantity] = useState(0)
  const navigate = useNavigate()
  const role = localStorage.getItem("role")
  const token = localStorage.getItem("token")
  const isUser = role === "USER"
  const isWishlisted = wishlistIds instanceof Set
    ? wishlistIds.has(product.id)
    : Array.isArray(wishlistIds) && wishlistIds.includes(product.id)
  const averageRating = Number(product.averageRating || 0)
  const reviewCount = Number(product.reviewCount || 0)
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

  const handleWishlistToggle = async (event) => {
    event.stopPropagation()

    if (!token || !isUser) {
      toast.error("Please login as user to use wishlist.")
      navigate("/login")
      return
    }

    try {
      setUpdatingWishlist(true)
      if (isWishlisted) {
        await api.delete(`/wishlist/${product.id}`)
        toast.success("Removed from wishlist")
      } else {
        await api.post(`/wishlist/${product.id}`)
        toast.success("Added to wishlist")
      }
      if (refreshWishlistIds) {
        await refreshWishlistIds()
      }
    } catch (error) {
      console.log("Failed to toggle wishlist:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to update wishlist."))
    } finally {
      setUpdatingWishlist(false)
    }
  }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group surface-card cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:rounded-3xl"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100 sm:aspect-[4/5]">
        {isUser && (
          <button
            onClick={handleWishlistToggle}
            disabled={updatingWishlist}
            className={`absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border transition sm:right-3 sm:top-3 sm:h-9 sm:w-9 ${
              isWishlisted
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-white/70 bg-white/85 text-slate-600 hover:text-rose-600"
            } disabled:cursor-not-allowed disabled:opacity-70`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} className={isWishlisted ? "fill-current" : ""} />
          </button>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/10 to-transparent opacity-0 transition group-hover:opacity-100" />
        <img
          src={productImage}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.target.src = "/fallback.svg"
          }}
          className="h-full w-full object-contain transition duration-500"
        />
        <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden items-center justify-between opacity-0 transition group-hover:opacity-100 sm:flex">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            View details
          </span>
          <ArrowRight size={15} className="text-white" />
        </div>
      </div>

      <div className="space-y-2.5 p-3 sm:space-y-4 sm:p-6">
        <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 sm:px-3 sm:text-xs">
          {product.categoryName}
        </span>

        <h3 className="font-display text-base font-bold leading-tight text-slate-900 sm:text-xl sm:leading-snug">
          {product.name}
        </h3>

        <p className="hidden text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:block sm:text-xs sm:tracking-[0.1em]">
          In stock: {product.stockQuantity}
        </p>

        <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs">
          <Star size={12} className={reviewCount > 0 ? "fill-current" : ""} />
          {averageRating.toFixed(1)} ({reviewCount})
        </div>

        <p className="line-clamp-1 text-xs leading-relaxed text-slate-600 sm:line-clamp-2 sm:text-sm">
          {product.description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2.5 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg font-bold text-rose-700 sm:text-2xl">Rs {product.price}</p>

          {quantity > 0 ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-1.5 py-0.5 sm:gap-2 sm:px-2 sm:py-1">
              <button
                disabled={updatingQuantity}
                onClick={(event) => handleQuantityUpdate(event, -1)}
                className="rounded-lg p-1 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:p-1.5"
              >
                <Minus size={14} />
              </button>

              <span className="min-w-5 text-center text-xs font-semibold text-slate-800 sm:min-w-6 sm:text-sm">
                {updatingQuantity ? "..." : quantity}
              </span>

              <button
                disabled={updatingQuantity}
                onClick={(event) => handleQuantityUpdate(event, 1)}
                className="rounded-lg p-1 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:p-1.5"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              disabled={updatingQuantity}
              onClick={handleAddToCart}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-all duration-300 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${
                updatingQuantity ? "cursor-not-allowed bg-slate-400" : "bg-rose-600 hover:bg-rose-700"
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
