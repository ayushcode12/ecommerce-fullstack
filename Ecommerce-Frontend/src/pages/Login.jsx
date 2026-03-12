import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { LogIn } from "lucide-react"
import api from "../api/axiosInstance"
import toast from "react-hot-toast"
import getApiErrorMessage from "../utils/getApiErrorMessage"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      navigate("/")
    }
  }, [navigate])

  const validate = () => {
    const nextErrors = {}

    if (!email.trim()) {
      nextErrors.email = "Email is required"
    } else if (!email.includes("@")) {
      nextErrors.email = "Enter a valid email"
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required"
    } else if (password.length < 6) {
      nextErrors.password = "Minimum 6 characters required"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)
      const response = await api.post("/auth/login", { email, password })
      const { token, role, refreshToken } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("role", role)
      window.dispatchEvent(new Event("auth-changed"))

      toast.success("Login successful")
      navigate("/")
    } catch (error) {
      console.log("Login failed:", error.response?.data || error.message)
      toast.error(getApiErrorMessage(error, "Invalid credentials"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 px-4 py-4 md:px-6 md:py-6">
      <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-teal-300/25 blur-3xl" />
      <div className="absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/95 shadow-2xl lg:min-h-[78vh] lg:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-teal-600 to-cyan-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-100">Welcome back</p>
          <div>
            <h1 className="mt-4 font-display text-5xl font-bold leading-tight">Clean home, less effort.</h1>
            <p className="mt-4 max-w-md text-base text-teal-50">
              Login to continue with saved addresses, your cart, and order tracking.
            </p>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/10 p-4 text-sm text-teal-50">
            Trusted checkout experience with secure ordering.
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
          <h2 className="font-display text-3xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-2 text-sm text-slate-600">Access your Home Chemicals account.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <label className="field-group">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field-input"
              />
              {errors.email && <small className="field-error">{errors.email}</small>}
            </label>

            <label className="field-group">
              <span>Password</span>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field-input"
              />
              {errors.password && <small className="field-error">{errors.password}</small>}
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              <span className="inline-flex items-center gap-2">
                <LogIn size={16} />
                {loading ? "Signing in..." : "Sign in"}
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Do not have an account?{" "}
            <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
