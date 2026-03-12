import { useEffect, useMemo, useState } from "react"
import { Plus, Save, Trash2 } from "lucide-react"
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
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [productForm, setProductForm] = useState(EMPTY_FORM)
  const [newCategoryName, setNewCategoryName] = useState("")

  useEffect(() => {
    document.title = "Admin Products | Home Chemicals"
  }, [])

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
  }

  const onEditProduct = (product) => {
    setEditingId(product.id)
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stockQuantity: product.stockQuantity?.toString() || "",
      categoryId: categories.find((category) => category.name === product.categoryName)?.id?.toString() || "",
      imageUrls:
        Array.isArray(product.imageUrls) && product.imageUrls.length > 0
          ? product.imageUrls
          : product.imageUrl
            ? [product.imageUrl]
            : [""]
    })
  }

  const normalizedImageUrls = useMemo(
    () => productForm.imageUrls.map((url) => url.trim()).filter(Boolean),
    [productForm.imageUrls]
  )

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

  const removeImageField = (index) => {
    setProductForm((prev) => {
      const nextImages = prev.imageUrls.filter((_, currentIndex) => currentIndex !== index)
      return { ...prev, imageUrls: nextImages.length ? nextImages : [""] }
    })
  }

  const buildPayload = () => ({
    name: productForm.name.trim(),
    description: productForm.description.trim(),
    price: Number(productForm.price),
    stockQuantity: Number(productForm.stockQuantity),
    categoryId: Number(productForm.categoryId),
    imageUrls: normalizedImageUrls
  })

  const onSaveProduct = async (event) => {
    event.preventDefault()
    const payload = buildPayload()

    if (!payload.name || !payload.categoryId || payload.price <= 0 || payload.stockQuantity < 0) {
      toast.error("Fill name, category, valid price, and stock before saving.")
      return
    }

    try {
      setSavingProduct(true)
      if (editingId) {
        await api.put(`/products/${editingId}`, payload)
        toast.success("Product updated")
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

  const onDeleteProduct = async (id) => {
    const shouldDelete = window.confirm("Delete this product?")
    if (!shouldDelete) return

    try {
      await api.delete(`/products/${id}`)
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
          className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
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
                      className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
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
          <p className="mt-1 text-sm text-slate-600">Use multiple image URLs for gallery-ready product pages.</p>

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
                  className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {creatingCategory ? "Creating..." : "Add"}
                </button>
              </div>
            </label>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Image URLs</p>
                <button
                  type="button"
                  onClick={addImageField}
                  className="rounded-lg border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-teal-200 hover:text-teal-700"
                >
                  Add image
                </button>
              </div>

              {productForm.imageUrls.map((imageUrl, index) => (
                <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={imageUrl}
                    onChange={(event) => updateImageField(index, event.target.value)}
                    placeholder="https://..."
                    className="field-input"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-semibold text-rose-700"
                  >
                    Remove
                  </button>
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
