import { useState } from 'react';
import './App.css';
import LoginPage from './LoginPage';
import Sidebar from './sidebar';

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
      <Sidebar></Sidebar>
      

    </div>
  );
}

export default App;


