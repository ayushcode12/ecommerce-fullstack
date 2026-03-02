import { Link, useNavigate } from "react-router-dom"
import { Home, ShoppingCart, PackageCheck } from "lucide-react"

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

        {/* Brand */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-wide text-white hover:opacity-90 transition"
        >
          Home <span className="text-emerald-500">Chemicals</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-8">

          {/* Home Icon */}
          <Link
            to="/"
            className="text-slate-300 hover:text-emerald-400 transition"
          >
            <Home size={22} />
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative text-slate-300 hover:text-emerald-400 transition"
          >
            <ShoppingCart size={22} />

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Orders Icon (Only if Logged In) */}
          {token && (
            <Link
              to="/orders"
              className="text-slate-300 hover:text-emerald-400 transition"
            >
              <PackageCheck size={22} />
            </Link>
          )}

          {/* Auth Button */}
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl transition shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl transition shadow-md hover:shadow-lg"
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