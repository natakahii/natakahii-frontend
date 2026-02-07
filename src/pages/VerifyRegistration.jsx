import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { verifyRegistration, resendOtp } from "../api/authService";
import Swal from "sweetalert2";

function VerifyRegistration() {
    const location = useLocation();
    const navigate = useNavigate();

    const initialEmail = location.state?.email || "";

    const [form, setForm] = useState({
        email: initialEmail,
        otp: ""
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage("");

        setIsVerifying(true);
        try {
            // NOTE: This assumes your backend expects { email, otp }.
            // If your request body is different, adjust the fields here.
            const response = await verifyRegistration(form);
            const { message, user, token } = response?.data || {};

            if (token) {
                localStorage.setItem("token", token);
            }
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }

            const baseMessage = message || "Registration successful. You are now logged in.";
            const withName = user?.name ? `${baseMessage} Welcome, ${user.name}.` : baseMessage;

            Swal.fire({
                icon: "success",
                title: "Registration complete",
                text: withName,
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                navigate("/Login");
            });
        } catch (error) {
            const backendMessage = error.response?.data?.message;
            console.error(error.response?.data);
            setErrorMessage(backendMessage || "Verification failed. Please check the OTP and try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        setErrorMessage("");

        if (!form.email) {
            setErrorMessage("Please enter your email before resending OTP.");
            return;
        }

        setIsResending(true);

        try {
            // Backend requires a 'type' field; we have 'registration' for registration OTP.
           
            const response = await resendOtp({ type: "registration", email: form.email });
            const { message } = response?.data || {};

            // Build a clear message that shows which email the OTP was sent to
            const uiMessage = message
                ? `${message}${form.email ? ` (${form.email})` : ""}`
                : `OTP resent successfully${form.email ? ` to ${form.email}` : ""}.`;

            Swal.fire({
                icon: "success",
                title: "OTP resent",
                text: uiMessage,
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            const backendMessage = error.response?.data?.message;
            console.error(error.response?.data);
            setErrorMessage(backendMessage || "Failed to resend OTP. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <form className="auth-card" onSubmit={handleSubmit}>
            <h2 className="auth-title">Verify your email</h2>
            <p className="auth-subtitle">Enter the OTP sent to your email to complete registration.</p>

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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
                <span style={{ fontSize: "0.83rem", color: "#6b7280" }}>
                    Didn't receive the code?
                </span>
                <button
                    type="button"
                    onClick={handleResendOtp}
                    className="button-ghost link-inline"
                    disabled={isResending || isVerifying}
                >
                    <span className="button-label">
                        {isResending && <span className="spinner" />}
                        {isResending ? "Resending..." : "Resend OTP"}
                    </span>
                </button>
            </div>

            {errorMessage && (
                <p className="error-text">{errorMessage}</p>
            )}

            <div className="form-footer">
                <button
                    type="submit"
                    className="primary-button"
                    disabled={isVerifying || isResending}
                >
                    <span className="button-label">
                        {isVerifying && <span className="spinner" />}
                        {isVerifying ? "Verifying..." : "Verify & Continue"}
                    </span>
                </button>

                <div>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280", marginRight: "4px" }}>
                        Already verified?
                    </span>
                    <Link to="/Login" className="link-inline">
                        Login
                    </Link>
                </div>
            </div>
        </form>
    );
}

export default VerifyRegistration;
