import React, { useState } from "react";
import "../Styles/LoginPage.css";
import sidebarLogo from "../assets/loginTippingPointLogo.png";
import { API_BASE } from "../utils/api";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    const emailValid = /\S+@\S+\.\S+/.test(email);
    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      console.log("Login response data:", data);
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("userRole", data.role);
      localStorage.setItem("username", data.username);

      onLogin();
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="branding-loginform">
        <div className="branding">
          <img src={sidebarLogo} alt="Tipping Point Logo" className="logo" />
          <h3>
            COMMUNITY PULSE SURVEY <br /> PORTAL
          </h3>
          <p>Real estate development feedback platform</p>
        </div>
        <div className="login-box">
          <div className="login-form">
            <h4>ADMINISTRATOR LOGIN</h4>
            {error && <div className="login-error">{error}</div>}
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="options">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="forgot">
                Forgot password?
              </a>
            </div>

            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login to Portal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
