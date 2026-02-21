import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMail, IoLockClosed, IoEye, IoEyeOff, IoArrowBack } from 'react-icons/io5';
import { loginUser } from "../api/authService";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";
import { Colors } from '../constants/theme';
import './Auth.css';

function Login() {
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();
    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const response = await loginUser(form);
            const { message, user, token } = response?.data || {};

            // Use AuthContext to manage authentication state
            if (token && user) {
                authLogin(user, token);
            }

            const baseMessage = message || "Login successful.";
            const withName = user?.name ? `${baseMessage} Welcome, ${user.name}.` : baseMessage;

            Swal.fire({
                icon: "success",
                title: "Login successful",
                text: withName,
                timer: 1800,
                showConfirmButton: false
            });

            // Redirect to home after successful login
            setTimeout(() => navigate('/'), 1800);

            console.log(response.data);
        } catch (error) {
            const backendMessage = error.response?.data?.message;
            console.error(error.response?.data);
            setErrorMessage(backendMessage || "Invalid credentials");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                {/* Back to Home Button */}
                <Link to="/" className="back-to-home">
                    <IoArrowBack size={20} />
                    <span>Back to Home</span>
                </Link>

                {/* Brand Logo */}
                <div className="auth-brand">
                    <h1 className="brand-name-auth">
                        <span style={{ color: Colors.primary }}>NATA</span>
                        <span style={{ color: Colors.accent }}>KAHII</span>
                    </h1>
                    <p className="brand-tagline">Your African Marketplace</p>
                </div>

                {/* Login Card */}
                <div className="auth-card-modern">
                    <div className="auth-header">
                        <h2 className="auth-title-modern">Welcome Back</h2>
                        <p className="auth-subtitle-modern">Sign in to continue shopping</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {/* Email Input */}
                        <div className="form-group-modern">
                            <label className="form-label-modern" htmlFor="email">
                                Email Address
                            </label>
                            <div className="input-wrapper">
                                <IoMail className="input-icon" size={20} />
                                <input 
                                    id="email"
                                    name="email"
                                    type="email"
                                    className="form-input-modern"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="form-group-modern">
                            <label className="form-label-modern" htmlFor="password">
                                Password
                            </label>
                            <div className="input-wrapper">
                                <IoLockClosed className="input-icon" size={20} />
                                <input 
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    className="form-input-modern"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="forgot-password-row">
                            <Link to="/forgot-password" className="forgot-password-link">
                                Forgot your password?
                            </Link>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="error-message">
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-modern" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>

                        {/* Register Link */}
                        <div className="auth-footer">
                            <p className="auth-footer-text">
                                Don't have an account?{' '}
                                <Link to="/register" className="auth-footer-link">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
