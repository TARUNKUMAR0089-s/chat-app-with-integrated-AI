import projectModel from '../models/project.models.js';
import mongoose from 'mongoose';


export const createProject=async ({
    name,userId
})=>{
    if(!name){
        throw new Error("Name is required")
    }
    if(!userId){
        throw new Error("userID is required")
    }
    const project=await projectModel.create({
        name,
        users:[userId]
    })
    return project;
}

export const addUserToProject = async ({ projectId, users, userId }) => {
  if (!projectId) throw new Error("projectId is required");
  if (!users) throw new Error("users is required");
  if (!userId) throw new Error("userId is required");

  if (!mongoose.Types.ObjectId.isValid(projectId))
    throw new Error("Invalid projectId");
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new Error("Invalid userId");
  if (!Array.isArray(users) || users.length === 0)
    throw new Error("users must be a non-empty array");

  const invalidUserIds = users.filter(u => !mongoose.Types.ObjectId.isValid(u));
  if (invalidUserIds.length > 0)
    throw new Error(`Invalid user IDs: ${invalidUserIds.join(", ")}`);


  const project = await projectModel.findById(projectId);
  console.log("Project in DB:", project);

  if (!project) {
    throw new Error("Project not found");
  }

  
 if (project.users[0].toString() !== userId.toString()) {
  throw new Error("Only the project creator can add users");
}


  const updatedProject = await projectModel.findByIdAndUpdate(
    projectId,
    { $addToSet: { users: { $each: users } } },
    { new: true }
  );

  if (!updatedProject) {
    throw new Error("Project update failed");
  }

  return {
    success: true,
    message: "Users added successfully",
    data: updatedProject,
  };
};


export const getProjectById = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId: must be a valid MongoDB ObjectId");
  }

  const project = await projectModel
    .findOne({ _id: projectId })
    .populate("users", "email name");

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

export const leaveProject = async ({ projectId, userId }) => {
  const project = await projectModel.findById(projectId);

  if (!project) throw new Error("Project not found");


  project.users = project.users.filter(u => u.toString() !== userId.toString());


  if (project.users.length === 0) {
    await projectModel.findByIdAndDelete(projectId);
    return { deleted: true };
  }

  await project.save();
  return project;
};
