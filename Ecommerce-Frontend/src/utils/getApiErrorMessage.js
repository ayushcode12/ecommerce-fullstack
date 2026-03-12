const getApiErrorMessage = (error, fallbackMessage = "Something went wrong.") => {
  const responseData = error?.response?.data

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData
  }

  if (responseData?.message && typeof responseData.message === "string") {
    return responseData.message
  }

  if (responseData?.fieldErrors && typeof responseData.fieldErrors === "object") {
    const firstFieldError = Object.values(responseData.fieldErrors).find(
      (message) => typeof message === "string" && message.trim()
    )
    if (firstFieldError) return firstFieldError
  }

  if (error?.message && typeof error.message === "string") {
    return error.message
  }

  return fallbackMessage
}

export default getApiErrorMessage
