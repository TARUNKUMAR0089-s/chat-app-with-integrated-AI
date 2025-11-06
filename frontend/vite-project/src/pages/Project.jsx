import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../config/axios";
import { UserContext } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  initializeSocket,
  sendMessage,
  receiveMessage,
  disconnectSocket,
} from "../config/socket";

const Project = () => {
  const location = useLocation();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const { user } = useContext(UserContext);
  const projectId = location.state.project._id;

  useEffect(() => {
    const socket = initializeSocket(projectId);

    socket.off("project-message");
    socket.off("project-members");

    receiveMessage("project-message", (data) => {
      setChatMessages((prev) => [...prev, { ...data, incoming: true }]);
    });

    receiveMessage("project-members", (members) => {
      setProjectMembers(members);
    });

    axiosInstance.get("/users/all").then((res) => setUsers(res.data.users));
    loadProjectMembers();

    return () => {
      disconnectSocket();
    };
  }, []);

  const loadProjectMembers = async () => {
    try {
      const res = await axiosInstance.get(`/projects/get-project/${projectId}`);
      setProjectMembers(res.data.project.users);
    } catch (err) {
      console.log("Load Members Error:", err);
    }
  };

  const send = () => {
    if (!user || !message.trim()) return;

    const newMsg = { message, sender: user._id };
    sendMessage("project-message", newMsg);

    setChatMessages((prev) => [
      ...prev,
      { ...newMsg, incoming: false, senderEmail: user.email },
    ]);

    setMessage("");
  };

  return (
    <main className="h-screen flex">
      {/* Chat section */}
      <section className="flex flex-col h-full min-w-96 border-r bg-white">
        <header className="flex justify-between items-center p-4 border-b bg-white">
          <h2 className="font-semibold text-lg">Project Chat</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xl hover:bg-gray-100 p-2 rounded-full"
          >
            <i className="ri-user-add-line"></i>
          </button>
        </header>

        <div className="message-box flex flex-col flex-grow overflow-y-auto p-3 bg-gray-100">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`my-1 ${msg.incoming ? "" : "flex justify-end"}`}
            >
              <div
                className={`max-w-72 p-3 rounded-xl text-sm shadow ${
                  msg.senderEmail === "AI"
                    ? "bg-slate-300 text-gray-900 border border-blue-500"
                    : msg.incoming
                    ? "bg-white text-black"
                    : "bg-blue-500 text-white"
                }`}
              >
                <small className="block text-[10px] opacity-60 mb-1">
                  {msg.senderEmail === "AI"
                    ? "🤖 AI"
                    : msg.incoming
                    ? msg.senderEmail
                    : "You"}
                </small>
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full flex p-2 border-t bg-slate-200 gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-2 px-4 rounded-full bg-white outline-none"
            placeholder="Message..."
          />
          <button onClick={send} className="text-xl text-blue-500">
            <i className="ri-send-plane-2-fill"></i>
          </button>
        </div>
      </section>
    </main>
  );
};

export default Project;
