import './App.css'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Profile from './pages/Profile'
import VendorDashboard from './pages/VendorDashboard'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyRegistration from './pages/VerifyRegistration'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import { Routes, Route } from 'react-router-dom'


function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
             <Route path="/" element={<Home />} />
             <Route path="/browse" element={<Browse />} />
             <Route path="/profile" element={<Profile />} />
             <Route path="/vendor/dashboard" element={<VendorDashboard />} />
             <Route path="/register" element={<Register />} />
             <Route path="/login" element={<Login />} />
             <Route path="/verify-registration" element={<VerifyRegistration />} />
             <Route path="/forgot-password" element={<ForgotPassword />} />
             <Route path="/reset-password" element={<ResetPassword />} />
             <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default App
