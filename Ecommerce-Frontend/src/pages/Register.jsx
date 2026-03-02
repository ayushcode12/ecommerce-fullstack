import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
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
    const newErrors = {}

    if (!form.name.trim()) newErrors.name = "Name is required"

    if (!form.email.includes("@"))
      newErrors.email = "Enter valid email"

    if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters"

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)

      await api.post("/auth/register", form)

      toast.success("Account created successfully!")
      navigate("/login")

    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">

      <div className="absolute w-[400px] h-[400px] bg-emerald-500 opacity-20 blur-3xl rounded-full animate-pulse"></div>

      <div className="relative bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl space-y-8">

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-800">
            Create Account
          </h2>
          <p className="text-slate-500">
            Join us and start shopping
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition ${
              loading
                ? "bg-slate-400"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {loading ? "Creating..." : "Register"}
          </button>

        </form>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 font-semibold">
            Login
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register