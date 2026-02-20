import './App.css'
import Home from './pages/Home'
import Browse from './pages/Browse'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyRegistration from './pages/VerifyRegistration'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { Routes, Route } from 'react-router-dom'


function App() {
  return (
    <div className="app-container">
      <Routes>
           <Route path="/" element={<Home />} />
           <Route path="/browse" element={<Browse />} />
           <Route path="/register" element={<Register />} />
           <Route path="/login" element={<Login />} />
           <Route path="/verify-registration" element={<VerifyRegistration />} />
           <Route path="/forgot-password" element={<ForgotPassword />} />
           <Route path="/reset-password" element={<ResetPassword />} />
           <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
