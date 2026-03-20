import { useState } from "react"
import { Link } from "react-router-dom"
import { KeyRound, Mail } from "lucide-react"
import toast from "react-hot-toast"
import api from "../api/axiosInstance"
import getApiErrorMessage from "../utils/getApiErrorMessage"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")
  const [submittedEmail, setSubmittedEmail] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!email.trim()) {
      toast.error("Please enter your email")
      return
    }

    try {
      setLoading(true)
      const response = await api.post("/auth/forgot-password", { email })
      const message = response.data?.message || "If this email exists, OTP has been sent."
      setResponseMessage(message)
      setSubmittedEmail(email.trim())
      toast.success(message)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to start reset flow"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-start overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 px-3 py-4 sm:items-center sm:px-4 md:px-6 md:py-6">
      <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-white/20 bg-white p-6 shadow-2xl sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
          <KeyRound size={12} />
          Forgot Password
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your registered email. A 6-digit OTP will be sent for password reset.
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

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        {responseMessage && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">{responseMessage}</p>
            <Link
              to={`/reset-password${submittedEmail ? `?email=${encodeURIComponent(submittedEmail)}` : ""}`}
              className="mt-3 inline-flex items-center rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              Continue to OTP Verification
            </Link>
          </div>
        )}

        <p className="mt-5 text-sm text-slate-600">
          Back to{" "}
          <Link to="/login" className="font-semibold text-cyan-700 hover:text-cyan-800">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
