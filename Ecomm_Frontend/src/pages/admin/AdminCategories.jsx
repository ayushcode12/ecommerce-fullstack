import { useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Save, Trash2, X } from "lucide-react"
import toast from "react-hot-toast"
import api from "../../api/axiosInstance"
import AdminShell from "../../components/admin/AdminShell"
import getApiErrorMessage from "../../utils/getApiErrorMessage"

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")

  useEffect(() => {
    document.title = "Admin Categories | Urban Threads"
  }, [])

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  )

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.get("/categories")
      setCategories(response.data || [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load categories"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const onCreateCategory = async () => {
    const name = newName.trim()
    if (!name) {
      toast.error("Enter category name")
      return
    }

    try {
      setCreating(true)
      const response = await api.post("/categories", { name })
      setCategories((prev) => [...prev, response.data])
      setNewName("")
      toast.success("Category created")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create category"))
    } finally {
      setCreating(false)
    }
  }

  const onStartEdit = (category) => {
    setEditingId(category.id)
    setEditName(category.name)
  }

  const onSaveEdit = async () => {
    const name = editName.trim()
    if (!name || !editingId) return

    try {
      setSaving(true)
      const response = await api.put(`/categories/${editingId}`, { name })
      setCategories((prev) =>
        prev.map((category) => (category.id === editingId ? response.data : category))
      )
      setEditingId(null)
      setEditName("")
      toast.success("Category updated")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update category"))
    } finally {
      setSaving(false)
    }
  }

  const onDeleteCategory = async (category) => {
    const shouldDelete = window.confirm(`Delete "${category.name}" category?`)
    if (!shouldDelete) return

    try {
      setDeletingId(category.id)
      await api.delete(`/categories/${category.id}`)
      setCategories((prev) => prev.filter((item) => item.id !== category.id))
      toast.success("Category deleted")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete category"))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminShell
      title="Category Management"
      subtitle="Create, rename, and clean up categories from one dedicated admin screen."
    >
      <section className="surface-card rounded-2xl p-4 sm:p-5 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="New category name"
            className="field-input"
          />
          <button
            onClick={onCreateCategory}
            disabled={creating}
            className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={14} />
            {creating ? "Creating..." : "Add Category"}
          </button>
        </div>
      </section>

      <section className="surface-card rounded-2xl p-4 sm:p-5 md:p-6">
        <h2 className="font-display text-2xl font-bold text-slate-900">All Categories</h2>
        <p className="mt-1 text-sm text-slate-600">Delete is blocked automatically when category has linked products.</p>

        {loading ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-xl border border-[var(--border)] p-3">
                <div className="h-4 w-40 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : sortedCategories.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-slate-50 p-8 text-center text-sm text-slate-600">
            No categories yet.
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {sortedCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  {editingId === category.id ? (
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      className="field-input max-w-sm"
                    />
                  ) : (
                    <p className="truncate font-semibold text-slate-900">
                      #{category.id} - {category.name}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Products linked: {Number(category.productCount || 0)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {editingId === category.id ? (
                    <>
                      <button
                        onClick={onSaveEdit}
                        disabled={saving}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save size={12} />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditName("")
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        <X size={12} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onStartEdit(category)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
                    >
                      <Pencil size={12} />
                      Rename
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteCategory(category)}
                    disabled={deletingId === category.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={12} />
                    {deletingId === category.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  )
}

export default AdminCategories
