import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem("token")
  const refreshToken = localStorage.getItem("refreshToken")
  const role = localStorage.getItem("role")

  if (!token && !refreshToken) {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("role")
    return <Navigate to="/login" />
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" />
  }
  
  return children
}
  
export default ProtectedRoute
