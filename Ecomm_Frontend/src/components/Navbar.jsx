import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ChevronDown,
  Home,
  MapPin,
  PackageCheck,
  Pencil,
  Plus,
  Shield,
  ShoppingCart,
  Store,
  Trash2
} from "lucide-react"
import { useAddress } from "../context/AddressContext"
import toast from "react-hot-toast"
import api from "../api/axiosInstance"
import getApiErrorMessage from "../utils/getApiErrorMessage"

function Navbar({ cartCount }) {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")
  const { addresses, selectedAddress, selectAddress, deleteAddress, loadAddresses } = useAddress()

  const [isAddressOpen, setIsAddressOpen] = useState(false)
  const addressMenuRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        addressMenuRef.current &&
        !addressMenuRef.current.contains(event.target)
      ) {
        setIsAddressOpen(false)
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

  const handleAddressPick = async (id) => {
    try {
      await selectAddress(id)
      setIsAddressOpen(false)
    } catch (error) {
      console.log("Failed to select address:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to select address"))
    }
  }

  const handleAddressDelete = async (event, id) => {
    event.stopPropagation()

    const shouldDelete = window.confirm("Delete this address?")
    if (!shouldDelete) return

    try {
      await deleteAddress(id)
      toast.success("Address deleted")
    } catch (error) {
      console.log("Failed to delete address:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to delete address"))
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:gap-3 md:px-6 md:py-4 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-slate-900 sm:text-xl md:text-2xl"
        >
          Urban <span className="text-rose-600">Threads</span>
          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-rose-700">
            Fashion Store
          </span>
        </Link>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:justify-start sm:gap-3 md:gap-4">
          {role !== "ADMIN" && (
            <div className="relative order-1 w-full sm:order-none sm:w-auto" ref={addressMenuRef}>
              <button
                onClick={() => {
                  const shouldOpen = !isAddressOpen
                  setIsAddressOpen(shouldOpen)
                  if (shouldOpen) {
                    loadAddresses()
                  }
                }}
                className="flex w-full items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2.5 text-left text-slate-800 shadow-sm transition hover:shadow sm:max-w-[320px]"
              >
                <MapPin size={16} className="text-rose-600" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Deliver to
                  </p>
                  <p className="truncate text-sm font-semibold">{selectedAddressSummary}</p>
                </div>
                <ChevronDown size={16} className="text-slate-500" />
              </button>

              {isAddressOpen && (
                <div className="absolute left-0 z-50 mt-3 w-[min(92vw,320px)] rounded-2xl border border-[var(--border)] bg-white p-3 shadow-2xl sm:left-auto sm:right-0 sm:w-80">
                  <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Saved addresses
                  </p>

                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {addresses.length === 0 && (
                      <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 p-3 text-sm text-slate-600">
                        No saved address yet.
                      </div>
                    )}

                    {addresses.map((address) => {
                      const active = selectedAddress?.id === address.id

                      return (
                        <div
                          key={address.id}
                          className={`w-full rounded-xl border p-3 transition ${
                            active
                              ? "border-rose-300 bg-rose-50"
                              : "border-[var(--border)] hover:bg-slate-50"
                          }`}
                        >
                          <button
                            onClick={() => handleAddressPick(address.id)}
                            className="w-full text-left"
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
                              className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
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
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setIsAddressOpen(false)
                      navigate("/addresses/new")
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    <Plus size={14} />
                    Add new address
                  </button>
                </div>
              )}
            </div>
          )}

          {role !== "ADMIN" && (
            <Link
              to="/products"
              className="order-2 inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700 sm:order-none"
            >
              <Store size={16} />
              Shop
            </Link>
          )}

          <Link
            to="/"
            className="order-2 rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-rose-700 sm:order-none"
          >
            <Home size={22} />
          </Link>

          {role !== "ADMIN" && (
            <Link
              to="/cart"
              className="relative order-2 rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-rose-700 sm:order-none"
            >
              <ShoppingCart size={22} />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1.5 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {token && role !== "ADMIN" && (
            <Link
              to="/orders"
              className="order-2 rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-rose-700 sm:order-none"
            >
              <PackageCheck size={22} />
            </Link>
          )}

          {token && role === "ADMIN" && (
            <Link
              to="/admin"
              className="order-2 inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-100 sm:order-none"
            >
              <Shield size={14} />
              Admin
            </Link>
          )}

          {token ? (
            <button
              onClick={handleLogout}
              className="order-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 sm:order-none"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="btn-primary order-2 text-sm sm:order-none"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
