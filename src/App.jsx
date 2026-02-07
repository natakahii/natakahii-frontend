import './App.css'
import natakahiiLogo from './assets/natakahii.png'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyRegistration from './pages/VerifyRegistration'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { Routes, Route } from 'react-router-dom'


function App() {
  return (
    <div className="app-container">
      <img src={natakahiiLogo} alt="Nataka Hii Logo" className="logo" />

      <Routes>
           <Route path="/" element={<Login />} />
           <Route path="/Register" element={<Register />} />
           <Route path="/Login" element={<Login />} />
           <Route path="/verify-registration" element={<VerifyRegistration />} />
           <Route path="/forgot-password" element={<ForgotPassword />} />
           <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </div>
  )
}

export default App
