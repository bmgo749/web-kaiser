import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from './ui-components';
import { Terminal, Trash2, Download } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface LogEntry {
  timestamp: Date;
  message: string;
  level: 'info' | 'error' | 'warn';
}

interface TerminalLogProps {
  addAdminLog: (action: string, details: string) => void;
}

export default function TerminalLog({ addAdminLog }: TerminalLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io(window.location.origin, {
        transports: ['websocket'],
        withCredentials: true
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('terminalLog', (logEntry: any) => {
      setLogs(prev => [...prev, {
        ...logEntry,
        timestamp: new Date(logEntry.timestamp)
      }]);
    });

    socketRef.current.on('existingLogs', (existingLogs: any[]) => {
      setLogs(existingLogs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      })));
    });

    // Fetch existing logs on component mount
    fetch('/api/whatsapp/logs')
      .then(res => res.json())
      .then(data => {
        if (data.logs) {
          setLogs(data.logs.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp)
          })));
        }
      })
      .catch(error => {
        console.error('Failed to fetch logs:', error);
      });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [addAdminLog]);

  // Removed auto-scroll to allow manual scrolling

  const clearLogs = async () => {
    try {
      // Clear logs on server side
      const response = await fetch('/api/whatsapp/clear-logs', {
        method: 'POST'
      });
      
      if (response.ok) {
        setLogs([]);
        addAdminLog('Terminal Log', 'All terminal logs cleared from server and client');
      } else {
        // Fallback to client-side clear
        setLogs([]);
        addAdminLog('Terminal Log', 'Terminal logs cleared locally');
      }
    } catch (error) {
      // Fallback to client-side clear
      setLogs([]);
      addAdminLog('Terminal Log', 'Terminal logs cleared locally');
    }
  };

  const exportLogs = () => {
    if (logs.length === 0) {
      addAdminLog('Terminal Log', 'No logs to export');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logData = [
      '='.repeat(80),
      'KAISERLICHE ADMIN PANEL - TERMINAL LOGS',
      `Exported: ${new Date().toLocaleString()}`,
      `Total Logs: ${logs.length}`,
      '='.repeat(80),
      '',
      ...logs.map(log => 
        `[${log.timestamp.toLocaleString()}] [${log.level.toUpperCase()}] ${log.message}`
      ),
      '',
      '='.repeat(80),
      'End of Log Export'
    ].join('\n');

    const blob = new Blob([logData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kaiserliche-terminal-logs-${timestamp}.txt`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addAdminLog('Terminal Log', `${logs.length} terminal logs exported successfully`);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-600';
      case 'warn':
        return 'bg-yellow-600';
      case 'info':
      default:
        return 'bg-blue-600';
    }
  };

  const getLevelTextColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-300';
      case 'warn':
        return 'text-yellow-300';
      case 'info':
      default:
        return 'text-blue-300';
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Terminal className="w-5 h-5" />
            Terminal Log
            <Badge className={isConnected ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={exportLogs}
              variant="outline"
              size="sm"
              className="bg-white text-gray-800 hover:bg-gray-100"
              disabled={logs.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={clearLogs}
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
        <div className="bg-black rounded-lg p-4 font-mono text-sm">
          <div className="h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>

            
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No logs available. Start WhatsApp service to see logs.
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2 py-1">
                    <span className="text-gray-500 text-xs shrink-0 w-20">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <Badge
                      className={`${getLevelColor(log.level)} text-white text-xs shrink-0`}
                    >
                      {log.level.toUpperCase()}
                    </Badge>
                    <div className={`${getLevelTextColor(log.level)} break-words flex-1`}>
                      {log.message.startsWith('📱 WhatsApp QR Code') ? (
                        <div className="text-green-300 font-semibold text-lg mb-2">
                          {log.message}
                        </div>
                      ) : log.message.startsWith('QR_CODE_IMAGE:') ? (
                        <div className="mt-2 mb-2">
                          <div className="p-4 bg-white rounded-lg border-2 border-green-500 inline-block">
                            <img 
                              src={log.message.replace('QR_CODE_IMAGE:', '')} 
                              alt="WhatsApp QR Code" 
                              className="w-64 h-64 mx-auto"
                              onLoad={() => console.log('QR Code image loaded successfully')}
                              onError={(e) => console.log('QR Code image failed to load:', e)}
                            />
                          </div>
                        </div>
                      ) : log.message.startsWith('📱 Buka WhatsApp') ? (
                        <div className="text-blue-300 font-semibold text-center mt-2 p-2 bg-blue-900 rounded">
                          {log.message}
                        </div>
                      ) : log.message.startsWith('🔗 QR Data:') ? (
                        <div className="text-green-200 text-xs break-all bg-green-900 p-2 rounded mt-1">
                          {log.message}
                        </div>
                      ) : log.message.startsWith('QR_CODE_DATA:') ? (
                        <div>
                          <span className="text-green-300 font-semibold">WhatsApp QR Code (Image Backup):</span>
                          <div className="mt-2 p-3 bg-white rounded-lg border-2 border-green-500">
                            <img 
                              src={log.message.replace('QR_CODE_DATA:', '')} 
                              alt="WhatsApp QR Code" 
                              className="w-56 h-56 mx-auto"
                              onLoad={() => console.log('QR Code image loaded successfully')}
                              onError={(e) => console.log('QR Code image failed to load:', e)}
                            />
                          </div>
                        </div>
                      ) : (
                        <span>{log.message}</span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-white">
          <p>Total logs: {logs.length}</p>
          <div className="flex gap-4 mt-2">
            <span className="text-blue-300">
              Info: {logs.filter(l => l.level === 'info').length}
            </span>
            <span className="text-yellow-300">
              Warnings: {logs.filter(l => l.level === 'warn').length}
            </span>
            <span className="text-red-300">
              Errors: {logs.filter(l => l.level === 'error').length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
