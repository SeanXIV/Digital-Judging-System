import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import OrganizerDashboard from './components/OrganizerDashboard';
import JudgeDashboard from './components/JudgeDashboard';
import JudgeSelect from './components/JudgeSelect';
import Landing from './components/Landing';
import Navbar from './components/Navbar';
import wethinkcodeLogo from './assets/wethinkcode-logo.png';

function App() {
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogin = (newRole) => {
    setRole(newRole);
  };

  const handleLogout = () => {
    setRole(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/judge-select" element={<JudgeSelect />} />
          <Route path="/dashboard" element={
            (() => {
              const currentRole = localStorage.getItem('role');
              return currentRole === 'ORGANIZER' ? <OrganizerDashboard onLogout={handleLogout} logo={wethinkcodeLogo} /> :
                     currentRole === 'JUDGE' ? <JudgeDashboard onLogout={handleLogout} logo={wethinkcodeLogo} /> :
                     <Navigate to="/" />;
            })()
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
