import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ShoppingBag, MapPin } from "lucide-react"
import api from "../api/axiosInstance"
import toast from "react-hot-toast"
import { useAddress } from "../context/AddressContext"

const ProductDetails = ({ refreshCartCount }) => {
  const { id } = useParams()
  const { selectedAddress } = useAddress()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [activeImage, setActiveImage] = useState("")

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Urban Threads`
    }
  }, [product])

  useEffect(() => {
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
      await refreshCartCount()
    } catch {
      toast.error("Failed to add to cart")
    } finally {
      setAdding(false)
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

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-[1200px] space-y-6 px-3 py-5 sm:px-4 sm:py-6 md:px-6 md:py-10 lg:px-8">
        <div className="surface-card grid gap-6 rounded-3xl p-4 sm:gap-8 sm:p-6 md:grid-cols-2 md:p-8">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100">
              <img
                src={activeImage || productImages[0]}
                alt={product.name}
                loading="lazy"
                onError={(event) => {
                  event.target.src = "/fallback.svg"
                }}
                className="h-full w-full object-cover"
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
                      className="h-16 w-full object-cover"
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

            <button
              disabled={adding}
              onClick={handleAddToCart}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white sm:w-auto ${
                adding ? "cursor-not-allowed bg-slate-400" : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              <ShoppingBag size={16} />
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails


