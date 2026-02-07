import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/authService";
import Swal from "sweetalert2";

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();

    const initialEmail = location.state?.email || "";

    const [form, setForm] = useState({
        email: initialEmail,
        otp: "",
        password: "",
        password_confirmation: ""
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage("");

        if (!form.email || !form.otp || !form.password || !form.password_confirmation) {
            setErrorMessage("Please fill in all fields.");
            return;
        }

        if (form.password !== form.password_confirmation) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await resetPassword(form);
            const backendMessage = response?.data?.message || "Password reset successful. You can now log in with your new password.";

            await Swal.fire({
                icon: "success",
                title: "Password reset",
                text: backendMessage,
                timer: 2000,
                showConfirmButton: false
            });

            navigate("/Login");
        } catch (error) {
            const backendMessage = error.response?.data?.message;
            setErrorMessage(backendMessage || "Reset failed. Please check the code and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="auth-card" onSubmit={handleSubmit}>
            <h2 className="auth-title">Reset your password</h2>
            <p className="auth-subtitle">Enter the OTP sent to your email and choose a new password.</p>

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

            <div className="form-group">
                <label className="form-label" htmlFor="otp">OTP code</label>
                <input
                    id="otp"
                    name="otp"
                    type="text"
                    className="form-input"
                    placeholder="Enter the OTP from your email"
                    value={form.otp}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="password">New password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-input"
                    placeholder="Enter a new password"
                    value={form.password}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="password_confirmation">Confirm new password</label>
                <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    className="form-input"
                    placeholder="Re-enter the new password"
                    value={form.password_confirmation}
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
                        {isSubmitting ? "Resetting..." : "Reset password"}
                    </span>
                </button>

                <div>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280", marginRight: "4px" }}>
                        Need a new code?
                    </span>
                    <Link to="/forgot-password" className="link-inline">
                        Request again
                    </Link>
                </div>
            </div>
        </form>
    );
}

export default ResetPassword;
