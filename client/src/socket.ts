// src/socket.ts
import { io } from 'socket.io-client';

const baseUrl =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev';

const socket = io(baseUrl, {
  transports: ['websocket'],
  withCredentials: true,
  autoConnect: true, // otomatis konek
  reconnection: true, // reconnect otomatis
  reconnectionAttempts: 99,
  reconnectionDelay: 1000
});

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});
socket.on('disconnect', () => {
  console.log('❌ Socket disconnected');
});
socket.on('connect_error', (err) => {
  console.error('❗ Socket connection error:', err.message);
});

export default socket;
