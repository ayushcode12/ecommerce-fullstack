import { useEffect, useState } from "react"
import { KeyRound, UserCircle2 } from "lucide-react"
import toast from "react-hot-toast"
import api from "../api/axiosInstance"
import getApiErrorMessage from "../utils/getApiErrorMessage"

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [name, setName] = useState("")
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  useEffect(() => {
    document.title = "My Profile | Urban Threads"
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get("/users/me")
      const data = response.data
      setProfile(data)
      setName(data?.name || "")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load profile"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const onUpdateName = async (event) => {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("Name cannot be empty")
      return
    }
    try {
      setSavingProfile(true)
      const response = await api.put("/users/me", { name })
      setProfile(response.data)
      toast.success("Profile updated")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update profile"))
    } finally {
      setSavingProfile(false)
    }
  }

  const onChangePassword = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      setSavingPassword(true)
      await api.patch("/users/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("role")
      window.dispatchEvent(new Event("auth-changed"))
      toast.success("Password changed. Please login again.")
      window.location.href = "/login"
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to change password"))
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="page-wrap">
        <div className="mx-auto w-full max-w-[1000px] px-4 py-10">
          <div className="surface-card animate-pulse rounded-3xl p-8">
            <div className="h-6 w-48 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-72 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto w-full max-w-[1050px] space-y-6 px-3 py-5 sm:px-4 sm:py-6 md:px-6 md:py-10 lg:px-8">
        <section className="surface-card rounded-3xl p-5 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Account</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">My Profile</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your name and password settings.</p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="surface-card rounded-2xl p-5 md:p-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              <UserCircle2 size={13} />
              Profile Info
            </p>

            <form onSubmit={onUpdateName} className="mt-4 space-y-4">
              <label className="field-group">
                <span>Full Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="field-input"
                />
              </label>

              <label className="field-group">
                <span>Email</span>
                <input value={profile?.email || ""} readOnly className="field-input bg-slate-50 text-slate-500" />
              </label>

              <label className="field-group">
                <span>Role</span>
                <input value={profile?.role || ""} readOnly className="field-input bg-slate-50 text-slate-500" />
              </label>

              <button type="submit" disabled={savingProfile} className="btn-primary w-full">
                {savingProfile ? "Saving..." : "Update Profile"}
              </button>
            </form>
          </section>

          <section className="surface-card rounded-2xl p-5 md:p-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              <KeyRound size={13} />
              Change Password
            </p>

            <form onSubmit={onChangePassword} className="mt-4 space-y-4">
              <label className="field-group">
                <span>Current Password</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                  }
                  className="field-input"
                />
              </label>

              <label className="field-group">
                <span>New Password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                  }
                  className="field-input"
                />
              </label>

              <label className="field-group">
                <span>Confirm Password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                  className="field-input"
                />
              </label>

              <button type="submit" disabled={savingPassword} className="btn-primary w-full">
                {savingPassword ? "Updating..." : "Change Password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Profile
