import { io } from "socket.io-client";

let socket;

export const initializeSocket = (projectId) => {
  if (!socket) {
    const token = localStorage.getItem("token");
    socket = io("http://localhost:3000", {
      auth: { token },
      query: { projectId },
      transports: ["websocket"],
    });
  }
  return socket;
};

export const sendMessage = (event, data) => {
  if (socket) socket.emit(event, data);
};

export const receiveMessage = (event, callback) => {
  if (socket) socket.on(event, callback);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
