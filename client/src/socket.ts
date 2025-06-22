import { io } from 'socket.io-client';

const baseUrl =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev';

export const socket = io(baseUrl, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});
