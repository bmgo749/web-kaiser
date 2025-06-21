import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { AdminApp } from './admin';

export default function Router() {
  useEffect(() => {
    // Track user activity when app loads
    const trackActivity = async () => {
      try {
        await fetch('https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev/api/user-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            activity: 'Visited website',
            userAgent: navigator.userAgent 
          })
        });
      } catch (error) {
        // Silent fail if endpoint doesn't exist yet
      }
    };

    trackActivity();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin-ksr-secure-panel-2024" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
