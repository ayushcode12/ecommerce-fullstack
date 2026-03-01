import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"

function Navbar({ cartCount }) {
  const navigate = useNavigate()

  const token = localStorage.getItem("token")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/login")
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-[1600px] mx-auto px-8 py-5 flex items-center justify-between">

        {/* Logo / Brand */}
        <Link to="/" className="text-2xl font-bold tracking-wide text-white">
          Home <span className="text-emerald-500">Chemicals</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8 text-sm font-medium">

          <Link
            to="/"
            className="text-slate-300 hover:text-white transition"
          >
            Home
          </Link>

          <Link
            to="/cart"
            className="relative text-slate-300 hover:text-white transition"
          >
            Cart

            {/* Cart Badge */}
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>

          {token ? (
            <button
              onClick={handleLogout}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl transition shadow"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl transition shadow"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar