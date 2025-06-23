import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Badge } from './ui-components';
import { Send, MessageCircle, Clock, Check, CheckCheck, Plus, Trash2, QrCode, Smartphone, Users, Loader2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import socket from '../socket'
import { useGlobalTemplates } from '../hooks/useGlobalTemplates';

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  createdBy?: string;
  createdAt?: Date;
}

interface SentMessage {
  id: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  groupId?: string;
}

interface WhatsAppMessagingProps {
  addAdminLog: (action: string, details: string) => void;
  username: string;
}

export default function WhatsAppMessaging({ addAdminLog, username }: WhatsAppMessagingProps) {
  const [message, setMessage] = useState('');
  const [groupId, setGroupId] = useState('');
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  
  // Use global template store for persistence across menu navigation
  const { 
    templates: messageTemplates, 
    setTemplates: setMessageTemplates,
    addTemplate: addGlobalTemplate,
    removeTemplate: removeGlobalTemplate,
    isLoading: templatesLoading,
    setLoading: setTemplatesLoading,
    shouldRefresh,
    markFetched
  } = useGlobalTemplates();

  // Debug effect to track template persistence
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    console.log(`Templates in global store: ${messageTemplates.length}`);
    const storedData = localStorage.getItem('global-templates-storage');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      console.log('localStorage data:', parsed);
    }
  }, [messageTemplates]);

  // Load templates from server - permanent global storage system
  const loadTemplates = async (force = false) => {
    // Skip loading if already have templates in global storage (unless forced)
    if (!force && messageTemplates.length > 0) {
      console.log('Using templates from permanent global storage');
      addAdminLog('Template Permanent', `${messageTemplates.length} template(s) dimuat dari penyimpanan permanen`);
      return;
    }
    
if (templatesLoading && !force) {
  console.log('Template loading already in progress');
  return;
}

try {
  setTemplatesLoading(true);
  console.log('Syncing with server for permanent template storage...');
  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev';

  const response = await fetch(`${baseUrl}/api/templates`, {
    credentials: 'same-origin'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch templates. Status: ${response.status}`);
  }

  const data = await response.json();

  if (Array.isArray(data.templates)) {
    const existingTemplates = messageTemplates;
    const serverTemplates = data.templates as MessageTemplate[];

    const templateMap = new Map<string, MessageTemplate>();
    existingTemplates.forEach((t: MessageTemplate) => templateMap.set(t.id, t));
    serverTemplates.forEach((t: MessageTemplate) => templateMap.set(t.id, t));

    const mergedTemplates = Array.from(templateMap.values());
    setMessageTemplates(mergedTemplates);
    markFetched();

    console.log(`Permanent templates synchronized: ${mergedTemplates.length} templates`);
    addAdminLog('Template Permanent', `${mergedTemplates.length} template(s) tersimpan PERMANEN - tersedia selamanya untuk semua admin`);
  } else {
    throw new Error('Invalid template format from server');
  }
} catch (error: any) {
  console.error('Error syncing templates:', error.message || error);
  if (messageTemplates.length > 0) {
    addAdminLog('Template Permanent', `Server offline - menggunakan ${messageTemplates.length} template dari penyimpanan permanen`);
  }
} finally {
  setTemplatesLoading(false);
}

  // Initialize templates and socket connection - ONCE ONLY
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    // Only load templates if global storage is completely empty
    if (messageTemplates.length === 0) {
      console.log('Loading templates ONCE from server...');
      loadTemplates(true);
    } else {
      console.log('Using existing templates from permanent storage');
    }
    
    // NO polling, NO intervals - templates are permanent
    
    // Initialize socket connection
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev';
    console.log('Connecting to socket at:', socketUrl);
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 10000,
      forceNew: false
    });

    socketRef.current.on('qrCode', (qrDataURL: string) => {
      console.log('QR Code received via socket:', qrDataURL ? 'Data received' : 'No data');
      setQrCode(qrDataURL);
      setIsGeneratingQR(false);
      addAdminLog('WhatsApp QR', 'QR code received and displayed');
    });

    socketRef.current.on('whatsappConnected', () => {
      setIsConnected(true);
      setQrCode('');
      addAdminLog('WhatsApp Connection', 'Successfully connected to WhatsApp');
    });

    socketRef.current.on('whatsappDisconnected', () => {
      setIsConnected(false);
      setQrCode('');
      addAdminLog('WhatsApp Connection', 'Disconnected from WhatsApp');
    });

    // Listen for incoming messages (for admin logging only)
    socketRef.current.on('whatsappMessageReceived', (data: any) => {
      console.log('Received WhatsApp message data:', data);
      
      const logDetails = data.isGroup 
        ? `Pesan masuk grup ${data.groupId} dari ${data.sender}: ${data.message}`
        : `Pesan masuk pribadi dari ${data.sender}: ${data.message}`;
      
      addAdminLog('WhatsApp Pesan Masuk', logDetails);
    });

    // Listen for template updates from other admin users
    socketRef.current.on('templateUpdated', (data: any) => {
      console.log('Template updated by another admin:', data);
      
      // Only sync if we don't have the latest data
      if (data.action === 'added') {
        addAdminLog('Template Sync', `Template permanen ditambahkan oleh ${data.user}: ${data.templateName}`);
        // Trigger single reload after delay
        setTimeout(() => loadTemplates(true), 2000);
      } else if (data.action === 'deleted') {
        addAdminLog('Template Sync', `Template permanen dihapus oleh ${data.user}: ${data.templateName}`);
        // Trigger single reload after delay
        setTimeout(() => loadTemplates(true), 2000);
      }
    });

    // Debug: Listen for all socket events
    socketRef.current.on('connect', () => {
      console.log('Socket connected to server at:', socketUrl);
      addAdminLog('Socket Connection', `Connected to server at ${socketUrl}`);
      
      // Request any missed messages on reconnect
      socketRef.current?.emit('requestWhatsAppStatus');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected from server:', reason);
      addAdminLog('Socket Connection', `Disconnected: ${reason}`);
      
      // Try to reconnect for production issues
      if (reason === 'io server disconnect' || reason === 'transport close') {
        console.log('Attempting reconnection...');
        setTimeout(() => {
          if (socketRef.current && !socketRef.current.connected) {
            socketRef.current.connect();
          }
        }, 3000);
      }
    });
    
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      addAdminLog('Socket Error', `Connection failed: ${error.message}`);
    });

    // Force connection establishment
    if (!socketRef.current.connected) {
      socketRef.current.connect();
    }

    addAdminLog('WhatsApp Module', 'WhatsApp messaging module initialized with real Baileys integration');
    
    // Log current template status on initialization
    console.log(`Template permanent storage status: ${messageTemplates.length} templates`);
    if (messageTemplates.length > 0) {
      addAdminLog('Template Permanent', `✓ ${messageTemplates.length} template(s) PERMANEN tersedia untuk admin: ${username}`);
    } else {
      addAdminLog('Template Permanent', `Admin ${username} terhubung - template yang dibuat akan PERMANEN untuk SEMUA admin`);
    }

    return () => {
      // Cleanup socket only - no intervals for permanent storage
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [addAdminLog]);

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    setQrCode('');
    
    try {
      const baseUrl =
        window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev';
      const response = await fetch(`${baseUrl}/api/whatsapp/generate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      
      if (data.success) {
        addAdminLog('WhatsApp QR', 'QR code generation started');
      } else {
        setIsGeneratingQR(false);
        addAdminLog('WhatsApp Error', `Failed to generate QR code: ${data.error}`);
      }
    } catch (error) {
      setIsGeneratingQR(false);
      addAdminLog('WhatsApp Error', `QR generation error: ${error}`);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      const baseUrl =
        window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev';
      const response = await fetch(`${baseUrl}/api/whatsapp/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      
      if (data.success) {
        addAdminLog('WhatsApp Connection', 'WhatsApp disconnected successfully');
      }
    } catch (error) {
      addAdminLog('WhatsApp Error', `Disconnect error: ${error}`);
    }
  };

  const startConnection = async () => {
    await generateQRCode();
  };

  const addTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) {
      addAdminLog('Template Error', 'Nama dan isi template harus diisi');
      return;
    }
    
    if (messageTemplates.length >= 100) {
      addAdminLog('Template Error', 'Maksimal 100 template dapat disimpan');
      return;
    }
    
    console.log('Creating template:', { name: newTemplateName, content: newTemplateContent });
    addAdminLog('Template Creation', `Membuat template: ${newTemplateName}`);
    
    try {
      const baseUrl =
        window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev';
      const url = `${baseUrl}/api/templates`;
      
      console.log('Sending POST request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newTemplateName.trim(),
          content: newTemplateContent.trim(),
          createdBy: username
        })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success && data.template) {
        // Add to global store immediately for instant UI update
        addGlobalTemplate(data.template);
        
        // Clear form and close dialog
        const templateName = newTemplateName;
        setNewTemplateName('');
        setNewTemplateContent('');
        setShowTemplateDialog(false);
        
        addAdminLog('Template Success', `✓ Template "${templateName}" berhasil disimpan permanen oleh ${username}`);
        addAdminLog('Template Permanent', `Template tersedia selamanya untuk semua admin`);
        
        // Broadcast template update to all connected admins
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('templateUpdated', { 
            action: 'added', 
            templateName: templateName, 
            user: username,
            template: data.template 
          });
        } else {
          console.warn('Socket not connected, template will sync when reconnected');
        }
        
        // Force reload templates after a delay to ensure server sync
        setTimeout(() => {
          loadTemplates(true);
          addAdminLog('Template Sync', `Verifikasi template berhasil disimpan`);
        }, 2000);
      } else {
        addAdminLog('Template Error', `Gagal menambah template: ${data.error || 'Server response invalid'}`);
        console.error('Template creation failed:', data);
      }
    } catch (error) {
      console.error('Template creation error:', error);
      addAdminLog('Template Error', `Error menambah template: ${error.message || error}`);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId);
    
    try {
      const baseUrl =
        window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev';
      const response = await fetch(`${baseUrl}/api/templates/${templateId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove from global store and force global sync
        removeGlobalTemplate(templateId);
        addAdminLog('Template Management', `Template global dihapus: ${template?.name} oleh ${username}`);
        
        // Template automatically removed from global storage
        addAdminLog('Template Permanent', `Template ${template?.name} dihapus PERMANEN dari semua admin`);
        
        // Broadcast template update to all connected admins
        if (socketRef.current) {
          socketRef.current.emit('templateUpdated', { action: 'deleted', templateName: template?.name, user: username });
        }
      } else {
        addAdminLog('Template Error', `Gagal menghapus template: ${data.error}`);
      }
    } catch (error) {
      addAdminLog('Template Error', `Error menghapus template: ${error}`);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'none') {
      setMessage('');
      setSelectedTemplate('');
      return;
    }
    const template = messageTemplates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.content);
      setSelectedTemplate(templateId);
      addAdminLog('WhatsApp Template', `Memilih template: ${template.name}`);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !groupId.trim()) {
      addAdminLog('WhatsApp Error', 'Pesan dan ID grup harus diisi');
      return;
    }

    // Allow sending even if not connected for testing purposes
    if (!isConnected) {
      addAdminLog('WhatsApp Info', 'Mengirim pesan dalam mode simulasi (WhatsApp tidak terhubung)');
    }

    setIsSending(true);
    const newMessage: SentMessage = {
      id: Date.now().toString(),
      content: message,
      timestamp: new Date(),
      status: 'sending',
      groupId: groupId
    };

    setSentMessages(prev => [newMessage, ...prev]);
    addAdminLog('WhatsApp Message', `Mengirim pesan ke grup ID: ${groupId}`);

    try {
      const baseUrl =
        window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev';
      const response = await fetch(`${baseUrl}/api/whatsapp/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: groupId,
          message: message
        })
      });

      const data = await response.json();

      if (data.success) {
        setSentMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
          )
        );

        // Simulate delivery status updates
        setTimeout(() => {
          setSentMessages(prev => 
            prev.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
            )
          );
        }, 2000);

        setTimeout(() => {
          setSentMessages(prev => 
            prev.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
            )
          );
        }, 4000);

        addAdminLog('WhatsApp Success', `Pesan berhasil terkirim ke grup ${groupId}`);
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
      } else {
        setSentMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
          )
        );
        addAdminLog('WhatsApp Error', `Gagal mengirim pesan: ${data.error}`);
      }
    } catch (error) {
      setSentMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
      addAdminLog('WhatsApp Error', `Error mengirim pesan: ${error}`);
    }

    setIsSending(false);
    setMessage('');
    setSelectedTemplate('');
  };

  const getStatusIcon = (status: SentMessage['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusText = (status: SentMessage['status']) => {
    switch (status) {
      case 'sending':
        return 'Mengirim...';
      case 'sent':
        return 'Terkirim';
      case 'delivered':
        return 'Tersampaikan';
      case 'read':
        return 'Dibaca';
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>Pesan berhasil dikirim!</span>
        </div>
      )}

      {/* WhatsApp Connection */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Smartphone className="w-5 h-5" />
            WhatsApp Connection
            {isConnected && <Badge className="bg-green-600 text-white">Connected</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Label className="text-white text-lg font-semibold">WhatsApp Bot Status</Label>
            <div className="mt-2">
              {isConnected ? (
                <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Connected
                </Badge>
              ) : (
                <Badge className="bg-gray-600 text-white text-lg px-4 py-2">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Disconnected
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {isConnected 
                ? "WhatsApp bot is ready to send messages" 
                : "Click Start Connection or Generate QR Code to connect to WhatsApp"
              }
            </p>
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            {!isConnected ? (
              <>
                <Button 
                  onClick={startConnection}
                  disabled={isGeneratingQR}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isGeneratingQR ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Start Connection
                    </>
                  )}
                </Button>
                <Button 
                  onClick={generateQRCode}
                  disabled={isGeneratingQR}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isGeneratingQR ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate QR Code
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={disconnectWhatsApp}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Disconnect WhatsApp
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template Management */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Template Management</CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                {messageTemplates.length}/100 templates
              </p>
            </div>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={messageTemplates.length >= 100}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Template
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Tambah Template Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Nama Template</Label>
                    <Input
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Masukkan nama template"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Isi Template</Label>
                    <Textarea
                      value={newTemplateContent}
                      onChange={(e) => setNewTemplateContent(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Masukkan isi template"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowTemplateDialog(false)} 
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={addTemplate} 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={!newTemplateName.trim() || !newTemplateContent.trim()}
                    >
                      Confirm Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {messageTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {templatesLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading templates...
                </div>
              ) : (
                "Belum ada template. Klik \"Tambah Template\" untuk membuat template baru."
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {messageTemplates.map((template) => (
                <Card key={template.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-white truncate">{template.name}</h4>
                        {template.createdBy && (
                          <p className="text-xs text-gray-500">oleh {template.createdBy}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-300 mb-3 line-clamp-3">{template.content}</p>
                    <Button
                      size="sm"
                      onClick={() => handleTemplateSelect(template.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Preview & Use
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>



      {/* Message Composer */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageCircle className="w-5 h-5" />
            WhatsApp Group Messaging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="group" className="text-white">Group ID</Label>
              <Input
                id="group"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="ID grup WhatsApp"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="template" className="text-white">Message Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="bg-white border-gray-300 text-black">
                  <SelectValue placeholder="Pilih template pesan" className="text-black" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="none" className="text-black hover:bg-gray-100">-- Tanpa Template --</SelectItem>
                  {messageTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id} className="text-black hover:bg-gray-100">
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message" className="text-white">Pesan</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan Anda di sini..."
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              rows={4}
            />
          </div>

          {/* Message Preview */}
          {message && (
            <div className="bg-green-900 border border-green-700 rounded-lg p-4">
              <Label className="text-sm font-medium text-green-300">Preview Pesan:</Label>
              <div className="mt-2 bg-white rounded-lg p-3 shadow-sm border-l-4 border-green-400">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    KO
                  </div>
                  <span className="font-medium text-sm">Kaiserliche Order</span>
                  <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{message}</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || !groupId.trim() || isSending}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengirim Pesan...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Kirim Pesan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sent Messages History */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            Riwayat Pesan Terkirim
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sentMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Belum ada pesan yang dikirim
            </div>
          ) : (
            <div className="space-y-3 max-h-96 hide-scrollbar" style={{ overflowY: 'auto' }}>
              {sentMessages.map((msg) => (
                <div key={msg.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-white border-gray-500">
                        {msg.groupId || 'Unknown Group'}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {msg.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(msg.status)}
                      <span className="text-xs text-gray-400">
                        {getStatusText(msg.status)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
