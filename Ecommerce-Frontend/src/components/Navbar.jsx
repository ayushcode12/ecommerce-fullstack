import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()

  const token = localStorage.getItem("token")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/login")
  }

  return (
    <div className="navbar">
      <h2>Home Chemicals Store</h2>

      <div>
        <Link to="/" style={{ marginRight: "15px" }}>
          <button>Home</button>
        </Link>

        <Link to="/cart" style={{ marginRight: "15px" }}>
          <button>Cart</button>
        </Link>

        {token ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}
      </div>
      
    </div>
  )
}

export default Navbar