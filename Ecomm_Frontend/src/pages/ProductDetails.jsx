import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Heart, MapPin, ShoppingBag, Star, Trash2 } from "lucide-react"
import api from "../api/axiosInstance"
import toast from "react-hot-toast"
import { useAddress } from "../context/AddressContext"
import getApiErrorMessage from "../utils/getApiErrorMessage"

const formatReviewDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)
}

const ProductDetails = ({ refreshCartCount, wishlistIds = new Set(), refreshWishlistIds }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedAddress } = useAddress()
  const role = localStorage.getItem("role")
  const token = localStorage.getItem("token")
  const isUser = role === "USER"

  const [product, setProduct] = useState(null)
  const [reviewsData, setReviewsData] = useState({
    averageRating: 0,
    reviewCount: 0,
    reviews: []
  })
  const [loading, setLoading] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [adding, setAdding] = useState(false)
  const [togglingWishlist, setTogglingWishlist] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [deletingReview, setDeletingReview] = useState(false)
  const [activeImage, setActiveImage] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")

  const isWishlisted = wishlistIds instanceof Set
    ? wishlistIds.has(Number(id))
    : Array.isArray(wishlistIds) && wishlistIds.includes(Number(id))

  const myReview = useMemo(
    () => (reviewsData.reviews || []).find((review) => review.mine),
    [reviewsData.reviews]
  )

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Urban Threads`
    }
  }, [product])

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      setProduct(response.data)
      const images = response.data.imageUrls || []
      if (images.length > 0) {
        setActiveImage(images[0])
      } else {
        setActiveImage(response.data.imageUrl || "/fallback.svg")
      }
    } catch (error) {
      console.log("Failed to fetch product", error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true)
      const response = await api.get(`/products/${id}/reviews`)
      const payload = response.data || {}
      setReviewsData({
        averageRating: Number(payload.averageRating || 0),
        reviewCount: Number(payload.reviewCount || 0),
        reviews: payload.reviews || []
      })
    } catch (error) {
      console.log("Failed to fetch reviews", error)
      setReviewsData({
        averageRating: 0,
        reviewCount: 0,
        reviews: []
      })
    } finally {
      setLoadingReviews(false)
    }
  }

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [id])

  useEffect(() => {
    if (myReview) {
      setReviewRating(Number(myReview.rating || 5))
      setReviewComment(myReview.comment || "")
    } else {
      setReviewRating(5)
      setReviewComment("")
    }
  }, [myReview])

  const handleAddToCart = async () => {
    try {
      setAdding(true)
      await api.post(`/cart/add?productId=${id}&quantity=1`)
      toast.success("Added to cart")
      await refreshCartCount()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to add to cart"))
    } finally {
      setAdding(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!token || !isUser) {
      toast.error("Please login as user to use wishlist.")
      navigate("/login")
      return
    }

    try {
      setTogglingWishlist(true)
      if (isWishlisted) {
        await api.delete(`/wishlist/${id}`)
        toast.success("Removed from wishlist")
      } else {
        await api.post(`/wishlist/${id}`)
        toast.success("Added to wishlist")
      }
      if (refreshWishlistIds) {
        await refreshWishlistIds()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update wishlist"))
    } finally {
      setTogglingWishlist(false)
    }
  }

  const handleReviewSubmit = async () => {
    if (!token || !isUser) {
      toast.error("Login as user to add review.")
      navigate("/login")
      return
    }

    try {
      setSubmittingReview(true)
      await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      })
      toast.success(myReview ? "Review updated" : "Review submitted")
      await Promise.all([fetchReviews(), fetchProduct()])
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to submit review"))
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleReviewDelete = async () => {
    if (!myReview) return
    const confirmed = window.confirm("Delete your review?")
    if (!confirmed) return

    try {
      setDeletingReview(true)
      await api.delete(`/products/${id}/reviews/me`)
      toast.success("Review deleted")
      await Promise.all([fetchReviews(), fetchProduct()])
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete review"))
    } finally {
      setDeletingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="page-wrap">
        <div className="mx-auto flex min-h-[60vh] w-full max-w-[1200px] items-center justify-center px-4 md:px-8">
          <p className="text-slate-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page-wrap">
        <div className="mx-auto flex min-h-[60vh] w-full max-w-[1200px] items-center justify-center px-4 md:px-8">
          <p className="text-slate-600">Product not found.</p>
        </div>
      </div>
    )
  }

  const productImages = Array.isArray(product.imageUrls) && product.imageUrls.length > 0
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : ["/fallback.svg"]

  const averageRating = Number(reviewsData.averageRating || product.averageRating || 0)
  const reviewCount = Number(reviewsData.reviewCount || product.reviewCount || 0)

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-[1200px] space-y-6 px-3 py-5 sm:px-4 sm:py-6 md:px-6 md:py-10 lg:px-8">
        <div className="surface-card grid gap-6 rounded-3xl p-4 sm:gap-8 sm:p-6 md:grid-cols-2 md:p-8">
          <div>
            <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-3xl bg-slate-100 sm:min-h-[420px] lg:min-h-[520px]">
              <img
                src={activeImage || productImages[0]}
                alt={product.name}
                loading="lazy"
                onError={(event) => {
                  event.target.src = "/fallback.svg"
                }}
                className="h-full w-full object-contain"
              />
            </div>

            {productImages.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {productImages.map((imageUrl, index) => (
                  <button
                    key={`${imageUrl}-${index}`}
                    onClick={() => setActiveImage(imageUrl)}
                    className={`overflow-hidden rounded-xl border ${
                      activeImage === imageUrl
                        ? "border-rose-500 ring-2 ring-rose-100"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name} view ${index + 1}`}
                      onError={(event) => {
                        event.target.src = "/fallback.svg"
                      }}
                      className="h-20 w-full bg-slate-100 object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 sm:space-y-5">
            <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              {product.categoryName}
            </span>

            <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
              {product.name}
            </h1>

            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
              <Star size={14} className={reviewCount > 0 ? "fill-current" : ""} />
              {averageRating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? "" : "s"})
            </div>

            <p className="text-slate-600">{product.description}</p>

            <div className="font-display text-2xl font-bold text-rose-700 sm:text-3xl">Rs {product.price}</div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 text-sm text-slate-700">
              <p>In stock: {product.stockQuantity}</p>
              {selectedAddress ? (
                <p className="mt-2 inline-flex items-center gap-2 text-slate-600">
                  <MapPin size={14} className="text-rose-700" />
                  Delivering to {selectedAddress.city}, {selectedAddress.state}
                </p>
              ) : (
                <p className="mt-2 text-slate-600">Add an address from navbar for faster checkout.</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={adding}
                onClick={handleAddToCart}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white ${
                  adding ? "cursor-not-allowed bg-slate-400" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                <ShoppingBag size={16} />
                {adding ? "Adding..." : "Add to Cart"}
              </button>

              {isUser && (
                <button
                  disabled={togglingWishlist}
                  onClick={handleWishlistToggle}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                    isWishlisted
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-[var(--border)] bg-white text-slate-700 hover:border-rose-200 hover:text-rose-700"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <Heart size={16} className={isWishlisted ? "fill-current" : ""} />
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </button>
              )}
            </div>
          </div>
        </div>

        <section className="surface-card rounded-3xl p-5 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">Reviews & Ratings</h2>
              <p className="mt-1 text-sm text-slate-600">
                Honest feedback from buyers helps others choose better.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Average</p>
              <p className="font-display text-2xl font-bold text-amber-700">{averageRating.toFixed(1)}</p>
              <p className="text-xs font-semibold text-amber-700">{reviewCount} review{reviewCount === 1 ? "" : "s"}</p>
            </div>
          </div>

          {isUser ? (
            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-5">
              <p className="text-sm font-semibold text-slate-800">
                {myReview ? "Update your review" : "Write a review"}
              </p>

              <div className="mt-3 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setReviewRating(starValue)}
                      className="rounded-md p-1 text-amber-600 transition hover:bg-amber-50"
                    >
                      <Star size={20} className={reviewRating >= starValue ? "fill-current" : ""} />
                    </button>
                  )
                })}
                <span className="ml-1 text-sm font-semibold text-slate-700">{reviewRating}/5</span>
              </div>

              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Share your experience with fit, quality, and comfort..."
                className="field-input mt-3 min-h-[110px] resize-y"
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleReviewSubmit}
                  disabled={submittingReview}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submittingReview ? "Saving..." : myReview ? "Update Review" : "Submit Review"}
                </button>
                {myReview && (
                  <button
                    onClick={handleReviewDelete}
                    disabled={deletingReview}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Trash2 size={14} />
                    {deletingReview ? "Deleting..." : "Delete Review"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-slate-50 p-4 text-sm text-slate-600">
              Login as a user to add your review and rating.
            </div>
          )}

          <div className="mt-6 space-y-3">
            {loadingReviews ? (
              <p className="text-sm text-slate-500">Loading reviews...</p>
            ) : reviewsData.reviews.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 px-4 py-3 text-sm text-slate-600">
                No reviews yet. Be the first one to review this product.
              </p>
            ) : (
              reviewsData.reviews.map((review) => (
                <div key={review.reviewId} className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {review.userName}
                        {review.mine && (
                          <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                            You
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatReviewDate(review.updatedAt || review.createdAt)}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <Star size={12} className="fill-current" />
                      {review.rating}/5
                    </div>
                  </div>
                  {review.comment ? (
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{review.comment}</p>
                  ) : (
                    <p className="mt-2 text-sm italic text-slate-500">No written comment.</p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProductDetails
