import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../../../services/authenticationApi";
import "./loginPage.css";
import RCLOGO from "../../../assets/RCLOGO.png";

function LoginPage() {
    const navigate = useNavigate();
    const [studentId, setStudentId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setError("");

            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("role");

            const response = await login({
                username: studentId,
                password: password,
            });

            console.log("Login response:", response);

           if (!response.token || !response.username || !response.role) {
                throw new Error("Invalid login response.");
            }

            localStorage.setItem("token", response.token);
            localStorage.setItem("username", response.username);
            localStorage.setItem("role", response.role);

            console.log("Authentication saved.");
            navigate("/offenses");

        } catch (error) {
            console.error("Login failed:", error);
            setError("Invalid username or password.");
        }
    };

    return (
        <div className="login-page d-flex align-items-center justify-content-center">

            <div className="container-fluid px-3 py-4">

                <div className="login-card mx-auto p-4 p-md-5 rounded bg-white">

                    <div className="text-center mb-4">

                        <img
                            src={RCLOGO}
                            alt="Rogationist College Logo"
                            className="login-logo mb-3"
                        />

                        <h1 className="login-title fw-bold mb-1">
                            Office for Student Discipline
                        </h1>

                        <p className="login-subtitle mb-0">
                            Rogationist College • Web Access
                        </p>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="mb-3 text-start">

                            <label
                                htmlFor="studentId"
                                className="form-label fw-bold login-label"
                            >
                                Student ID
                            </label>

                            <input
                                id="studentId"
                                type="text"
                                className="form-control"
                                placeholder="e.g. CT23-0010"
                                value={studentId}
                                onChange={(e) =>
                                    setStudentId(e.target.value)
                                }
                            />

                        </div>

                        <div className="mb-2 text-start">

                            <label
                                htmlFor="password"
                                className="form-label fw-bold login-label"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />

                        </div>

                        <div className="text-end mb-4">

                            <a
                                href="#"
                                className="login-forgot fw-bold"
                            >
                                Forgot password?
                            </a>

                        </div>

                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary w-100 fw-bold login-submit"
                        >
                            Log In
                        </button>

                    </form>

                    <div className="login-divider d-flex align-items-center my-4">

                        <span className="flex-grow-1"></span>

                        <span className="mx-3 login-divider-text">
                            OR
                        </span>

                        <span className="flex-grow-1"></span>

                    </div>

                    <p className="login-footer text-center mb-0">
                        Don&apos;t have an account? Contact the OSD office to get your credentials.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default LoginPage;