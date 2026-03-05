import React, { useState, useEffect } from 'react';
import Login from './components/pages/Login';
import HRDashboard from './components/pages/HR/HRDashboard';
import EmployeeDashboard from './components/pages/Employee/EmployeeDashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setUser(null);
  };

  // Hàm cập nhật user (khi nhân viên đổi avatar)
  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user_info', JSON.stringify(updatedUser));
  };

  // --- LOGIC RENDER ---

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Nếu là HR -> Vào Dashboard HR
  if (user.role === 'HR') {
    return <HRDashboard user={user} onLogout={handleLogout} />;
  }

  // Nếu là Nhân viên -> Vào Dashboard Nhân viên
  return (
    <EmployeeDashboard
      user={user}
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser} 
    />
  );
}

export default App;