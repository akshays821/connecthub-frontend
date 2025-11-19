import { io } from 'socket.io-client';

let socket = null;

export function initializeSocket(userId) {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_BASE_URL);
    if (userId) socket.emit('register', userId);
  }
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
