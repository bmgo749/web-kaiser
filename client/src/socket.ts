// src/socket.ts
import { io, Socket } from 'socket.io-client';

const baseUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://kaiserliche.my.id';

const socket: Socket = io(baseUrl, {
  transports: ['websocket'],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 5000
});

// Optional: log
socket.on('reconnect_attempt', () => console.log('[socket] Reconnecting...'));
socket.on('reconnect', () => console.log('[socket] Reconnected'));
socket.on('connect', () => console.log('[socket] Connected'));
socket.on('disconnect', () => console.log('[socket] Disconnected'));

export default socket;
