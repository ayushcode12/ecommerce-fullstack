import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        "http://localhost:8080/auth/login",
        {
          email: email,
          password: password
        }
      )
      const { token, role } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("role", role)

      navigate("/")

      console.log("Token stored successfully")
    } catch (error) {
      console.log("Login failed:", error.response?.data || error.message)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        
        <form onSubmit={handleLogin}>
          <div className='form-group'>
            <label>Email</label>
            <input type="email" placeholder='Enter your email' value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className='form-group'>
            <label>Password</label>
            <input type="password" placeholder='Enter your password' value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button className="login-button" type='submit'>Login</button>
        </form>

      </div>
    </div>
  )
}

export default Login 