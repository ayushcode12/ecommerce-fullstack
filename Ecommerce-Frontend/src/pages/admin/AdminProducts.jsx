import { useEffect, useMemo, useState } from "react"
import { Plus, Save, Trash2, Upload, X } from "lucide-react"
import toast from "react-hot-toast"
import api from "../../api/axiosInstance"
import AdminShell from "../../components/admin/AdminShell"
import getApiErrorMessage from "../../utils/getApiErrorMessage"

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
  imageUrls: [""]
}

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [savingProduct, setSavingProduct] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [productForm, setProductForm] = useState(EMPTY_FORM)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [filePickerKey, setFilePickerKey] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [deletingImageUrl, setDeletingImageUrl] = useState("")
  const [originalImageUrls, setOriginalImageUrls] = useState([])

  useEffect(() => {
    document.title = "Admin Products | Urban Threads"
  }, [])

  const filePreviews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        key: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        url: URL.createObjectURL(file)
      })),
    [selectedFiles]
  )

  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [filePreviews])

  const fetchProducts = async (targetPage = 0) => {
    try {
      setLoadingProducts(true)
      const response = await api.get("/products", {
        params: {
          page: targetPage,
          size: 12,
          sortBy: "createdAt",
          direction: "desc",
          keyword: searchKeyword.trim() || undefined
        }
      })

      setProducts(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
      setPage(targetPage)
    } catch (error) {
      console.log("Failed to load products:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to load products"))
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories")
      setCategories(response.data || [])
    } catch (error) {
      console.log("Failed to load categories:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to load categories"))
    }
  }

  useEffect(() => {
    fetchProducts(0)
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setProductForm(EMPTY_FORM)
    setOriginalImageUrls([])
    setSelectedFiles([])
    setFilePickerKey((prevKey) => prevKey + 1)
  }

  const onEditProduct = (product) => {
    const images =
      Array.isArray(product.imageUrls) && product.imageUrls.length > 0
        ? product.imageUrls
        : product.imageUrl
          ? [product.imageUrl]
          : [""]

    setEditingId(product.id)
    setOriginalImageUrls(images.filter(Boolean))
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stockQuantity: product.stockQuantity?.toString() || "",
      categoryId: categories.find((category) => category.name === product.categoryName)?.id?.toString() || "",
      imageUrls: images
    })
  }

  const normalizedImageUrls = useMemo(
    () => productForm.imageUrls.map((url) => url.trim()).filter(Boolean),
    [productForm.imageUrls]
  )

  const isCloudinaryUrl = (url = "") => url.includes("res.cloudinary.com/")

  const addImageField = () => {
    setProductForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }))
  }

  const updateImageField = (index, value) => {
    setProductForm((prev) => {
      const nextImages = [...prev.imageUrls]
      nextImages[index] = value
      return { ...prev, imageUrls: nextImages }
    })
  }

  const deleteCloudinaryImages = async (imageUrls) => {
    const cloudinaryUrls = (imageUrls || []).map((url) => url.trim()).filter((url) => isCloudinaryUrl(url))
    if (cloudinaryUrls.length === 0) return

    await api.delete("/uploads/images", {
      data: {
        imageUrls: cloudinaryUrls
      }
    })
  }

  const removeImageField = async (index) => {
    const imageUrl = productForm.imageUrls[index]?.trim() || ""
    const isCloudImage = isCloudinaryUrl(imageUrl)

    try {
      if (isCloudImage) {
        setDeletingImageUrl(imageUrl)
        await deleteCloudinaryImages([imageUrl])
      }

      setProductForm((prev) => {
        const nextImages = prev.imageUrls.filter((_, currentIndex) => currentIndex !== index)
        return { ...prev, imageUrls: nextImages.length > 0 ? nextImages : [""] }
      })
    } catch (error) {
      console.log("Failed to remove image from Cloudinary:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to remove image"))
    } finally {
      setDeletingImageUrl("")
    }
  }

  const buildPayload = () => ({
    name: productForm.name.trim(),
    description: productForm.description.trim(),
    price: Number(productForm.price),
    stockQuantity: Number(productForm.stockQuantity),
    categoryId: Number(productForm.categoryId),
    imageUrls: normalizedImageUrls
  })

  const upsertSelectedFiles = (incomingFiles) => {
    const imageFiles = (incomingFiles || []).filter((file) => file.type?.startsWith("image/"))
    if (imageFiles.length === 0) {
      toast.error("Please select image files only")
      return
    }

    setSelectedFiles((previousFiles) => {
      const byKey = new Map(previousFiles.map((file) => [`${file.name}-${file.size}-${file.lastModified}`, file]))
      imageFiles.forEach((file) => byKey.set(`${file.name}-${file.size}-${file.lastModified}`, file))
      return Array.from(byKey.values())
    })
  }

  const onUploadSelectedImages = async () => {
    if (!selectedFiles.length) {
      toast.error("Please choose image files to upload")
      return
    }

    const formData = new FormData()
    selectedFiles.forEach((file) => formData.append("files", file))

    try {
      setUploadingImages(true)
      const response = await api.post("/uploads/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      const uploadedUrls = response.data?.imageUrls || []
      if (uploadedUrls.length === 0) {
        toast.error("Image upload failed")
        return
      }

      setProductForm((prev) => {
        const existing = prev.imageUrls.map((url) => url.trim()).filter(Boolean)
        const merged = [...new Set([...existing, ...uploadedUrls])]
        return { ...prev, imageUrls: merged.length > 0 ? merged : [""] }
      })

      setSelectedFiles([])
      setFilePickerKey((prevKey) => prevKey + 1)
      toast.success(`Uploaded ${uploadedUrls.length} image${uploadedUrls.length === 1 ? "" : "s"}`)
    } catch (error) {
      console.log("Failed to upload images:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to upload images"))
    } finally {
      setUploadingImages(false)
    }
  }

  const onSaveProduct = async (event) => {
    event.preventDefault()
    const payload = buildPayload()

    if (!payload.name || !payload.categoryId || payload.price <= 0 || payload.stockQuantity < 0) {
      toast.error("Fill name, category, valid price, and stock before saving.")
      return
    }

    const removedCloudinaryUrls = originalImageUrls
      .map((url) => url.trim())
      .filter((url) => isCloudinaryUrl(url) && !payload.imageUrls.includes(url))

    try {
      setSavingProduct(true)
      if (editingId) {
        await api.put(`/products/${editingId}`, payload)
        toast.success("Product updated")

        if (removedCloudinaryUrls.length > 0) {
          try {
            await deleteCloudinaryImages(removedCloudinaryUrls)
          } catch (cleanupError) {
            console.log("Failed to cleanup removed images:", cleanupError.response?.data || cleanupError.message)
            toast.error("Product updated, but some old Cloudinary images were not removed")
          }
        }
      } else {
        await api.post("/products", payload)
        toast.success("Product created")
      }

      resetForm()
      await fetchProducts(page)
    } catch (error) {
      console.log("Failed to save product:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to save product"))
    } finally {
      setSavingProduct(false)
    }
  }

  const onDeleteProduct = async (product) => {
    const shouldDelete = window.confirm("Delete this product?")
    if (!shouldDelete) return

    try {
      await api.delete(`/products/${product.id}`)

      const productImageUrls =
        Array.isArray(product.imageUrls) && product.imageUrls.length > 0
          ? product.imageUrls
          : product.imageUrl
            ? [product.imageUrl]
            : []

      if (productImageUrls.length > 0) {
        try {
          await deleteCloudinaryImages(productImageUrls)
        } catch (cleanupError) {
          console.log("Failed to cleanup product images:", cleanupError.response?.data || cleanupError.message)
          toast.error("Product deleted, but some Cloudinary images were not removed")
        }
      }

      toast.success("Product deleted")
      await fetchProducts(page)
    } catch (error) {
      console.log("Failed to delete product:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to delete product"))
    }
  }

  const onSearchSubmit = async (event) => {
    event.preventDefault()
    await fetchProducts(0)
  }

  const onCreateCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) {
      toast.error("Enter category name")
      return
    }

    try {
      setCreatingCategory(true)
      const response = await api.post("/categories", { name })
      const createdCategory = response.data

      setCategories((prev) => [...prev, createdCategory].sort((a, b) => a.name.localeCompare(b.name)))
      setProductForm((prev) => ({ ...prev, categoryId: String(createdCategory.id) }))
      setNewCategoryName("")
      toast.success("Category created")
    } catch (error) {
      console.log("Failed to create category:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Failed to create category"))
    } finally {
      setCreatingCategory(false)
    }
  }

  return (
    <AdminShell
      title="Product Management"
      subtitle="Create, edit, and maintain the full product catalog with multi-image support."
      actions={
        <button
          onClick={resetForm}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <Plus size={15} />
          New Product
        </button>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="surface-card rounded-2xl p-4 sm:p-5 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-slate-900">Products</h2>
            <form onSubmit={onSearchSubmit} className="flex w-full max-w-sm flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <input
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="Search by name"
                className="field-input"
              />
              <button type="submit" className="btn-primary px-4 py-2 text-sm sm:w-auto">
                Search
              </button>
            </form>
          </div>

          {loadingProducts ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-xl border border-[var(--border)] p-3">
                  <div className="h-4 w-48 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 p-8 text-center text-sm text-slate-600">
              No products found.
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      #{product.id} - {product.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {product.categoryName} | Rs {product.price} | Stock {product.stockQuantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                disabled={page === 0}
                onClick={() => fetchProducts(page - 1)}
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs font-semibold text-slate-500">
                Page {page + 1} / {totalPages}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => fetchProducts(page + 1)}
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>

        <section className="surface-card rounded-2xl p-4 sm:p-5 md:p-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            {editingId ? `Edit Product #${editingId}` : "Create Product"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">Upload from your device to Cloudinary or paste image URLs manually.</p>

          <form onSubmit={onSaveProduct} className="mt-4 space-y-4">
            <label className="field-group">
              <span>Name</span>
              <input
                value={productForm.name}
                onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                className="field-input"
                required
              />
            </label>

            <label className="field-group">
              <span>Description</span>
              <textarea
                value={productForm.description}
                onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={4}
                className="field-input resize-none"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="field-group">
                <span>Price</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={productForm.price}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="field-input"
                  required
                />
              </label>

              <label className="field-group">
                <span>Stock</span>
                <input
                  type="number"
                  min="0"
                  value={productForm.stockQuantity}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, stockQuantity: event.target.value }))}
                  className="field-input"
                  required
                />
              </label>
            </div>

            <label className="field-group">
              <span>Category</span>
              <select
                value={productForm.categoryId}
                onChange={(event) => setProductForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                className="field-input"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <input
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Create new category"
                  className="field-input"
                />
                <button
                  type="button"
                  disabled={creatingCategory}
                  onClick={onCreateCategory}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {creatingCategory ? "Creating..." : "Add"}
                </button>
              </div>
            </label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Product Images</p>
                <button
                  type="button"
                  onClick={addImageField}
                  className="rounded-lg border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-rose-200 hover:text-rose-700"
                >
                  Add URL Field
                </button>
              </div>

              <div
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragActive(false)
                  upsertSelectedFiles(Array.from(event.dataTransfer.files || []))
                }}
                className={`rounded-xl border-2 border-dashed p-4 text-center transition ${
                  dragActive ? "border-rose-300 bg-rose-50" : "border-[var(--border)] bg-white"
                }`}
              >
                <p className="text-sm font-semibold text-slate-700">Drag and drop images here</p>
                <p className="mt-1 text-xs text-slate-500">or choose files from your device</p>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <input
                    key={filePickerKey}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => upsertSelectedFiles(Array.from(event.target.files || []))}
                    className="field-input max-w-sm"
                  />
                  <button
                    type="button"
                    disabled={uploadingImages || selectedFiles.length === 0}
                    onClick={onUploadSelectedImages}
                    className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    <Upload size={14} />
                    {uploadingImages ? "Uploading..." : "Upload to Cloudinary"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} selected`
                    : "Only image files are accepted."}
                </p>
              </div>

              {filePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {filePreviews.map((preview, index) => (
                    <div key={preview.key} className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
                      <img src={preview.url} alt={preview.name} className="h-24 w-full object-cover" />
                      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                        <p className="truncate text-[11px] text-slate-600">{preview.name}</p>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
                          }
                          className="rounded-md border border-rose-200 bg-rose-50 p-1 text-rose-700"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {productForm.imageUrls.map((imageUrl, index) => (
                <div key={index} className="rounded-xl border border-[var(--border)] bg-white p-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="h-16 w-16 overflow-hidden rounded-lg border border-[var(--border)] bg-slate-100">
                      <img
                        src={imageUrl || "/fallback.svg"}
                        alt={`Product preview ${index + 1}`}
                        onError={(event) => {
                          event.target.src = "/fallback.svg"
                        }}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <input
                      value={imageUrl}
                      onChange={(event) => updateImageField(index, event.target.value)}
                      placeholder="https://..."
                      className="field-input"
                    />

                    <button
                      type="button"
                      disabled={deletingImageUrl === imageUrl}
                      onClick={() => removeImageField(index)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingImageUrl === imageUrl ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="submit" disabled={savingProduct} className="btn-primary inline-flex items-center justify-center gap-2">
                <Save size={14} />
                {savingProduct ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </AdminShell>
  )
}

export default AdminProducts
