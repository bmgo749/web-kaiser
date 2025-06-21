export { default as AdminApp } from './AdminApp';
export { default as AdminLogin } from './AdminLogin';
export { default as AdminPanel } from './AdminPanel';
export { default as UserActivity } from './UserActivity';
export { default as WhatsAppMessaging } from './WhatsAppMessaging';
export { default as AdminLog } from './AdminLog';
export { default as UserProfile } from './UserProfile';
export { default as TerminalLog } from './TerminalLog';

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ["http://localhost:5000", "https://kaiserliche.my.id", "https://*.replit.dev", "https://*.replit.app"],
    methods: ["GET", "POST"],
    credentials: true
  },
});
