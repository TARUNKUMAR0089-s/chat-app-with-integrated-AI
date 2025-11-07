import 'dotenv/config';
import http from 'http';
import { Server } from "socket.io";
import app from './app.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import connect from "./db/db.js";
import projectModel from './models/project.models.js'; 
import { generateResult } from './services/api.services.js';

const PORT = process.env.PORT || 3000;

connect();

const server = http.createServer(app);
 const io = new Server(server, {
  cors: {
     origin: "chat-app-with-integrated-ai.vercel.app",
     origin: "https://chat-app-with-integrated-ai.vercel.app",
    credentials: true
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectId"));
    }

    const project = await projectModel.findById(projectId);
    if (!project) return next(new Error("Project not found"));

    socket.project = project;

    if (!token) return next(new Error("Authorization error"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;

    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    next(new Error("Unauthorized token"));
  }
});

io.on("connection", async (socket) => {
  socket.roomId = socket.project._id.toString();

  console.log("Client connected:", socket.user.email);
  socket.join(socket.roomId);

  const project = await projectModel.findById(socket.roomId);
  if (project) {
    const alreadyExists = project.users.some(
      (u) => u.toString() === socket.user.id
    );
    if (!alreadyExists) {
      project.users.push(socket.user.id);
      await project.save();
    }

    const updatedProject = await projectModel
      .findById(socket.roomId)
      .populate("users", "email");

    io.to(socket.roomId).emit("project-members", updatedProject.users);
  }

  socket.on("project-message", async (data) => {
    const message = data.message;
    const aiISpresentINmessage = message.includes("@ai");

    if (aiISpresentINmessage) {
      const prompt = message.replace("@ai", "");
      const result = await generateResult(prompt);

      io.to(socket.roomId).emit("project-message", {
        message: result,
        sender: { _id: "ai", email: "AI" },
        senderEmail: "AI",
      });
      return;
    }

    socket.broadcast.to(socket.roomId).emit("project-message", {
      message: data.message,
      sender: socket.user.email,
      senderEmail: socket.user.email,
    });
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.user.email);
    const project = await projectModel
      .findById(socket.roomId)
      .populate("users", "email");
    io.to(socket.roomId).emit("project-members", project.users);
    socket.leave(socket.roomId);
  });
});

server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
