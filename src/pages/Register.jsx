import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authService";
import Swal from "sweetalert2";

function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
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

        // password check to match backend rule
        const hasUppercase = /[A-Z]/.test(form.password);
        const hasLowercase = /[a-z]/.test(form.password);

        if (!hasUppercase || !hasLowercase) {
            setErrorMessage("Password must contain at least one uppercase and one lowercase letter.");
            return;
        }

        // clear previous error
        setErrorMessage("");

        setIsSubmitting(true);

        try {
            const response = await registerUser(form);
            const { email, message } = response?.data || {};

            // decide which email to carry forward to verification
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
                // go to VerifyRegistration page with email
                navigate("/verify-registration", { state: { email: emailToUse } });
            });
        }  catch (error) {
            const backendMessage = error.response?.data?.message;
            console.error(error.response?.data);
            setErrorMessage(backendMessage || "Registration Failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="auth-card" onSubmit={handleSubmit}>
            <h2 className="auth-title">Create account</h2>
            <p className="auth-subtitle">Sign up to get started with Nataka Hii.</p>

            <div className="form-group">
                <label className="form-label" htmlFor="name">Name</label>
                <input 
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="Enter your name"
                  onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input 
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone</label>
                <input 
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="Enter your phone number"
                  onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input 
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Create a password"
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
                    {isSubmitting ? "Registering..." : "Register"}
                  </span>
                </button>

                <div>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280", marginRight: "4px" }}>
                        Already have an account?
                    </span>
                    <Link to="/Login" className="link-inline">
                        Login
                    </Link>
                </div>
            </div>
        </form>
    );
}

export default Register