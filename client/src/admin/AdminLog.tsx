import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from './ui-components';
import { Activity, Clock, Trash2, Download } from 'lucide-react';
import socket from '../socket';

interface AdminLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
}

interface AdminLogProps {
  logs: AdminLogEntry[];
  onClearLogs: () => void;
}

export default function AdminLog({ logs, onClearLogs }: AdminLogProps) {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-red-100 text-red-800';
      case 'navigation':
        return 'bg-blue-100 text-blue-800';
      case 'user activity monitor':
        return 'bg-purple-100 text-purple-800';
      case 'whatsapp message':
      case 'whatsapp template':
        return 'bg-emerald-100 text-emerald-800';
      case 'profile update':
        return 'bg-orange-100 text-orange-800';
      case 'user status change':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportAdminLogs = () => {
    if (logs.length === 0) {
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logData = [
      '='.repeat(80),
      'KAISERLICHE ADMIN PANEL - ADMIN ACTIVITY LOGS',
      `Exported: ${new Date().toLocaleString()}`,
      `Total Admin Logs: ${logs.length}`,
      '='.repeat(80),
      '',
      ...logs.map(log => 
        `[${log.timestamp.toLocaleString()}] [${log.action}] ${log.details}`
      ),
      '',
      '='.repeat(80),
      'End of Admin Log Export'
    ].join('\n');

    const blob = new Blob([logData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kaiserliche-admin-logs-${timestamp}.txt`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5" />
            Admin Activity Log
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={exportAdminLogs}
              variant="outline"
              size="sm"
              className="bg-white text-gray-800 hover:bg-gray-100"
              disabled={logs.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={onClearLogs}
              variant="outline"
              size="sm"
              className="bg-white text-gray-800 hover:bg-gray-100"
              disabled={logs.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p>Belum ada aktivitas admin yang tercatat</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800 hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getActionColor(log.action)}>
                    {log.action}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {log.timestamp.toLocaleString()}
                  </div>
                </div>
                <p className="text-sm text-gray-300">{log.details}</p>
              </div>
            ))}
          </div>
        )}

        {logs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Total aktivitas: {logs.length}</span>
              <span>Terakhir: {logs[0]?.timestamp.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
