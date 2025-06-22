import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from './ui-components';
import { Terminal, Download, Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { socket } from '../../socket.ts';

interface TerminalLogEntry {
  timestamp: Date;
  message: string;
  level: 'info' | 'warn' | 'error';
}

interface TerminalLogProps {
  addAdminLog: (action: string, details: string) => void;
}

export default function TerminalLog({ addAdminLog }: TerminalLogProps) {
  const [logs, setLogs] = useState<TerminalLogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const baseUrl =
      window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev';

    fetch(`${baseUrl}/api/whatsapp/logs`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.logs)) {
          setLogs(
            data.logs.map((log: any) => ({
              ...log,
              timestamp: new Date(log.timestamp),
            }))
          );
        } else {
          console.warn('⚠️ logs is not an array:', data.logs);
        }
      })
      .catch(error => {
        console.error('Failed to fetch logs:', error);
      });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('terminalLog', (log: any) => {
      setLogs(prevLogs => [
        ...prevLogs,
        { ...log, timestamp: log.timestamp ? new Data(log.timestamp) : new Date() },
      ]);
    });
  }, [addAdminLog]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-600';
      case 'warn':
        return 'bg-yellow-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getLevelTextColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-300';
      case 'warn':
        return 'text-yellow-300';
      case 'error':
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  const clearLogs = async () => {
    const baseUrl =
      window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev';

    try {
      const res = await fetch(`${baseUrl}/api/whatsapp/clear-logs`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setLogs([]);
        addAdminLog('Terminal Log', 'Logs cleared successfully');
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const exportLogs = () => {
    if (logs.length === 0) {
      addAdminLog('Terminal Log', 'No logs to export');
      return;
    }

    const csvContent = logs
      .map(
        log =>
          `"${log.timestamp.toISOString()}","${(log.level ?? 'info').toUpperCase()}","${log.message.replaceAll('"', '""')}"`
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-logs-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    addAdminLog('Terminal Log', 'Logs exported as CSV');
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
                {logs.map((log, index) => {
                  const message = typeof log.message === 'string' ? log.message : '';
                  return (
                    <div key={index} className="flex items-start gap-2 py-1">
                      <span className="text-gray-500 text-xs shrink-0 w-20">
                        {log.timestamp instanceof Date && !isNaN(log.timestamp.getTime())
                          ? log.timestamp.toLocaleTimeString()
                          : 'Invalid Time'}
                      </span>
                      <Badge className={`${getLevelColor(log.level)} text-white text-xs shrink-0`}>
                        {(log.level ?? 'info').toUpperCase()}
                      </Badge>
                      <div className={`${getLevelTextColor(log.level)} break-words flex-1`}>
                        {message.startsWith('📱 WhatsApp QR Code') ? (
                          <div className="text-green-300 font-semibold text-lg mb-2">{message}</div>
                        ) : message.startsWith('QR_CODE_IMAGE:') ? (
                          <div className="mt-2 mb-2">
                            <div className="p-4 bg-white rounded-lg border-2 border-green-500 inline-block">
                              <img
                                src={message.replace('QR_CODE_IMAGE:', '')}
                                alt="WhatsApp QR Code"
                                className="w-64 h-64 mx-auto"
                                onLoad={() => console.log('QR Code image loaded successfully')}
                                onError={(e) => console.log('QR Code image failed to load:', e)}
                              />
                            </div>
                          </div>
                        ) : message.startsWith('📱 Buka WhatsApp') ? (
                          <div className="text-blue-300 font-semibold text-center mt-2 p-2 bg-blue-900 rounded">
                            {message}
                          </div>
                        ) : message.startsWith('🔗 QR Data:') ? (
                          <div className="text-green-200 text-xs break-all bg-green-900 p-2 rounded mt-1">
                            {message}
                          </div>
                        ) : message.startsWith('QR_CODE_DATA:') ? (
                          <div>
                            <span className="text-green-300 font-semibold">
                              WhatsApp QR Code (Image Backup):
                            </span>
                            <div className="mt-2 p-3 bg-white rounded-lg border-2 border-green-500">
                              <img
                                src={message.replace('QR_CODE_DATA:', '')}
                                alt="WhatsApp QR Code"
                                className="w-56 h-56 mx-auto"
                                onLoad={() => console.log('QR Code image loaded successfully')}
                                onError={(e) => console.log('QR Code image failed to load:', e)}
                              />
                            </div>
                          </div>
                        ) : (
                          <span>{message}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-white">
          <p>Total logs: {logs.length}</p>
          <div className="flex gap-4 mt-2">
            <span className="text-blue-300">Info: {logs.filter(l => l.level === 'info').length}</span>
            <span className="text-yellow-300">Warnings: {logs.filter(l => l.level === 'warn').length}</span>
            <span className="text-red-300">Errors: {logs.filter(l => l.level === 'error').length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
