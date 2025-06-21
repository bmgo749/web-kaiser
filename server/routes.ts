import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import WhatsAppService from "./whatsapp-service";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ["http://localhost:5000", "https://kaiserliche.my.id", "https://*.replit.dev", "https://*.replit.app"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  let whatsappService: WhatsAppService | null = null;
  const terminalLogs: Array<{ timestamp: Date; message: string; level: string }> = [];

  const addLog = (message: string, level: 'info' | 'error' | 'warn' = 'info') => {
    const logEntry = { timestamp: new Date(), message, level };
    terminalLogs.push(logEntry);
    if (terminalLogs.length > 100) {
      terminalLogs.shift(); // Keep only last 100 logs
    }
    io.emit('terminalLog', logEntry);
  };

  // WhatsApp API routes
  app.post('/api/whatsapp/generate-qr', async (req, res) => {
    try {
      // Safe disconnect any existing service
      if (whatsappService) {
        try {
          whatsappService.disconnect();
          addLog('Previous WhatsApp connection cleaned up', 'info');
        } catch (error) {
          addLog('Previous WhatsApp connection force cleaned', 'info');
        }
        whatsappService = null;
        
        // Wait a moment for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      whatsappService = new WhatsAppService({
        qrCode: (qrDataURL: string) => {
          console.log('QR Code received, data length:', qrDataURL?.length || 0);
          
          if (qrDataURL && qrDataURL.startsWith('data:image/png;base64,')) {
            // Add to terminal logs immediately with forced broadcast
            const qrLogEntry = {
              timestamp: new Date(),
              message: `QR_CODE_DATA:${qrDataURL}`,
              level: 'info'
            };
            terminalLogs.push(qrLogEntry);
            
            console.log('Broadcasting QR code to all admin panels...');
            
            // Force broadcast to all connected clients
            io.emit('terminalLog', qrLogEntry);
            io.emit('qrCode', qrDataURL);
            
            addLog('📱 QR Code WhatsApp BERHASIL ditampilkan di Terminal Log', 'info');
            console.log('QR Code successfully broadcasted to terminal log');
          } else {
            console.log('Invalid QR code data received:', qrDataURL?.substring(0, 50));
            addLog('❌ QR Code data tidak valid', 'error');
          }
        },
        connected: () => {
          io.emit('whatsappConnected');
        },
        disconnected: () => {
          io.emit('whatsappDisconnected');
        },
        log: addLog,
        messageReceived: (message: string, sender: string, isGroup: boolean, groupId?: string) => {
          const logMessage = isGroup 
            ? `Pesan masuk dari grup ${groupId} oleh ${sender}: ${message}`
            : `Pesan masuk dari ${sender}: ${message}`;
          
          addLog(logMessage, 'info');
          console.log('Broadcasting message to admin panel:', { message, sender, isGroup, groupId });
          
          // Add to terminal logs for WhatsApp messages
          io.emit('terminalLog', {
            timestamp: new Date(),
            message: `[WhatsApp] ${logMessage}`,
            level: 'info'
          });
          
          // Emit to admin panel
          io.emit('whatsappMessageReceived', {
            message,
            sender,
            isGroup,
            groupId: groupId || sender,
            timestamp: new Date()
          });
        }
      });

      await whatsappService.initialize();
      addLog('WhatsApp service initialized, generating QR code...', 'info');
      
      res.json({ success: true, message: 'QR code generation started' });
    } catch (error: any) {
      addLog(`Failed to initialize WhatsApp service: ${error}`, 'error');
      res.status(500).json({ success: false, error: error?.message || 'Unknown error' });
    }
  });

  app.post('/api/whatsapp/send-message', async (req, res) => {
    const { groupId, message } = req.body;

    if (!whatsappService || !whatsappService.getConnectionStatus()) {
      return res.status(400).json({ 
        success: false, 
        error: 'WhatsApp not connected. Generate QR code first.' 
      });
    }

    if (!groupId || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Group ID and message are required' 
      });
    }

    try {
      const success = await whatsappService.sendMessage(groupId, message);
      
      if (success) {
        addLog(`Message sent to group ${groupId}: ${message.substring(0, 50)}...`, 'info');
        res.json({ success: true, message: 'Message sent successfully' });
      } else {
        res.status(500).json({ success: false, error: 'Failed to send message' });
      }
    } catch (error: any) {
      addLog(`Error sending message: ${error}`, 'error');
      res.status(500).json({ success: false, error: error?.message || 'Unknown error' });
    }
  });

  // Status endpoint removed to prevent excessive polling that causes connection issues
  // Connection status is now managed only through socket events

  app.get('/api/whatsapp/logs', (req, res) => {
    res.json({ logs: terminalLogs });
  });

  app.post('/api/whatsapp/clear-logs', (req, res) => {
    terminalLogs.length = 0; // Clear the logs array
    addLog('Terminal logs cleared by admin user', 'info');
    res.json({ success: true, message: 'Logs cleared successfully' });
  });

  app.post('/api/whatsapp/disconnect', (req, res) => {
    try {
      if (whatsappService) {
        whatsappService.disconnect();
        whatsappService = null;
        addLog('WhatsApp disconnected by user', 'info');
      }
      res.json({ success: true, message: 'WhatsApp disconnected' });
    } catch (error: any) {
      addLog(`Disconnect completed with cleanup: ${error.message}`, 'info');
      whatsappService = null;
      res.json({ success: true, message: 'WhatsApp disconnected (with cleanup)' });
    }
  });

  app.post('/api/whatsapp/reset', async (req, res) => {
    try {
      if (whatsappService) {
        whatsappService.resetConnection();
        addLog('WhatsApp connection reset - ready for reconnection', 'info');
      }
      res.json({ success: true, message: 'WhatsApp connection reset successfully' });
    } catch (error: any) {
      addLog(`Failed to reset WhatsApp connection: ${error}`, 'error');
      res.status(500).json({ success: false, error: error?.message || 'Unknown error' });
    }
  });

  // User activity tracking endpoint
  app.post('/api/user-activity', (req, res) => {
    const { activity, userAgent } = req.body;
    
    // Extract basic info from user agent
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const platform = isMobile ? 'Mobile' : 'Desktop';
    
    const activityData = {
      username: `${platform} User`,
      activity: activity || 'Visited website',
      timestamp: new Date(),
      userAgent: userAgent
    };
    
    // Emit to all connected admin panels
    io.emit('userActivity', activityData);
    
    addLog(`User activity: ${activityData.username} - ${activityData.activity}`, 'info');
    
    res.json({ success: true, message: 'Activity tracked' });
  });

  // Template management endpoints
  app.get('/api/templates', async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json({ success: true, templates });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Unknown error' });
    }
  });

  app.post('/api/templates', async (req, res) => {
    try {
      console.log('Template creation request received:', req.body);
      console.log('Request headers:', req.headers);
      
      const { name, content, createdBy } = req.body;
      
      if (!name || !content) {
        console.log('Template validation failed: missing name or content');
        return res.status(400).json({ success: false, error: 'Name and content are required' });
      }

      const templates = await storage.getTemplates();
      console.log(`Current template count: ${templates.length}`);
      
      if (templates.length >= 100) {
        console.log('Template limit reached');
        return res.status(400).json({ success: false, error: 'Maximum 100 templates allowed' });
      }

      const template = await storage.addTemplate({ 
        name: name.trim(), 
        content: content.trim(), 
        createdBy: createdBy || 'Admin' 
      });
      
      console.log('Template created successfully:', template);
      
      // Broadcast template update to all connected clients
      io.emit('templateUpdated', { 
        action: 'added', 
        templateName: name, 
        user: createdBy || 'Admin',
        template: template 
      });
      
      addLog(`Template created: ${name} by ${createdBy || 'Admin'}`, 'info');
      
      res.json({ success: true, template });
    } catch (error: any) {
      console.error('Template creation error:', error);
      addLog(`Template creation error: ${error.message}`, 'error');
      res.status(500).json({ success: false, error: error?.message || 'Unknown error' });
    }
  });

  app.delete('/api/templates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTemplate(id);
      
      if (deleted) {
        res.json({ success: true, message: 'Template deleted successfully' });
      } else {
        res.status(404).json({ success: false, error: 'Template not found' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Unknown error' });
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    // Send existing logs to new connection
    socket.emit('existingLogs', terminalLogs);
    
    // Handle template update broadcasts
    socket.on('templateUpdated', (data) => {
      // Broadcast template updates to all other connected clients
      socket.broadcast.emit('templateUpdated', data);
      addLog(`Template ${data.action} by ${data.user}: ${data.templateName}`, 'info');
    });
    
    console.log('Admin client connected to socket server');
  });

  return httpServer;
}
