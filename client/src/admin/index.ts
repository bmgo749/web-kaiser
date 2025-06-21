export { default as AdminApp } from './AdminApp';
export { default as AdminLogin } from './AdminLogin';
export { default as AdminPanel } from './AdminPanel';
export { default as UserActivity } from './UserActivity';
export { default as WhatsAppMessaging } from './WhatsAppMessaging';
export { default as AdminLog } from './AdminLog';
export { default as UserProfile } from './UserProfile';
export { default as TerminalLog } from './TerminalLog';
import { io } from 'socket.io-client';

const socket = io('https://api.kaiserliche.my.id', {
  transports: ['websocket'],
  withCredentials: true,
});

origin: [
  "http://localhost:5000",
  "https://api.kaiserliche.my.id",
  "https://*.replit.dev",
  "https://*.replit.app"
]

