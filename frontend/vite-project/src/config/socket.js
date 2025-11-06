import { io } from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  if (!socketInstance) {
    const token = localStorage.getItem("token");

    socketInstance = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      query: { projectId },
      transports: ["websocket"],
      reconnection: true,
    });

    console.log("Socket connected with token:", token);
  }
  return socketInstance;
};

// Listen to message
export const receiveMessage = (eventName, callback) => {
  socketInstance.on(eventName, callback);
};

// Send message
export const sendMessage = (eventName, data) => {
  socketInstance.emit(eventName, data);
};



