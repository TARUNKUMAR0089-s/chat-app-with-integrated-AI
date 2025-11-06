import React, { useContext, useState ,useEffect} from 'react';
import { UserContext } from "../context/UserContext.jsx";
import axiosInstance from "../config/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";


const Home = () => {
  const { user } = useContext(UserContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const navigate=useNavigate()

 
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!projectName.trim()) return;

  try {
    const res = await axiosInstance.post("/projects/create", {
      name: projectName.trim(),
    });

    console.log("Project created:", res.data);

    setProjects((prev) => [...prev, res.data.project]);

    setProjectName("");
    setIsModalOpen(false);
  } catch (err) {
    console.error("Error creating project:", err);
  }
};

useEffect(()=>{
  axiosInstance.get("/projects/all")
    .then((res)=>{
      setProjects(res.data.projects || []);
    })
    .catch(err=>{
      console.log(err);
    });
}, []);

     return (
         <main className="p-6 relative min-h-screen bg-gray-50">
     
      <div className="projects flex flex-wrap items-center gap-4">
    
        <button
          onClick={() => setIsModalOpen(true)}
          className="project p-4 border border-slate-300 rounded-xl shadow-sm hover:shadow-md transition bg-white flex flex-col items-center justify-center"
        >
          <i className="ri-links-fill text-2xl text-blue-600"></i>
          <span className="text-sm mt-2 text-gray-700">Create Project</span>
        </button>
        {projects.map((project) => (
         <div 
          key={project._id} 
          onClick={()=>{
            navigate('/project',{
              state:{project}
            })
          }}
           className=" flex flex-col cursor-pointer gap-2 p-4 bg-white border border-slate-300 rounded-xl shadow hover:bg-slate-300">
           <h3 className="font-semibold text-gray-800">{project.name}</h3>

                  <div className="flex gap-2 text-sm text-gray-500">
                  👥 {project.users?.length || 1} Members 
                  </div>
            </div>



            ))}

       
      </div>

      

      
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Save
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
