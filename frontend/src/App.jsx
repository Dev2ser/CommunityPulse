import { useState } from 'react';
import './App.css';
import LoginPage from './LoginPage';
import Sidebar from './sidebar';
import AdminSurveys from './AdminSurveys';

function App() {
  const [page, setPage] = useState('home'); // 'home', 'login', 'dashboard', 'adminSurveys'

  const handleLogin = () => setPage('dashboard');
  const handleBack = () => setPage('home');
  const handleAdminSurveys = () => setPage('adminSurveys');

  if (page === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={handleBack} />;
  }

  if (page === 'adminSurveys') {
    return (
      <div className="App">
        <Sidebar onNavigate={setPage} />
        <AdminSurveys />
      </div>
    );
  }

  return (
    <div className="App">
      <button className="login" onClick={() => setPage('login')}>
        Admin Login
      </button>
      <Sidebar onNavigate={setPage} />
      {page === 'dashboard' && <div>Dashboard content here</div>}
    </div>
  );
}

export default App;
