/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react"
import api from "../api/axiosInstance"

const AddressContext = createContext(null)

const normalizeAddressPayload = (addressInput) => ({
  fullName: addressInput.fullName.trim(),
  phone: addressInput.phone.trim(),
  line1: addressInput.line1.trim(),
  line2: addressInput.line2.trim(),
  city: addressInput.city.trim(),
  state: addressInput.state.trim(),
  postalCode: addressInput.postalCode.trim(),
  landmark: addressInput.landmark.trim(),
  label: addressInput.label.trim() || "Home"
})

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)

  const loadAddresses = async () => {
    const hasSession =
      localStorage.getItem("token") || localStorage.getItem("refreshToken")

    if (!hasSession) {
      setAddresses([])
      return []
    }

    try {
      setLoadingAddresses(true)
      const response = await api.get("/addresses")
      const fetchedAddresses = response.data || []
      setAddresses(fetchedAddresses)
      return fetchedAddresses
    } catch (error) {
      console.log("Failed to load addresses:", error.response?.data || error.message)
      setAddresses([])
      return []
    } finally {
      setLoadingAddresses(false)
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  useEffect(() => {
    const handleAuthChanged = () => {
      loadAddresses()
    }

    window.addEventListener("auth-changed", handleAuthChanged)
    return () => window.removeEventListener("auth-changed", handleAuthChanged)
  }, [])

  const addAddress = async (addressInput) => {
    const payload = normalizeAddressPayload(addressInput)
    const response = await api.post("/addresses", payload)
    const newAddress = response.data

    setAddresses((prevAddresses) => [
      { ...newAddress, selected: true },
      ...prevAddresses
        .filter((address) => address.id !== newAddress.id)
        .map((address) => ({ ...address, selected: false }))
    ])

    return newAddress
  }

  const getAddressById = async (id) => {
    const existing = addresses.find((address) => String(address.id) === String(id))
    if (existing) return existing

    const response = await api.get(`/addresses/${id}`)
    return response.data
  }

  const updateAddress = async (id, addressInput) => {
    const payload = normalizeAddressPayload(addressInput)
    const response = await api.put(`/addresses/${id}`, payload)
    const updatedAddress = response.data

    setAddresses((prevAddresses) =>
      prevAddresses.map((address) =>
        address.id === updatedAddress.id
          ? { ...updatedAddress }
          : address
      )
    )

    return updatedAddress
  }

  const selectAddress = async (id) => {
    await api.put(`/addresses/${id}/select`)
    setAddresses((prevAddresses) =>
      prevAddresses.map((address) => ({
        ...address,
        selected: address.id === id
      }))
    )
  }

  const deleteAddress = async (id) => {
    await api.delete(`/addresses/${id}`)
    await loadAddresses()
  }

  const selectedAddress =
    addresses.find((address) => address.selected) || null

  const value = {
    addresses,
    selectedAddress,
    addAddress,
    getAddressById,
    updateAddress,
    selectAddress,
    deleteAddress,
    loadAddresses,
    loadingAddresses
  }

  return (
    <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
  )
}

export const useAddress = () => {
  const context = useContext(AddressContext)

  if (!context) {
    throw new Error("useAddress must be used within an AddressProvider")
  }

  return context
}
