import { useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { KeyRound, Lock } from "lucide-react"
import toast from "react-hot-toast"
import api from "../api/axiosInstance"
import getApiErrorMessage from "../utils/getApiErrorMessage"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const presetToken = useMemo(() => searchParams.get("token") || "", [searchParams])

  const [token, setToken] = useState(presetToken)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!token.trim()) {
      toast.error("Reset token is required")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      setLoading(true)
      await api.post("/auth/reset-password", {
        token,
        newPassword
      })
      toast.success("Password reset successful. Please login.")
      navigate("/login")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to reset password"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-start overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 px-3 py-4 sm:items-center sm:px-4 md:px-6 md:py-6">
      <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-white/20 bg-white p-6 shadow-2xl sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
          <KeyRound size={12} />
          Reset Password
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">Choose a new password</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="field-group">
            <span>Reset Token</span>
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Paste token here"
              className="field-input font-mono"
            />
          </label>

          <label className="field-group">
            <span>New Password</span>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Minimum 6 characters"
                className="field-input pl-10"
              />
            </div>
          </label>

          <label className="field-group">
            <span>Confirm Password</span>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Retype password"
                className="field-input pl-10"
              />
            </div>
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Need a token?{" "}
          <Link to="/forgot-password" className="font-semibold text-cyan-700 hover:text-cyan-800">
            Forgot password
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
