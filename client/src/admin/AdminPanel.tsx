import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Avatar, AvatarFallback, AvatarImage, Badge } from './ui-components';
import { LogOut, User, Settings, Eye, EyeOff, Camera } from 'lucide-react';
import UserActivity from './UserActivity';
import WhatsAppMessaging from './WhatsAppMessaging';
import AdminLog from './AdminLog';
import UserProfile from './UserProfile';
import TerminalLog from './TerminalLog';

interface AdminPanelProps {
  onLogout: () => void;
  username: string;
}

interface AdminLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
}

export default function AdminPanel({ onLogout, username }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'whatsapp' | 'logs' | 'profile' | 'terminal'>('activity');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [adminLogs, setAdminLogs] = useState<AdminLogEntry[]>([]);
  const [profileImage, setProfileImage] = useState<string>('/logo.png');


  const addAdminLog = (action: string, details: string) => {
    const newLog: AdminLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action,
      details
    };
    setAdminLogs(prev => [newLog, ...prev]);
  };

  const clearAdminLogs = () => {
    setAdminLogs([]);
    addAdminLog('Admin Log', 'Semua log aktivitas admin telah dihapus');
  };

  useEffect(() => {
    addAdminLog('Login', `Admin ${username} masuk ke Admin Panel`);
  }, [username]);

  const handleTabChange = (tab: 'activity' | 'whatsapp' | 'logs' | 'profile') => {
    setActiveTab(tab);
    addAdminLog('Navigation', `Berpindah ke tab ${tab}`);
  };

  const handleLogout = () => {
    addAdminLog('Logout', `Admin ${username} keluar dari Admin Panel`);
    onLogout();
  };

  const handleProfileImageChange = (newImage: string) => {
    setProfileImage(newImage);
    addAdminLog('Profile Update', 'Mengubah foto profil');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8" />
              <h1 className="text-xl font-semibold text-white">Admin Panel Kaiserliche</h1>
            </div>
            
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profileImage} alt={username} />
                  <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-300">{username}</span>
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-600">
                  <button
                    onClick={() => {
                      handleTabChange('profile');
                      setShowUserMenu(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Info Account
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'activity', label: 'User Activity' },
              { id: 'whatsapp', label: 'WhatsApp Messaging' },
              { id: 'logs', label: 'Admin Log' },
              { id: 'terminal', label: 'Terminal Log' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 h-screen overflow-hidden">
        <div className="h-full hide-scrollbar" style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {activeTab === 'activity' && <UserActivity addAdminLog={addAdminLog} />}
          {activeTab === 'whatsapp' && <WhatsAppMessaging addAdminLog={addAdminLog} username={username} />}
          {activeTab === 'logs' && <AdminLog logs={adminLogs} onClearLogs={clearAdminLogs} />}
          {activeTab === 'terminal' && <TerminalLog addAdminLog={addAdminLog} />}
          {activeTab === 'profile' && (
            <UserProfile 
              username={username} 
              profileImage={profileImage}
              onProfileImageChange={handleProfileImageChange}
              addAdminLog={addAdminLog}
            />
          )}
        </div>
      </main>
    </div>
  );
}