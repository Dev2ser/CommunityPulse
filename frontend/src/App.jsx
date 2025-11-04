import { useState } from 'react'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to CommunityPulse</h1>
        <p>A platform for community engagement and interaction</p>
      </header>
      <main>
        {isLoggedIn ? (
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
  )
}

export default App
