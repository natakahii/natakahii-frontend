import { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../api/authService";
import Swal from "sweetalert2";


function Login() {
    const [form, setForm] = useState({
        email: "",
        password: ""
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

        // clear previous messages
        setErrorMessage("");

        setIsSubmitting(true);

        try {
            const response = await loginUser(form);
            const { message, user, token } = response?.data || {};

            // save auth data with token and user info
            if (token) {
                localStorage.setItem("token", token);
            }
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
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

            console.log(response.data);
        }  catch (error) {
            const backendMessage = error.response?.data?.message;
            console.error(error.response?.data);
            setErrorMessage(backendMessage || "Invalid credentials");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="auth-card" onSubmit={handleSubmit}>
            <h2 className="auth-title">Login</h2>
            <p className="auth-subtitle">Sign in to your Nataka Hii account.</p>

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
                <label className="form-label" htmlFor="password">Password</label>
                <input 
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  onChange={handleChange}
                />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.25rem", marginBottom: "0.75rem" }}>
                <Link to="/forgot-password" className="link-inline" style={{ fontSize: "0.85rem" }}>
                    Forgot your password?
                </Link>
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
                    {isSubmitting ? "Logging in..." : "Login"}
                  </span>
                </button>

                <div>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280", marginRight: "4px" }}>
                        Don't have an account?
                    </span>
                    <Link to="/Register" className="link-inline">
                        Register
                    </Link>
                </div>
            </div>
        </form>
    );
}

export default Login