import React, { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';

export default function AdminApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  const handleLogin = (username: string, password: string) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminPanel onLogout={handleLogout} username={currentUser} />;
}