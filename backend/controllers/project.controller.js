import projectModel from '../models/project.models.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.models.js';
import pkg from 'express-validator';
const { validationResult } = pkg;

export const createProject=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
   try {
    const {name}=req.body;
    const loggedINUser = await userModel.findOne({ email: req.user.email });

    const userId=loggedINUser._id


     const existingProject = await projectModel.findOne({
      name: name.toLowerCase(),
      users: userId
    });

    if (existingProject) {
      return res
        .status(400)
        .json({ error: "project name must be unique" });
    }

   const newProject = await projectService.createProject({ name, userId });
    res.status(201).json(newProject)
 } catch (error) {
    console.log(error)
    res.status(400).send(error.message)
    
   }

}
export const addUserToProject = async (req, res) => {
  // --- Validate incoming request body ---
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, users } = req.body; // ✅ fixed here
    const loggedInUser = await userModel.findOne({ email: req.user.email });

    if (!loggedInUser) {
      return res.status(404).json({ error: "Logged-in user not found" });
    }

    const project = await projectService.addUserToProject({
      projectId,
      users,
      userId: loggedInUser._id,
    });

    return res.status(200).json({
      success: true,
      message: "Users added successfully",
      project,
    });
  } catch (error) {
    console.error("Error in addUserToProject:", error);
    return res.status(400).json({ error: error.message });
  }
};
export const getAllProjects = async (req, res) => {
  try {
    const projects = await projectModel
      .find()
      .populate("users", "name email")

    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getPropertybyId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await projectService.getProjectById({ projectId });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Error in getPropertybyId:", error.message); 
    res.status(400).json({ error: error.message });
  }
};

export const leaveProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email });

    if (!loggedInUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await projectService.leaveProject({
      projectId,
      userId: loggedInUser._id
    });

    return res.status(200).json({
      success: true,
      message: "User left the project",
      result
    });

  } catch (error) {
    console.error("Leave Project Error:", error);
    return res.status(500).json({ error: error.message });
  }
};



