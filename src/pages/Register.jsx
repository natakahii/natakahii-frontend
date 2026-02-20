import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoPerson, IoMail, IoCall, IoLockClosed, IoEye, IoEyeOff, IoArrowBack } from 'react-icons/io5';
import { registerUser } from "../api/authService";
import Swal from "sweetalert2";
import { Colors } from '../constants/theme';
import './Auth.css';

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
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

        // password check to match backend rule
        const hasUppercase = /[A-Z]/.test(form.password);
        const hasLowercase = /[a-z]/.test(form.password);

        if (!hasUppercase || !hasLowercase) {
            setErrorMessage("Password must contain at least one uppercase and one lowercase letter.");
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const response = await registerUser(form);
            const { email, message } = response?.data || {};

            const emailToUse = email || form.email;

            console.log(response.data);

            // clear form fields
            setForm({
                name: "",
                email: "",
                password: "",
                phone: ""
            });

            const uiMessage = message || "Registration successful. Please check your email for the OTP code.";

            Swal.fire({
                icon: "success",
                title: "Registration initiated",
                text: uiMessage,
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                navigate("/verify-registration", { state: { email: emailToUse } });
            });
        } catch (error) {
            const backendMessage = error.response?.data?.message;
            console.error(error.response?.data);
            setErrorMessage(backendMessage || "Registration Failed");
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

                {/* Register Card */}
                <div className="auth-card-modern">
                    <div className="auth-header">
                        <h2 className="auth-title-modern">Create Account</h2>
                        <p className="auth-subtitle-modern">Join thousands of shoppers today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {/* Name Input */}
                        <div className="form-group-modern">
                            <label className="form-label-modern" htmlFor="name">
                                Full Name
                            </label>
                            <div className="input-wrapper">
                                <IoPerson className="input-icon" size={20} />
                                <input 
                                    id="name"
                                    name="name"
                                    type="text"
                                    className="form-input-modern"
                                    placeholder="Enter your full name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

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

                        {/* Phone Input */}
                        <div className="form-group-modern">
                            <label className="form-label-modern" htmlFor="phone">
                                Phone Number
                            </label>
                            <div className="input-wrapper">
                                <IoCall className="input-icon" size={20} />
                                <input 
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    className="form-input-modern"
                                    placeholder="Enter your phone number"
                                    value={form.phone}
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
                                    placeholder="Create a strong password"
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
                            <p className="input-hint">
                                Must contain uppercase and lowercase letters
                            </p>
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
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <span>Create Account</span>
                            )}
                        </button>

                        {/* Login Link */}
                        <div className="auth-footer">
                            <p className="auth-footer-text">
                                Already have an account?{' '}
                                <Link to="/login" className="auth-footer-link">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
