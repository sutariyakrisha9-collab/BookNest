import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { BookOpen, Mail, Lock } from "lucide-react";

function Login() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await API.post(
                "/auth/login",
                form
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/dashboard");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="auth-page">

            <div className="auth-card">

                <div className="brand-icon">
                    <BookOpen size={32} />
                </div>

                <h2>Welcome Back!</h2>

                <p className="text-muted">
                    Login to your BookNest library
                </p>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

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
                            />

                        </div>

                    </div>

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
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>

                    <button
                        className="btn btn-booknest w-100"
                        type="submit"
                        disabled={loading}
                    >

                        {loading ? "Logging in..." : "Login"}

                    </button>

                </form>

                <p className="text-center mt-4">

                    Don't have an account?

                    {" "}

                    <Link to="/register">
                        Create Account
                    </Link>

                </p>

            </div>

        </div>

    );

}

export default Login;