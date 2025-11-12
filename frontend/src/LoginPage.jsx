import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
  
      console.log('Login successful', data);
      onLogin(); // call your callback
    } catch (err) {
      console.error('Login error:', err);
      alert(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Sign In</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Sign In</button>
        <button className="back" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
