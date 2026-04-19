import React, { useState } from "react";
import "../Styles/LoginPage.css";
import brandLogo from "../assets/TP_Wide_BlackGreen_ST2.png";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { API_BASE } from "../utils/api";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <div className="login-shell">
        <img src={brandLogo} alt="Tipping Point" className="login-brand-logo" />

        <div className="login-box">
          <div className="login-form">
            <h2 className="login-title">COMMUNITYPULSE ADMIN</h2>
            <p className="login-subtitle">
              Sign in to access the administrative dashboard
            </p>

            {error && <div className="login-error">{error}</div>}

            <label>Email Address</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label>Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              <span>{loading ? "Signing In..." : "Sign In"}</span>
              {!loading && <ArrowRight size={16} />}
            </button>

            <div className="login-footer-note">
              Access restricted to authorized Tipping Point administrators only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
