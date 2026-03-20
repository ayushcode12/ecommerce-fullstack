import { useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { KeyRound, Lock, Mail, ShieldCheck } from "lucide-react"
import toast from "react-hot-toast"
import api from "../api/axiosInstance"
import getApiErrorMessage from "../utils/getApiErrorMessage"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const presetEmail = useMemo(() => searchParams.get("email") || "", [searchParams])

  const [email, setEmail] = useState(presetEmail)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim()) {
      toast.error("Please enter your email")
      return
    }
    if (!otp.trim()) {
      toast.error("Please enter OTP")
      return
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error("OTP must be 6 digits")
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
        email: email.trim(),
        otp: otp.trim(),
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
        <p className="mt-2 text-sm text-slate-600">
          Enter your email, the OTP received on email, and then set a secure new password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="field-group">
            <span>Email</span>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="field-input field-input-icon"
              />
            </div>
          </label>

          <label className="field-group">
            <span>OTP</span>
            <div className="relative">
              <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) => {
                  const sanitizedValue = event.target.value.replace(/\D/g, "").slice(0, 6)
                  setOtp(sanitizedValue)
                }}
                placeholder="Enter 6-digit OTP"
                className="field-input field-input-icon font-mono tracking-[0.2em]"
              />
            </div>
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
                className="field-input field-input-icon"
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
                className="field-input field-input-icon"
              />
            </div>
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Need a fresh OTP?{" "}
          <Link to="/forgot-password" className="font-semibold text-cyan-700 hover:text-cyan-800">
            Forgot password
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
