import './App.css'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import { Routes, Route } from 'react-router-dom'
import Products from './pages/Products'
import ProtectedRoute from './auth/ProtectedRoute'
import Cart from './pages/Cart'

function App() {

  return (
    <div>
      <Navbar />
      
      <Routes>
        <Route path='/' element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }/>

        <Route path='/cart' element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }/>
        
        <Route path='/login' element={<Login />} />
      </Routes>

    </div>
  )
}

export default App
