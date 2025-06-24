import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from './ui-components';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import socket from '../socket'

interface UserActivityEntry {
  id: string;
  username: string;
  activity: string;
  status: 'visible' | 'not visible';
  timestamp: Date;
}

interface UserActivityProps {
  addAdminLog: (action: string, details: string) => void;
}

export default function UserActivity({ addAdminLog }: UserActivityProps) {
  const [userActivities, setUserActivities] = useState<UserActivityEntry[]>([]);

  // Real user activity tracking would be implemented here
  // Currently no real users are connected, so no activities to show

  const toggleUserStatus = (id: string) => {
    setUserActivities(prev => 
      prev.map(activity => 
        activity.id === id 
          ? { ...activity, status: activity.status === 'visible' ? 'not visible' : 'visible' }
          : activity
      )
    );
    addAdminLog('User Status Change', 'Mengubah status visibility user');
  };

  useEffect(() => {
    const handleTerminalLog = (log: any) => {
      setLogs(prev => [...prev, {
        ...log,
        timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
      }]);
    };

    socket.off('terminalLog', handleTerminalLog);
    socket.on('terminalLog', handleTerminalLog);

    return () => {
      socket.off('terminalLog', handleTerminalLog); // hanya off, tidak disconnect
    };
  }, []);

  useEffect(() => {
    if (!socket.connected) {
    socket.connect();
  }
    
    try {
      socket.on('userActivity', (activity: any) => {
        const newActivity: UserActivityEntry = {
          id: Date.now().toString(),
          username: activity.username || 'Anonymous User',
          activity: activity.activity || 'Visited website',
          status: 'visible',
          timestamp: new Date()
        };
        
        setUserActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50 activities
      });

      // Track page visits by sending activity when component mounts
      fetch('https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev/api/user-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          activity: 'Admin panel accessed',
          userAgent: navigator.userAgent 
        })
      }).catch(() => {}); // Silent fail if endpoint doesn't exist yet
      
    } catch (error) {
      console.log('User activity tracking setup failed:', error);
    }
    
    return () => {
      socket.off('userActivity');
    };
  }, []); // Remove addAdminLog dependency to prevent infinite loop

  // Separate useEffect for initial log to prevent loops
  useEffect(() => {
    addAdminLog('User Activity Monitor', 'Real user activity tracking started');
  }, []);

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">User Activity Monitor</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => addAdminLog('User Activity Monitor', 'Refreshed user activity view')}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <style>{`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="overflow-x-auto max-h-96 hide-scrollbar" style={{ overflowY: 'auto' }}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-900">
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Username</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Activity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Timestamp</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-white">
                    Tidak ada user yang sedang aktif saat ini
                  </td>
                </tr>
              ) : (
                userActivities.map((activity) => (
                  <tr key={activity.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="py-3 px-4 font-medium text-white">{activity.username}</td>
                    <td className="py-3 px-4 text-gray-300">{activity.activity}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={activity.status === 'visible' ? 'default' : 'secondary'}
                        className={activity.status === 'visible' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {activity.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {activity.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(activity.id)}
                      >
                        {activity.status === 'visible' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-sm text-white">
          <p>Total aktivitas: {userActivities.length}</p>
          <p>User visible: {userActivities.filter(a => a.status === 'visible').length}</p>
          <p>User not visible: {userActivities.filter(a => a.status === 'not visible').length}</p>
        </div>
      </CardContent>
    </Card>
  );
}
