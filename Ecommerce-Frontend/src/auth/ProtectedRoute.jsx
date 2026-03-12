import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token")
  const refreshToken = localStorage.getItem("refreshToken")

  if (!token && !refreshToken) {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("role")
    return <Navigate to="/login" />
  }
  
  return children
}
  
export default ProtectedRoute
