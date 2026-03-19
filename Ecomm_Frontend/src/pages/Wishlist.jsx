import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Heart, ShoppingBag, Star, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import api from "../api/axiosInstance"
import getApiErrorMessage from "../utils/getApiErrorMessage"

const Wishlist = ({ refreshCartCount, refreshWishlistIds }) => {
  const navigate = useNavigate()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    document.title = "Wishlist | Urban Threads"
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await api.get("/wishlist")
      setWishlistItems(response.data || [])
    } catch (error) {
      console.log("Failed to load wishlist:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to load wishlist."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const handleRemove = async (productId) => {
    try {
      setUpdatingId(productId)
      await api.delete(`/wishlist/${productId}`)
      await fetchWishlist()
      if (refreshWishlistIds) {
        await refreshWishlistIds()
      }
      toast.success("Removed from wishlist")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to remove from wishlist"))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleAddToCart = async (productId) => {
    try {
      setUpdatingId(productId)
      await api.post(`/cart/add?productId=${productId}&quantity=1`)
      if (refreshCartCount) {
        await refreshCartCount()
      }
      toast.success("Added to cart")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to add to cart"))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-[1300px] space-y-6 px-3 py-5 sm:px-4 sm:py-6 md:px-6 md:py-10 lg:px-8">
        <div className="surface-card rounded-3xl p-5 md:p-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            <Heart size={14} className="fill-current" />
            Favorites
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl">My Wishlist</h1>
          <p className="mt-2 text-sm text-slate-600">
            Save styles you like and move them to cart anytime.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="surface-card animate-pulse rounded-3xl p-4">
                <div className="h-44 rounded-2xl bg-slate-200" />
                <div className="mt-4 h-4 w-24 rounded bg-slate-200" />
                <div className="mt-2 h-5 w-2/3 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="surface-card rounded-3xl p-10 text-center">
            <p className="text-slate-600">Your wishlist is empty.</p>
            <button onClick={() => navigate("/products")} className="btn-primary mt-6">
              Explore Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistItems.map((item) => {
              const imageUrl =
                item.imageUrl ||
                (Array.isArray(item.imageUrls) && item.imageUrls.length > 0 ? item.imageUrls[0] : "/fallback.svg")

              return (
                <div key={item.productId} className="surface-card overflow-hidden rounded-3xl">
                  <button
                    onClick={() => navigate(`/product/${item.productId}`)}
                    className="w-full"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                      <img
                        src={imageUrl}
                        alt={item.name}
                        onError={(event) => {
                          event.target.src = "/fallback.svg"
                        }}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </button>

                  <div className="space-y-3 p-5">
                    <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                      {item.categoryName}
                    </span>
                    <h3 className="font-display text-xl font-bold text-slate-900">{item.name}</h3>
                    <p className="line-clamp-2 text-sm text-slate-600">{item.description}</p>

                    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <Star size={12} className={Number(item.reviewCount || 0) > 0 ? "fill-current" : ""} />
                      {Number(item.averageRating || 0).toFixed(1)} ({Number(item.reviewCount || 0)})
                    </div>

                    <div className="font-display text-2xl font-bold text-rose-700">Rs {item.price}</div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        disabled={updatingId === item.productId}
                        onClick={() => handleAddToCart(item.productId)}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <ShoppingBag size={14} />
                        Add to Cart
                      </button>
                      <button
                        disabled={updatingId === item.productId}
                        onClick={() => handleRemove(item.productId)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
