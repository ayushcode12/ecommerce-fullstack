import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { UserPlus } from "lucide-react"
import api from "../api/axiosInstance"
import toast from "react-hot-toast"

const Register = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const nextErrors = {}

    if (!form.name.trim()) nextErrors.name = "Name is required"
    if (!form.email.includes("@")) nextErrors.email = "Enter a valid email"
    if (form.password.length < 6) nextErrors.password = "Password must be at least 6 characters"

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)
      await api.post("/auth/register", form)
      toast.success("Account created successfully")
      navigate("/login")
    } catch {
      toast.error("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-start overflow-hidden bg-gradient-to-br from-slate-900 via-rose-900 to-amber-900 px-3 py-4 sm:items-center sm:px-4 md:px-6 md:py-6">
      <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-rose-300/25 blur-3xl" />
      <div className="absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/95 shadow-2xl sm:rounded-[2rem] lg:min-h-[78vh] lg:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-amber-700 to-rose-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100">Create account</p>
          <div>
            <h1 className="mt-4 font-display text-5xl font-bold leading-tight">Build your signature style today.</h1>
            <p className="mt-4 max-w-md text-base text-amber-50">
              Register once to save addresses, place orders quickly, and track every purchase.
            </p>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/10 p-4 text-sm text-amber-50">
            Fast signup experience with a modern fashion checkout flow.
          </div>
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-6 md:p-10 lg:p-12">
          <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Register</h2>
          <p className="mt-2 text-sm text-slate-600">Create your Urban Threads account.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
            <label className="field-group">
              <span>Full Name</span>
              <input
                type="text"
                placeholder="John Sharma"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="field-input"
              />
              {errors.name && <small className="field-error">{errors.name}</small>}
            </label>

            <label className="field-group">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="field-input"
              />
              {errors.email && <small className="field-error">{errors.email}</small>}
            </label>

            <label className="field-group">
              <span>Password</span>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="field-input"
              />
              {errors.password && <small className="field-error">{errors.password}</small>}
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              <span className="inline-flex items-center gap-2">
                <UserPlus size={16} />
                {loading ? "Creating account..." : "Create account"}
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-rose-700 hover:text-rose-800">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register


