import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

import {
    BookOpen,
    User,
    Mail,
    Lock,
    AlertCircle,
    CheckCircle
} from "lucide-react";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle Input Changes
    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

        setError("");
        setSuccess("");

    };

    // Register User
    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        // Frontend Validation
        if (form.name.trim().length < 3) {
            setError("Name must contain at least 3 characters.");
            return;
        }

        if (!form.email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {

            const response = await API.post(
                "/auth/register",
                {
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    password: form.password
                }
            );

            console.log("Registration Response:", response.data);

            // Save JWT Token
            if (!response.data.token) {
                throw new Error("Registration successful but token was not received.");
            }

            localStorage.setItem(
                "token",
                response.data.token
            );

            // Save User Information
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            setSuccess("Account created successfully!");

            // Redirect to Dashboard
            navigate("/dashboard", { replace: true });

        } catch (error) {

            console.error("Registration Error:", error);

            console.error(
                "Backend Error Response:",
                error.response?.data
            );

            const backendError = error.response?.data;

            let errorMessage = "Registration failed. Please try again.";

            if (backendError?.message) {

                errorMessage = backendError.message;

            } else if (backendError?.errors?.length > 0) {

                errorMessage = backendError.errors
                    .map((item) => item.msg)
                    .join(", ");

            } else if (error.code === "ERR_NETWORK") {

                errorMessage = "Cannot connect to server. Please check whether backend is running on port 5000.";

            } else if (error.message) {

                errorMessage = error.message;

            }

            setError(errorMessage);

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="auth-page">

            <div className="auth-card">

                {/* Logo */}

                <div className="brand-icon">
                    <BookOpen size={32} />
                </div>

                {/* Heading */}

                <h2>Create Account</h2>

                <p className="text-muted">
                    Start your personal library with BookNest
                </p>

                {/* Error Message */}

                {error && (

                    <div className="alert alert-danger d-flex align-items-center gap-2">

                        <AlertCircle size={20} />

                        <span>{error}</span>

                    </div>

                )}

                {/* Success Message */}

                {success && (

                    <div className="alert alert-success d-flex align-items-center gap-2">

                        <CheckCircle size={20} />

                        <span>{success}</span>

                    </div>

                )}

                {/* Registration Form */}

                <form onSubmit={handleSubmit}>

                    {/* Full Name */}

                    <div className="mb-3">

                        <label className="form-label">
                            Full Name
                        </label>

                        <div className="input-group">

                            <span className="input-group-text">
                                <User size={18} />
                            </span>

                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={handleChange}
                                minLength={3}
                                maxLength={50}
                                required
                                disabled={loading}
                            />

                        </div>

                    </div>

                    {/* Email */}

                    <div className="mb-3">

                        <label className="form-label">
                            Email Address
                        </label>

                        <div className="input-group">

                            <span className="input-group-text">
                                <Mail size={18} />
                            </span>

                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />

                        </div>

                    </div>

                    {/* Password */}

                    <div className="mb-4">

                        <label className="form-label">
                            Password
                        </label>

                        <div className="input-group">

                            <span className="input-group-text">
                                <Lock size={18} />
                            </span>

                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Minimum 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                minLength={6}
                                required
                                disabled={loading}
                            />

                        </div>

                        <small className="text-muted">
                            Password must contain at least 6 characters.
                        </small>

                    </div>

                    {/* Submit Button */}

                    <button
                        type="submit"
                        className="btn btn-booknest w-100"
                        disabled={loading}
                    >

                        {loading ? (

                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                ></span>

                                Creating Account...

                            </>

                        ) : (

                            "Create Account"

                        )}

                    </button>

                </form>

                {/* Login Link */}

                <p className="text-center mt-4">

                    Already have an account?

                    {" "}

                    <Link to="/login">
                        Login
                    </Link>

                </p>

                <p className="text-center text-muted small mt-3">
                    © 2026 BookNest. Your Personal Library.
                </p>

            </div>

        </div>

    );

}

export default Register;
