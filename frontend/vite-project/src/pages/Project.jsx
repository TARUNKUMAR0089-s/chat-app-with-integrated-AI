import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../config/axios";
import { UserContext } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { initializeSocket, sendMessage, receiveMessage } from "../config/socket";

const Project = () => {
  const location = useLocation();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  const { user } = useContext(UserContext);
  const projectId = location.state.project._id;

  useEffect(() => {
    const socket = initializeSocket(projectId);

    receiveMessage("project-message", (data) => {
      setChatMessages((prev) => [...prev, { ...data, incoming: true }]);
      setTimeout(() => {
        const box = document.querySelector(".message-box");
        if (box) box.scrollTop = box.scrollHeight;
      }, 50);
    });

    receiveMessage("project-members", (members) => {
      setProjectMembers(members);
    });

    axiosInstance.get("/users/all").then((res) => setUsers(res.data.users));
    loadProjectMembers();

    return () => {
      socket.disconnect();
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

  const selectUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const sendCollaboratorsToProject = async () => {
    const payload = { projectId, users: selectedUsers };
    try {
      await axiosInstance.put("/projects/add-user", payload);
      await loadProjectMembers();
      setSelectedUsers([]);
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add members");
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
    setTimeout(() => {
      const box = document.querySelector(".message-box");
      if (box) box.scrollTop = box.scrollHeight;
    }, 50);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
 
  };

  const handleLeaveProject = async () => {
    if (!window.confirm("Are you sure you want to leave this project?")) return;

    try {
      await axiosInstance.put("/projects/leave", { projectId });
      alert("You left the project");
      setIsPanelOpen(false);
      window.history.back();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to leave project");
    }
  };

  return (
    <main className="h-screen w-screen flex bg-white">
      {/* LEFT CHAT */}
      <section className="flex flex-col h-full min-w-96 border-r bg-white">
        <header className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="text-2xl hover:bg-gray-100 p-2 rounded-full"
              onClick={() => setIsPanelOpen(true)}
            >
              <i className="ri-menu-fill"></i>
            </button>
            <h2 className="font-semibold text-lg">Collaborators</h2>
          </div>

          <button
            className="text-xl hover:bg-gray-100 p-2 rounded-full"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-user-add-line"></i>
          </button>
        </header>

        {/* CHAT BOX */}
        <div className="message-box flex flex-col flex-grow overflow-y-auto p-3 bg-gray-100">
          {chatMessages.map((msg, i) => {
            const isAI = msg.sender?.email === "AI";

            return (
              <div
                key={i}
                className={`my-1 ${msg.incoming ? "" : "flex justify-end"}`}
              >
                <div
                  className={`max-w-72 p-3 rounded-xl text-sm shadow ${
                    isAI
                      ? "bg-slate-300 text-gray-900 border border-blue-500"
                      : msg.incoming
                      ? "bg-white text-black"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  <small className="text-[10px] opacity-60 block mb-1 flex items-center gap-1">
                    {isAI && <span>🤖</span>}
                    {isAI
                      ? "AI"
                      : msg.incoming
                      ? msg.senderEmail || msg.sender?.email
                      : "You"}
                  </small>
                  <p>{msg.message}</p>
                </div>
              </div>
            );
          })}

          {typingUser && (
            <p className="text-xs text-gray-500 italic">{typingUser} typing...</p>
          )}
        </div>

        {/* CHAT INPUT */}
        <div className="w-full flex p-2 border-t bg-slate-200 gap-2">
          <input
            value={message}
            onChange={handleTyping}
            className="flex-grow p-2 px-4 rounded-full bg-white outline-none"
            placeholder="Message..."
          />
          <button onClick={send} className="text-xl text-blue-500">
            <i className="ri-send-plane-2-fill"></i>
          </button>
        </div>
      </section>

      {/* MEMBERS PANEL */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25 }}
            className="absolute left-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50 flex flex-col"
          >
            <div className="p-4 bg-slate-300 flex justify-between items-center border-b">
              <h3 className="font-semibold">Project Members</h3>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="text-xl"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="p-4 space-y-2 flex-grow overflow-y-auto">
              {projectMembers.map((u) => (
                <div
                  key={u._id}
                  className="p-2 bg-gray-100 rounded-md flex justify-between items-center"
                >
                  <span className="flex items-center gap-2">
                    <i className="ri-user-fill text-blue-600 text-lg"></i>
                    {u.name} ({u.email})
                  </span>

                  {u._id === user._id ? (
                    <button
                      onClick={handleLeaveProject}
                      className="text-red-600 text-sm font-semibold hover:underline"
                    >
                      Leave
                    </button>
                  ) : (
                    <span>✅</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD USER MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md h-[480px] flex flex-col relative">
                <div className="flex justify-between items-center border-b p-3">
                  <h2 className="font-semibold text-lg">Select Collaborators</h2>
                  <button onClick={() => setIsModalOpen(false)}>
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto flex-grow p-3 pb-20">
                  {users.map((u) => {
                    const isSelected = selectedUsers.includes(u._id);
                    const alreadyAdded = projectMembers.some(
                      (m) => m._id === u._id
                    );

                    return (
                      <button
                        key={u._id}
                        disabled={alreadyAdded}
                        onClick={() => selectUser(u._id)}
                        className={`flex justify-between items-center p-2 rounded-lg border text-sm
                          ${
                            alreadyAdded
                              ? "bg-gray-200 text-gray-500"
                              : isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-gray-50"
                          }
                          hover:bg-gray-200 transition`}
                      >
                        {u.name} ({u.email}){" "}
                        {alreadyAdded ? "✅" : isSelected && <i className="ri-check-line"></i>}
                      </button>
                    );
                  })}
                </div>

                <div className="absolute bottom-0 w-full p-3 bg-white border-t">
                  <button
                    onClick={sendCollaboratorsToProject}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full"
                  >
                    Add Collaborators
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Project;
