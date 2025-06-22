import { io, Socket } from 'socket.io-client';

const baseUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://c4cec392-80cf-4135-8816-be8dcce10e0a-00-184ek4rfyt86y.sisko.replit.dev/';

const socket: Socket = io(baseUrl, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  autoConnect: true
});

export default socket;
