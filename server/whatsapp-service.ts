import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import qrTerminal from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';

interface WhatsAppServiceEvents {
  qrCode: (qr: string) => void;
  connected: () => void;
  disconnected: () => void;
  log: (message: string, level: 'info' | 'error' | 'warn') => void;
  messageReceived: (message: string, sender: string, isGroup: boolean, groupId?: string) => void;
}

class WhatsAppService {
  private sock: any = null;
  private events: WhatsAppServiceEvents;
  private isConnected = false;
  private qrString = '';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectionState = 'disconnected'; // disconnected, connecting, connected
  private botPhoneNumber: string | null = null;

  constructor(events: WhatsAppServiceEvents) {
    this.events = events;
  }

  async initialize() {
    // Prevent multiple simultaneous initialization attempts
    if (this.connectionState === 'connecting') {
      this.events.log('Already attempting to connect, skipping duplicate initialization', 'warn');
      return;
    }

    this.connectionState = 'connecting';
    
    try {
      // Clear any existing timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      const authDir = path.join(process.cwd(), 'baileys_auth_info');
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(authDir);

      // Create a proper logger that doesn't cause crashes
      const customLogger = {
        level: 'silent',
        child: () => customLogger,
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        fatal: () => {}
      };

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // We handle QR display manually
        logger: customLogger,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        markOnlineOnConnect: false,
        retryRequestDelayMs: 5000,
        maxMsgRetryCount: 3,
        generateHighQualityLinkPreview: true
      });

      this.sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrString = qr;
          console.log('🔄 QR Code received from WhatsApp, generating image display...');
          
          try {
            // Generate image QR code only
            const qrCodeDataURL = await QRCode.toDataURL(qr, {
              width: 300,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            });
            
            // Send QR image to terminal log
            this.events.log('📱 WhatsApp QR Code - Scan dengan HP:', 'info');
            this.events.log(`QR_CODE_IMAGE:${qrCodeDataURL}`, 'info');
            this.events.log('📱 Buka WhatsApp → Linked Devices → Link a Device → Scan QR', 'info');
            this.events.log(`🔗 QR Data: ${qr.substring(0, 60)}...`, 'info');
            
            console.log('✅ QR Code image sent to terminal log successfully');
            
            // Also send QR via socket
            this.events.qrCode(qrCodeDataURL);
            
          } catch (error) {
            console.log('QR Code generation error:', error);
            this.events.log(`QR Code generation failed: ${error}`, 'error');
          }
        }

        if (connection === 'close') {
          this.connectionState = 'disconnected';
          const reasonCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const wasConnected = this.isConnected;
          
          this.isConnected = false;
          
          if (wasConnected) {
            this.events.disconnected();
            this.events.log('Koneksi WhatsApp terputus', 'warn');
          }

          // Check specific disconnect reasons to decide if we should reconnect
          if (reasonCode === DisconnectReason.loggedOut) {
            this.events.log('WhatsApp logout - siap untuk koneksi ulang dengan QR code baru', 'info');
            this.events.log('📱 Klik "Generate QR Code" untuk mendapatkan QR code baru', 'info');
            this.qrString = ''; // Clear old QR to ensure new one gets generated
            this.reconnectAttempts = 0;
            return;
          }
          
          if (reasonCode === DisconnectReason.restartRequired) {
            this.events.log('WhatsApp memerlukan restart - mencoba koneksi ulang', 'warn');
          }

          // Only auto-reconnect for connection issues, not logout
          if (this.reconnectAttempts < this.maxReconnectAttempts && 
              reasonCode !== DisconnectReason.loggedOut &&
              reasonCode !== DisconnectReason.multideviceMismatch) {
            
            this.reconnectAttempts++;
            const delay = Math.min(15000 * this.reconnectAttempts, 60000); // Longer progressive delay up to 60s
            
            this.events.log(`Mencoba koneksi ulang ${this.reconnectAttempts}/${this.maxReconnectAttempts} dalam ${delay/1000} detik`, 'info');
            
            this.reconnectTimeout = setTimeout(() => {
              if (this.connectionState === 'disconnected') {
                this.initialize();
              }
            }, delay);
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.events.log('Batas maksimal percobaan koneksi tercapai. Silakan reset koneksi secara manual.', 'error');
            this.reconnectAttempts = 0;
          }
        } else if (connection === 'open') {
          this.connectionState = 'connected';
          this.isConnected = true;
          this.reconnectAttempts = 0; // Reset on successful connection
          
          // Get bot's own phone number
          try {
            const botInfo = this.sock.user;
            if (botInfo && botInfo.id) {
              this.botPhoneNumber = botInfo.id.split(':')[0];
              console.log('Bot phone number:', this.botPhoneNumber);
            }
          } catch (error) {
            console.log('Could not get bot phone number:', error);
          }
          
          // Clear any pending reconnection attempts
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
          }
          
          this.events.connected();
          this.events.log('WhatsApp berhasil terhubung!', 'info');
          console.log('\n✅ WhatsApp berhasil terhubung dan siap digunakan!\n');
        } else if (connection === 'connecting') {
          this.events.log('Menghubungkan ke WhatsApp...', 'info');
          console.log('\n⏳ Sedang menghubungkan ke WhatsApp...\n');
        }
      });

      this.sock.ev.on('creds.update', saveCreds);

      // Listen for incoming messages
      this.sock.ev.on('messages.upsert', async (m: any) => {
        const messages = m.messages || [];
        
        for (const message of messages) {
          // Skip messages sent by the bot itself
          if (message.key.fromMe) continue;
          
          // Skip if no message content
          if (!message.message) continue;
          
          // Skip status messages, broadcast messages, and newsletters
          const senderId = message.key.remoteJid;
          if (!senderId || 
              senderId.includes('status@broadcast') || 
              senderId.includes('@newsletter') ||
              senderId.includes('@lid')) continue;
          
          // Skip if message is just media without text content
          const messageText = message.message.conversation || 
                             message.message.extendedTextMessage?.text || 
                             message.message.imageMessage?.caption ||
                             message.message.videoMessage?.caption;
          
          // Only process messages with actual text content
          if (!messageText || messageText.trim() === '') continue;
          
          const isGroup = senderId && senderId.includes('@g.us');
          
          if (isGroup) {
            // Group message
            const groupId = senderId;
            const senderNumber = message.key.participant || 'Unknown';
            const cleanGroupId = groupId.replace('@g.us', '');
            const cleanSender = senderNumber.replace('@s.whatsapp.net', '');
            
            // Skip if sender is empty, invalid, or is the bot itself
            if (!cleanSender || cleanSender === 'Unknown') continue;
            if (this.botPhoneNumber && cleanSender === this.botPhoneNumber) continue;
            
            this.events.messageReceived(
              messageText, 
              cleanSender, 
              true, 
              cleanGroupId
            );
            this.events.log(`Pesan grup diterima dari grup ${cleanGroupId} oleh ${cleanSender}: ${messageText}`, 'info');
          } else {
            // Private message
            const cleanSender = senderId.replace('@s.whatsapp.net', '');
            
            // Skip if sender is empty, invalid, or is the bot itself
            if (!cleanSender) continue;
            if (this.botPhoneNumber && cleanSender === this.botPhoneNumber) continue;
            
            this.events.messageReceived(
              messageText, 
              cleanSender, 
              false
            );
            this.events.log(`Pesan pribadi diterima dari ${cleanSender}: ${messageText}`, 'info');
          }
        }
      });

    } catch (error) {
      this.connectionState = 'disconnected';
      this.events.log(`Error inisialisasi WhatsApp: ${error}`, 'error');
      console.log(`\n❌ Error inisialisasi WhatsApp: ${error}\n`);
      
      // Only retry initialization errors with longer delays
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = 20000 * this.reconnectAttempts; // 20, 40, 60 seconds
        
        this.events.log(`Mencoba inisialisasi ulang dalam ${delay/1000} detik (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, 'warn');
        
        this.reconnectTimeout = setTimeout(() => {
          if (this.connectionState === 'disconnected') {
            this.initialize();
          }
        }, delay);
      } else {
        this.events.log('Gagal inisialisasi setelah beberapa percobaan. Silakan reset koneksi manual.', 'error');
        this.reconnectAttempts = 0;
      }
    }
  }

  async sendMessage(groupId: string, message: string): Promise<boolean> {
    if (!this.isConnected || !this.sock) {
      this.events.log('WhatsApp not connected', 'error');
      return false;
    }

    try {
      // Ensure groupId has the correct format
      const formattedGroupId = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`;
      
      await this.sock.sendMessage(formattedGroupId, { text: message });
      this.events.log(`Message sent to group ${groupId}`, 'info');
      return true;
    } catch (error) {
      this.events.log(`Failed to send message: ${error}`, 'error');
      return false;
    }
  }

  disconnect() {
    // Clear any pending reconnection attempts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.reconnectAttempts = 0;
    this.connectionState = 'disconnected';
    
    if (this.sock) {
      try {
        // Only attempt logout if still connected and connection is active
        if (this.isConnected && this.connectionState === 'connected') {
          this.events.log('Memutus koneksi dan logout dari perangkat WhatsApp...', 'info');
          this.sock.logout();
          this.events.log('✓ WhatsApp logout berhasil - perangkat terputus dari website', 'info');
          console.log('\n✓ WhatsApp logout berhasil - perangkat terputus dari website\n');
        } else {
          this.events.log('WhatsApp sudah terputus, membersihkan sisa koneksi...', 'info');
        }
      } catch (error) {
        // Expected error when connection is already closed
        console.log('Safe disconnect (connection already closed):', error);
        this.events.log('Pembersihan koneksi WhatsApp selesai', 'info');
      }
      
      try {
        this.sock.end();
      } catch (error) {
        // Ignore errors during socket cleanup
      }
      
      this.sock = null;
      this.isConnected = false;
      this.qrString = '';
      this.events.disconnected();
      this.events.log('Koneksi WhatsApp terputus sepenuhnya', 'info');
      console.log('\n🔌 WhatsApp berhasil terputus sepenuhnya\n');
    }
  }

  // Add method to manually reset connection attempts
  resetConnection() {
    console.log('\n🔄 Mereset koneksi WhatsApp...\n');
    this.disconnect();
    this.reconnectAttempts = 0;
    this.qrString = '';
    this.events.log('Koneksi direset - siap untuk percobaan baru', 'info');
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getCurrentQR(): string {
    return this.qrString;
  }
}

export default WhatsAppService;