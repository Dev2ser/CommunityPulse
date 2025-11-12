import { useState } from 'react';
import './App.css';
import LoginPage from './LoginPage';

function App() {
  const [page, setPage] = useState('home'); // 'home', 'login', 'dashboard'

  const handleLogin = () => {
    setPage('dashboard');
  };

  const handleBack = () => {
    setPage('home');
  };

  if (page === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={handleBack} />;
  }

  return (
    <div className="App">
      <button className="login" onClick={() => setPage('login')}>
        Admin Login
      </button>
      <header className="App-header">
        <div>
          <h1>Welcome to CommunityPulse</h1>
          <p>A platform for community engagement and interaction</p>
        </div>
      </header>
      <main>
        {page === 'dashboard' ? (
          <div className="dashboard">
            <h2>Your Community Dashboard</h2>
            <p>Start engaging with your community!</p>
          </div>
        ) : (
          <div className="welcome">
            <h2>Join CommunityPulse</h2>
            <p>Connect, share, and grow with your community.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;


