import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../api/axiosInstance"
import toast from "react-hot-toast"

const Login = () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const navigate = useNavigate()

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      navigate("/")
    }
  }, [])

  const validate = () => {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!email.includes("@")) {
      newErrors.email = "Enter valid email"
    }

    if (!password.trim()) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Minimum 6 characters required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)

      const response = await api.post("/auth/login", {
        email,
        password
      })

      const { token, role } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("role", role)

      toast.success("Login successful!")

      navigate("/")

    } catch (error) {
      console.log("Login failed:", error.response?.data || error.message)
      toast.error("Invalid credentials")
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
            Welcome Back
          </h2>
          <p className="text-slate-500">
            Login to continue shopping
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition shadow-md ${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-sm text-slate-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-emerald-600 font-semibold">
            Register
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login