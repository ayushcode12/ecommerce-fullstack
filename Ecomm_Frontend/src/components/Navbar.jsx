import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ChevronDown,
  Heart,
  Home,
  LogOut,
  MapPin,
  PackageCheck,
  Pencil,
  Plus,
  Shield,
  ShoppingCart,
  Trash2,
  UserCircle2
} from "lucide-react"
import toast from "react-hot-toast"
import api from "../api/axiosInstance"
import getApiErrorMessage from "../utils/getApiErrorMessage"
import { useAddress } from "../context/AddressContext"

function Navbar({ cartCount = 0, wishlistCount = 0 }) {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")
  const isLoggedIn = Boolean(token)
  const isAdmin = role === "ADMIN"
  const isUser = !isAdmin

  const {
    addresses,
    selectedAddress,
    selectAddress,
    deleteAddress,
    loadAddresses,
    loadingAddresses
  } = useAddress()

  const [isAddressOpen, setIsAddressOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectingAddressId, setSelectingAddressId] = useState(null)
  const addressMenuRef = useRef(null)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (addressMenuRef.current && !addressMenuRef.current.contains(event.target)) {
        setIsAddressOpen(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.log("Logout API failed:", error.response?.data || error.message)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("role")
      window.dispatchEvent(new Event("auth-changed"))
      navigate("/login")
    }
  }

  const selectedAddressSummary = selectedAddress
    ? `${selectedAddress.line1}, ${selectedAddress.city}`
    : "Choose delivery address"

  const handleAddressPick = async (addressId) => {
    try {
      setSelectingAddressId(addressId)
      await selectAddress(addressId)
      setIsAddressOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to select address"))
    } finally {
      setSelectingAddressId(null)
    }
  }

  const handleAddressDelete = async (event, addressId) => {
    event.stopPropagation()
    const shouldDelete = window.confirm("Delete this address?")
    if (!shouldDelete) return

    try {
      await deleteAddress(addressId)
      toast.success("Address deleted")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete address"))
    }
  }

  const iconButtonClass =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 hover:shadow-md md:h-11 md:w-11"

  const menuItemClass =
    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-teal-700"

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-3 sm:px-6 md:py-3.5 lg:px-8">
        <div className="flex w-full flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-slate-900 sm:text-xl md:text-2xl"
          >
            Urban <span className="text-rose-600">Threads</span>
            <span className="hidden rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-teal-700 sm:inline-flex">
              Fashion Store
            </span>
          </Link>

          <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto md:flex-nowrap md:gap-3.5">
            {isLoggedIn && isUser && (
              <div className="relative order-1 w-full md:w-[236px] lg:w-[248px]" ref={addressMenuRef}>
                <button
                  onClick={() => {
                    const shouldOpen = !isAddressOpen
                    setIsAddressOpen(shouldOpen)
                    if (shouldOpen) {
                      loadAddresses()
                    }
                  }}
                  className="flex h-11 w-full items-center gap-2 rounded-2xl border border-slate-200/90 bg-slate-50/85 px-3 text-left text-slate-800 shadow-sm transition-all duration-200 hover:border-teal-200 hover:bg-white hover:shadow-md"
                >
                  <MapPin size={16} className="text-teal-700" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-slate-500">
                      Deliver to
                    </p>
                    <p className="truncate text-[13px] font-semibold leading-tight text-slate-700">
                      {selectedAddressSummary}
                    </p>
                  </div>
                  <ChevronDown size={16} className="text-slate-500" />
                </button>

                {isAddressOpen && (
                  <div className="absolute left-0 z-50 mt-2 w-[min(92vw,360px)] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl md:left-auto md:right-0">
                    <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Saved addresses
                    </p>

                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {loadingAddresses ? (
                        <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 p-3 text-sm text-slate-600">
                          Loading addresses...
                        </div>
                      ) : addresses.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 p-3 text-sm text-slate-600">
                          No saved address yet.
                        </div>
                      ) : (
                        addresses.map((address) => {
                          const active = selectedAddress?.id === address.id
                          const selecting = selectingAddressId === address.id

                          return (
                            <div
                              key={address.id}
                              className={`w-full rounded-xl border p-3 transition ${
                                active ? "border-teal-300 bg-teal-50" : "border-[var(--border)] hover:bg-slate-50"
                              }`}
                            >
                              <button
                                onClick={() => handleAddressPick(address.id)}
                                disabled={selecting}
                                className="w-full text-left disabled:opacity-70"
                              >
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-bold text-slate-900">{address.fullName}</p>
                                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-600">
                                    {address.label}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-600">
                                  {address.line1}, {address.city}, {address.state} {address.postalCode}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">{address.phone}</p>
                              </button>

                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    setIsAddressOpen(false)
                                    navigate(`/addresses/${address.id}/edit`)
                                  }}
                                  className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
                                >
                                  <Pencil size={12} />
                                  Edit
                                </button>
                                <button
                                  onClick={(event) => handleAddressDelete(event, address.id)}
                                  className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                >
                                  <Trash2 size={12} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setIsAddressOpen(false)
                        navigate("/addresses/new")
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
                    >
                      <Plus size={14} />
                      Add new address
                    </button>
                  </div>
                )}
              </div>
            )}

            <Link to="/" className={`${iconButtonClass} order-2 md:ml-0.5`} aria-label="Home" title="Home">
              <Home size={20} />
            </Link>

            {isUser && (
              <Link to="/cart" className={`${iconButtonClass} order-3`} aria-label="Cart" title="Cart">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <div className="relative order-4" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className={iconButtonClass}
                aria-label="Profile menu"
                title="Profile"
              >
                <UserCircle2 size={20} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                  <div className="mb-1 rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Account</p>
                    <p className="text-sm font-semibold text-slate-800">{isAdmin ? "Administrator" : "User Menu"}</p>
                  </div>

                  {isLoggedIn ? (
                    <>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false)
                          navigate("/profile")
                        }}
                        className={menuItemClass}
                      >
                        <UserCircle2 size={16} />
                        My Profile
                      </button>

                      {isUser ? (
                        <>
                          <button
                            onClick={() => {
                              setIsProfileOpen(false)
                              navigate("/wishlist")
                            }}
                            className={menuItemClass}
                          >
                            <Heart size={16} />
                            Wishlist
                            {wishlistCount > 0 && (
                              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                {wishlistCount}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileOpen(false)
                              navigate("/orders")
                            }}
                            className={menuItemClass}
                          >
                            <PackageCheck size={16} />
                            My Orders
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setIsProfileOpen(false)
                            navigate("/admin")
                          }}
                          className={menuItemClass}
                        >
                          <Shield size={16} />
                          Admin Panel
                        </button>
                      )}

                      <div className="my-1 border-t border-[var(--border)]" />

                      <button
                        onClick={() => {
                          setIsProfileOpen(false)
                          handleLogout()
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false)
                          navigate("/login")
                        }}
                        className={menuItemClass}
                      >
                        <UserCircle2 size={16} />
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false)
                          navigate("/register")
                        }}
                        className={menuItemClass}
                      >
                        <Pencil size={16} />
                        Register
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
