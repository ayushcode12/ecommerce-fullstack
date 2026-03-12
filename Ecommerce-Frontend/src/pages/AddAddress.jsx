import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Home, MapPin, MapPinned } from "lucide-react"
import toast from "react-hot-toast"
import { useAddress } from "../context/AddressContext"
import getApiErrorMessage from "../utils/getApiErrorMessage"

const INITIAL_FORM = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  landmark: "",
  label: "Home"
}

const AddAddress = () => {
  const navigate = useNavigate()
  const { addressId } = useParams()
  const isEditMode = Boolean(addressId)
  const { addAddress, updateAddress, getAddressById } = useAddress()

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [loadingAddress, setLoadingAddress] = useState(isEditMode)

  useEffect(() => {
    const loadAddress = async () => {
      if (!isEditMode) {
        setLoadingAddress(false)
        return
      }

      try {
        const address = await getAddressById(addressId)
        setForm({
          fullName: address.fullName || "",
          phone: address.phone || "",
          line1: address.line1 || "",
          line2: address.line2 || "",
          city: address.city || "",
          state: address.state || "",
          postalCode: address.postalCode || "",
          landmark: address.landmark || "",
          label: address.label || "Home"
        })
      } catch (error) {
        console.log("Failed to load address:", error.response?.data || error.message)
        toast.error(getApiErrorMessage(error, "Failed to load address."))
        navigate("/")
      } finally {
        setLoadingAddress(false)
      }
    }

    loadAddress()
  }, [isEditMode, addressId, getAddressById, navigate])

  const isValidForm = useMemo(
    () =>
      form.fullName.trim() &&
      form.phone.trim() &&
      form.line1.trim() &&
      form.city.trim() &&
      form.state.trim() &&
      form.postalCode.trim(),
    [form]
  )

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.fullName.trim()) nextErrors.fullName = "Recipient name is required."
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required."
    if (!/^\d{10}$/.test(form.phone.trim())) {
      nextErrors.phone = "Enter a valid 10-digit phone number."
    }
    if (!form.line1.trim()) nextErrors.line1 = "Address line 1 is required."
    if (!form.city.trim()) nextErrors.city = "City is required."
    if (!form.state.trim()) nextErrors.state = "State is required."
    if (!/^\d{6}$/.test(form.postalCode.trim())) {
      nextErrors.postalCode = "PIN code must be a 6-digit number."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async (event) => {
    event.preventDefault()

    if (!validate()) return

    try {
      setIsSaving(true)
      if (isEditMode) {
        await updateAddress(addressId, form)
        toast.success("Address updated successfully.")
      } else {
        await addAddress(form)
        toast.success("Address saved successfully.")
      }
      navigate("/")
    } catch (error) {
      console.log("Failed to save address:", error.response?.data || error.message)
      const apiFieldErrors = error.response?.data?.fieldErrors
      if (apiFieldErrors && typeof apiFieldErrors === "object") {
        setErrors((prevErrors) => ({ ...prevErrors, ...apiFieldErrors }))
      }
      toast.error(getApiErrorMessage(error, "Failed to save address."))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-4 sm:py-6 md:px-6 md:py-10 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur hover:bg-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-5 shadow-xl backdrop-blur sm:p-6 md:p-8">
          <div className="mb-6 sm:mb-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              <MapPinned size={14} />
              Delivery Address
            </p>
            <h1 className="mt-3 font-display text-2xl text-slate-900 sm:text-3xl md:text-4xl">
              {isEditMode ? "Edit Address" : "Add New Address"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Save this address to quickly select it from the navbar popup.
            </p>
          </div>

          {loadingAddress ? (
            <div className="py-8 text-center text-slate-600">Loading address...</div>
          ) : (
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="field-group">
                <span>Full name</span>
                <input
                  value={form.fullName}
                  onChange={(e) => handleFieldChange("fullName", e.target.value)}
                  placeholder="John Sharma"
                  className="field-input"
                />
                {errors.fullName && <small className="field-error">{errors.fullName}</small>}
              </label>

              <label className="field-group">
                <span>Phone number</span>
                <input
                  value={form.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="9876543210"
                  className="field-input"
                />
                {errors.phone && <small className="field-error">{errors.phone}</small>}
              </label>
            </div>

            <label className="field-group">
              <span>Address line 1</span>
              <input
                value={form.line1}
                onChange={(e) => handleFieldChange("line1", e.target.value)}
                placeholder="House no., street, locality"
                className="field-input"
              />
              {errors.line1 && <small className="field-error">{errors.line1}</small>}
            </label>

            <label className="field-group">
              <span>Address line 2 (optional)</span>
              <input
                value={form.line2}
                onChange={(e) => handleFieldChange("line2", e.target.value)}
                placeholder="Apartment, floor, block"
                className="field-input"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="field-group">
                <span>City</span>
                <input
                  value={form.city}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                  placeholder="Agra"
                  className="field-input"
                />
                {errors.city && <small className="field-error">{errors.city}</small>}
              </label>

              <label className="field-group">
                <span>State</span>
                <input
                  value={form.state}
                  onChange={(e) => handleFieldChange("state", e.target.value)}
                  placeholder="Uttar Pradesh"
                  className="field-input"
                />
                {errors.state && <small className="field-error">{errors.state}</small>}
              </label>

              <label className="field-group">
                <span>PIN code</span>
                <input
                  value={form.postalCode}
                  onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                  placeholder="282001"
                  className="field-input"
                />
                {errors.postalCode && <small className="field-error">{errors.postalCode}</small>}
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="field-group">
                <span>Landmark (optional)</span>
                <input
                  value={form.landmark}
                  onChange={(e) => handleFieldChange("landmark", e.target.value)}
                  placeholder="Near city mall"
                  className="field-input"
                />
              </label>

              <label className="field-group">
                <span>Address label</span>
                <select
                  value={form.label}
                  onChange={(e) => handleFieldChange("label", e.target.value)}
                  className="field-input"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 text-sm text-slate-700">
              <p className="inline-flex items-center gap-2 font-semibold text-slate-900">
                <Home size={15} />
                This address appears in your navbar selector.
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-slate-600">
                <MapPin size={14} />
                You can switch saved addresses instantly before checkout.
              </p>
            </div>

            <button
              type="submit"
              disabled={!isValidForm || isSaving}
              className="btn-primary w-full"
            >
              {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Save Address"}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddAddress
