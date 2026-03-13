import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Landmark,
  MapPin,
  Minus,
  Package,
  Plus,
  ReceiptText,
  ShieldCheck,
  Wallet
} from "lucide-react"
import api from "../api/axiosInstance"
import toast from "react-hot-toast"
import { useAddress } from "../context/AddressContext"
import getApiErrorMessage from "../utils/getApiErrorMessage"

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const PAYMENT_METHODS = {
  ONLINE: "ONLINE",
  COD: "COD"
}

const Cart = ({ refreshCartCount }) => {
  const [cartItems, setCartItems] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loadingCart, setLoadingCart] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false)
  const [selectingAddressId, setSelectingAddressId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.ONLINE)

  const {
    selectedAddress,
    addresses,
    selectAddress,
    loadAddresses,
    loadingAddresses
  } = useAddress()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "Your Cart | Urban Threads"
  }, [])

  const fetchCartItems = async () => {
    try {
      setLoadingCart(true)
      const response = await api.get("/cart")
      setCartItems(response.data.cartItems || [])
      setTotalAmount(response.data.totalCartAmount || 0)
    } catch (error) {
      console.log("Failed to fetch cart items:", error.response?.data || error.message)
    } finally {
      setLoadingCart(false)
    }
  }

  useEffect(() => {
    fetchCartItems()
  }, [])

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 0) return

    try {
      await api.put(`/cart/update?productId=${productId}&quantity=${newQuantity}`)
      await fetchCartItems()
      await refreshCartCount()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update quantity"))
    }
  }

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please add/select a delivery address first.")
      navigate("/addresses/new")
      return
    }

    if (paymentMethod === PAYMENT_METHODS.COD) {
      try {
        setCheckoutLoading(true)
        await api.post("/orders/checkout/cod")
        toast.success("Order placed with Cash on Delivery")
        await refreshCartCount()
        navigate("/orders")
      } catch (error) {
        toast.error(getApiErrorMessage(error, "COD order placement failed"))
      } finally {
        setCheckoutLoading(false)
      }
      return
    }

    try {
      setCheckoutLoading(true)
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay checkout.")
      }

      const orderResponse = await api.post("/payments/razorpay/order")
      const razorpayOrder = orderResponse.data

      if (!razorpayOrder?.orderId || !razorpayOrder?.keyId) {
        throw new Error("Invalid Razorpay order response.")
      }

      const razorpay = new window.Razorpay({
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        order_id: razorpayOrder.orderId,
        name: "Urban Threads",
        description: "Test payment for your order",
        prefill: {
          name: selectedAddress?.fullName || "",
          contact: selectedAddress?.phone || ""
        },
        theme: {
          color: "#be123c"
        },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false)
          }
        },
        handler: async (response) => {
          try {
            await api.post("/payments/razorpay/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
            toast.success("Payment successful. Order placed.")
            await refreshCartCount()
            navigate("/orders")
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Payment verification failed"))
          } finally {
            setCheckoutLoading(false)
          }
        }
      })

      razorpay.on("payment.failed", (event) => {
        const reason = event?.error?.description || "Payment failed"
        toast.error(reason)
        setCheckoutLoading(false)
      })

      razorpay.open()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to start Razorpay checkout"))
      setCheckoutLoading(false)
    }
  }

  const handleToggleSavedAddresses = async () => {
    const shouldOpen = !isAddressPickerOpen
    setIsAddressPickerOpen(shouldOpen)

    if (shouldOpen) {
      await loadAddresses()
    }
  }

  const handleSelectSavedAddress = async (addressId) => {
    try {
      setSelectingAddressId(addressId)
      await selectAddress(addressId)
      toast.success("Delivery address selected")
      setIsAddressPickerOpen(false)
    } catch (error) {
      console.log("Failed to select address:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to select address"))
    } finally {
      setSelectingAddressId(null)
    }
  }

  const handleAddNewAddress = () => {
    navigate("/addresses/new")
  }

  const handleEditSelectedAddress = () => {
    if (!selectedAddress?.id) {
      toast.error("Select an address first")
      return
    }

    navigate(`/addresses/${selectedAddress.id}/edit`)
  }

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const shippingCharge = totalAmount > 499 ? 0 : 49
  const platformFee = itemCount > 0 ? 9 : 0
  const estimatedTax = Math.round(totalAmount * 0.05)
  const payableAmount = totalAmount + shippingCharge + platformFee + estimatedTax

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-[1320px] space-y-5 px-3 py-5 sm:space-y-6 sm:px-4 sm:py-6 md:px-6 md:py-10 lg:px-8">
        <div className="surface-card rounded-3xl p-5 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Checkout
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                Your Cart
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Review items, delivery details, and payment summary before placing order.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
              <Package size={15} />
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {loadingCart ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="surface-card animate-pulse rounded-2xl p-5">
                  <div className="h-5 w-40 rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-28 rounded bg-slate-200" />
                  <div className="mt-6 h-10 w-32 rounded bg-slate-200" />
                </div>
              ))}
            </div>
            <div className="surface-card animate-pulse rounded-3xl p-6">
              <div className="h-6 w-44 rounded bg-slate-200" />
              <div className="mt-4 h-4 w-full rounded bg-slate-200" />
              <div className="mt-2 h-4 w-4/5 rounded bg-slate-200" />
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="surface-card rounded-3xl p-10 text-center">
            <p className="text-slate-600">Your cart is currently empty.</p>
            <button onClick={() => navigate("/products")} className="btn-primary mt-6">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="surface-card rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50/70 to-white p-4 text-sm text-slate-700 shadow-lg">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                  <MapPin size={12} />
                  Current Delivery Address
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div>
                    {selectedAddress ? (
                      <>
                        <p className="mt-2 font-semibold text-slate-800">
                          {selectedAddress.fullName} ({selectedAddress.label})
                        </p>
                        <p className="mt-1 text-slate-700">
                          {selectedAddress.line1}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                        </p>
                        <p className="mt-1 text-slate-600">{selectedAddress.phone}</p>
                      </>
                    ) : (
                      <p className="mt-2 font-semibold text-rose-600">No address selected.</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      onClick={handleAddNewAddress}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 hover:text-rose-800 sm:w-auto"
                    >
                      Add New
                    </button>
                    <button
                      onClick={handleEditSelectedAddress}
                      disabled={!selectedAddress}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleToggleSavedAddresses}
                      className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700 sm:min-w-[96px] sm:w-auto"
                    >
                      Saved
                      <ChevronDown size={15} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  <p className="inline-flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5" />
                    Verify name, city and PIN carefully before placing order to avoid wrong delivery.
                  </p>
                </div>

                {isAddressPickerOpen && (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-white p-3 shadow-sm">
                    {loadingAddresses ? (
                      <p className="text-sm text-slate-500">Loading saved addresses...</p>
                    ) : addresses.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-slate-500">No saved address found.</p>
                        <button
                          onClick={() => navigate("/addresses/new")}
                          className="text-sm font-semibold text-rose-700 hover:text-rose-800"
                        >
                          Add a new address
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {addresses.map((address) => {
                          const isActive = selectedAddress?.id === address.id
                          const isSelecting = selectingAddressId === address.id

                          return (
                            <div
                              key={address.id}
                              className={`rounded-lg border p-3 ${
                                isActive ? "border-rose-400 bg-rose-50 shadow-sm" : "border-[var(--border)] bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold text-slate-900">
                                    {address.fullName} ({address.label})
                                  </p>
                                  <p className="mt-1 text-xs text-slate-600">
                                    {address.line1}, {address.city}, {address.state} {address.postalCode}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">{address.phone}</p>
                                </div>

                                <button
                                  disabled={isActive || isSelecting || selectingAddressId !== null}
                                  onClick={() => handleSelectSavedAddress(address.id)}
                                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                                    isActive
                                      ? "bg-rose-100 text-rose-700"
                                      : "border border-[var(--border)] bg-white text-slate-700 hover:border-rose-200 hover:text-rose-700"
                                  } disabled:cursor-not-allowed disabled:opacity-70`}
                                >
                                  {isActive ? (
                                    <>
                                      <CheckCircle2 size={12} />
                                      Selected
                                    </>
                                  ) : isSelecting ? (
                                    "Selecting..."
                                  ) : (
                                    "Use"
                                  )}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="surface-card rounded-2xl p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-900">
                        {item.productName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">Rs {item.price} per unit</p>
                    </div>

                    <div className="w-fit rounded-xl border border-[var(--border)] bg-white px-2 py-1">
                      <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 hover:text-rose-700"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-8 text-center font-semibold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 hover:text-rose-700"
                      >
                        <Plus size={14} />
                      </button>
                      </div>
                    </div>

                    <div className="font-display text-xl font-bold text-rose-700">
                      Rs {item.price * item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="space-y-4">
              <div className="surface-card rounded-3xl p-6">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <ReceiptText size={14} />
                  Order Summary
                </p>

                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>Rs {totalAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span>{shippingCharge === 0 ? "Free" : `Rs ${shippingCharge}`}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Platform fee</span>
                    <span>Rs {platformFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estimated tax</span>
                    <span>Rs {estimatedTax}</span>
                  </div>
                </div>

                <div className="my-4 border-t border-[var(--border)]" />

                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">Estimated payable</p>
                  <p className="font-display text-2xl font-bold text-rose-700">Rs {payableAmount}</p>
                </div>

                <button
                  disabled={checkoutLoading}
                  onClick={handleCheckout}
                  className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2"
                >
                  {checkoutLoading
                    ? paymentMethod === PAYMENT_METHODS.COD
                      ? "Placing COD Order..."
                      : "Opening Razorpay..."
                    : paymentMethod === PAYMENT_METHODS.COD
                      ? "Place COD Order"
                      : "Pay with Razorpay"}
                  {!checkoutLoading && <ArrowRight size={16} />}
                </button>

                <p className="mt-3 text-xs text-slate-500">
                  {paymentMethod === PAYMENT_METHODS.COD
                    ? "No online payment step for COD. Order is placed directly."
                    : "Order is created only after successful payment verification."}
                </p>
              </div>

              <div className="surface-card rounded-3xl p-6">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <CreditCard size={14} />
                  Payment Method
                </p>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.COD)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      paymentMethod === PAYMENT_METHODS.COD
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : "border-[var(--border)] bg-white text-slate-700 hover:border-rose-200 hover:text-rose-700"
                    }`}
                  >
                    <span>Cash on Delivery</span>
                    <span className="text-xs">{paymentMethod === PAYMENT_METHODS.COD ? "Selected" : "Choose"}</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.ONLINE)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      paymentMethod === PAYMENT_METHODS.ONLINE
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : "border-[var(--border)] bg-white text-slate-700 hover:border-rose-200 hover:text-rose-700"
                    }`}
                  >
                    <span>Online (Card / UPI / Net Banking)</span>
                    <span className="text-xs">{paymentMethod === PAYMENT_METHODS.ONLINE ? "Selected" : "Choose"}</span>
                  </button>
                </div>

                {paymentMethod === PAYMENT_METHODS.ONLINE ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-700">
                      <Wallet size={16} className="text-rose-700" />
                      UPI / Wallet
                      <span className="ml-auto text-xs font-semibold text-emerald-600">Razorpay Test</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-700">
                      <CreditCard size={16} className="text-rose-700" />
                      Card Payment
                      <span className="ml-auto text-xs font-semibold text-emerald-600">Razorpay Test</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-700">
                      <Landmark size={16} className="text-rose-700" />
                      Net Banking
                      <span className="ml-auto text-xs font-semibold text-emerald-600">Razorpay Test</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-700">
                    Cash on Delivery selected. Razorpay checkout will not appear.
                  </div>
                )}

                {paymentMethod === PAYMENT_METHODS.ONLINE ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                    <ShieldCheck size={14} />
                    Razorpay test checkout is enabled
                  </div>
                ) : (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                    <ShieldCheck size={14} />
                    COD orders are placed directly
                  </div>
                )}

                <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                  <BadgeCheck size={13} className="text-rose-700" />
                  {paymentMethod === PAYMENT_METHODS.ONLINE
                    ? "Payment is verified before order creation."
                    : "No Razorpay popup for COD mode."}
                </p>

              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart


