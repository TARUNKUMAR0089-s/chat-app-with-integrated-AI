import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext.jsx";
import axiosInstance from "../config/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/projects/all");
        setProjects(res.data.projects || []);
        setError("");
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.error || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!projectName.trim()) return;

  try {
    setLoading(true);
    const res = await axiosInstance.post("/projects/create", {
      name: projectName.trim(),
    });

    if (!res.data?.success || !res.data?.project) {
      throw new Error("Invalid server response");
    }

    const newProject = res.data.project;
    setProjects((prev) => [...prev, newProject]);
    setProjectName("");
    setIsModalOpen(false);
    setError("");

    setTimeout(() => {
      navigate("/project", { state: { project: newProject } });
    }, 500);
  } catch (err) {
    console.error("Error creating project:", err);
    setError(err.response?.data?.error || "Failed to create project");
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="p-6 relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Welcome, {user?.name || "User"}
      </h1>

      {loading && <p className="text-gray-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="projects flex flex-wrap items-center gap-4">
        {/* Create Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-4 border border-slate-300 rounded-xl shadow-sm hover:shadow-md transition bg-white flex flex-col items-center justify-center hover:scale-105"
        >
          <i className="ri-links-fill text-2xl text-blue-600"></i>
          <span className="text-sm mt-2 text-gray-700">Create Project</span>
        </button>

        {/* Project List */}
        {projects.map((project) => (
          <motion.div
            key={project._id}
            onClick={() => navigate("/project", { state: { project } })}
            whileHover={{ scale: 1.05 }}
            className="flex flex-col cursor-pointer gap-2 p-4 bg-white border border-slate-300 rounded-xl shadow hover:bg-blue-50 transition-all"
          >
            <h3 className="font-semibold text-gray-800">{project.name}</h3>
            <div className="flex gap-2 text-sm text-gray-500">
              👥 {project.users?.length || 1} Members
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Create a New Project
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="projectName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Project Name
                    </label>
                    <input
                      type="text"
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter project name"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Home;
