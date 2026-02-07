import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgetPassword } from "../api/authService";
import Swal from "sweetalert2";

function ForgotPassword() {
    const [form, setForm] = useState({
        email: ""
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage("");

        if (!form.email) {
            setErrorMessage("Please enter your email.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await forgetPassword(form);
            const backendMessage = response?.data?.message || "Password reset OTP sent to your email.";
            const withEmail = form.email ? `${backendMessage} (${form.email})` : backendMessage;

            await Swal.fire({
                icon: "success",
                title: "Check your email",
                text: withEmail,
                timer: 2000,
                showConfirmButton: false
            });

            navigate("/reset-password", { state: { email: form.email } });
        } catch (error) {
            const backendMessage = error.response?.data?.message;
            setErrorMessage(backendMessage || "Failed to send password reset email. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="auth-card" onSubmit={handleSubmit}>
            <h2 className="auth-title">Forgot password</h2>
            <p className="auth-subtitle">Enter your email to receive a password reset code.</p>

            <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                />
            </div>

            {errorMessage && (
                <p className="error-text">{errorMessage}</p>
            )}

            <div className="form-footer">
                <button
                    type="submit"
                    className="primary-button"
                    disabled={isSubmitting}
                >
                    <span className="button-label">
                        {isSubmitting && <span className="spinner" />}
                        {isSubmitting ? "Sending..." : "Send reset code"}
                    </span>
                </button>

                <div>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280", marginRight: "4px" }}>
                        Remembered your password?
                    </span>
                    <Link to="/Login" className="link-inline">
                        Login
                    </Link>
                </div>
            </div>
        </form>
    );
}

export default ForgotPassword;
