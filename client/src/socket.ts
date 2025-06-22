// src/socket.ts
import { io, Socket } from 'socket.io-client';

const baseUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev';

const socket: Socket = io(baseUrl, {
  transports: ['websocket'],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 9999,
  reconnectionDelay: 0,
  timeout: 5000
});

// Optional: log
socket.on('reconnect_attempt', () => console.log('[socket] Reconnecting...'));
socket.on('reconnect', () => console.log('[socket] Reconnected'));
socket.on('connect', () => console.log('[socket] Connected'));
socket.on('disconnect', () => console.log('[socket] Disconnected'));

export default socket;
