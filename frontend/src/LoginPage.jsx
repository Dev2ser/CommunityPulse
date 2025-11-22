import React, { useState } from 'react';
import './LoginPage.css';
import sidebarLogo from './assets/tippingPointLogo.png';

function LoginPage({ onLogin, onBack }) {
  const [email, setEmail] = useState('admin@tippingpoint.com');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      console.log('Login successful', data);
      onLogin();
    } catch (err) {
      console.error('Login error:', err);
      alert(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="branding">
          <img src={sidebarLogo} alt="Tipping Point Logo" className="logo" />
          <h1>TIPPING POINT</h1>
          <h2>— REAL ESTATE DEVELOPMENT —</h2>
          <h3>COMMUNITY PULSE SURVEY PORTAL</h3>
          <p>Real estate development feedback platform</p>
        </div>

        <div className="login-form">
          <h4>ADMINISTRATOR LOGIN</h4>
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
            <a href="#" className="forgot">Forgot password?</a>
          </div>

          <button className="login-btn" onClick={handleLogin}>
            Login to Portal
          </button>
          <button className="back-btn" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
