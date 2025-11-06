import userModel from "../models/user.models.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js";
import { status } from "init";

export const createUserController=async (req,res) =>{

    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const user=await userService.createUser(req.body)
        const token=await user.generateJWT()
        delete user._doc.password;
        res.status(201).json({user,token});
        
    } catch (error) {
        res.status(400).send(error.message);
    }
}
export const loginController = async (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({
                errors: [{ msg: "Invalid credentials" }]
            });
        }

        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return res.status(400).json({
                errors: [{ msg: "Invalid credentials" }]
            });
        }

        const token = await user.generateJWT();
        user.password = undefined;
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(400).send(error.message);
    }
    
};

export const profileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      user,
      tokenInfo: {
        exp: req.user.exp,
        expiresAt: new Date(req.user.exp * 1000).toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    await redisClient.set(token, "logout", "EX", 60 * 60 * 24); 

    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Server error during logout" });
  }
};
export const getAllUsersController = async (req, res) => {
  try {

    const loggedInUser = await userModel.findOne({ email: req.user.email });

    if (!loggedInUser) {
      return res.status(404).json({ error: "Logged-in user not found" });
    }


    const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

    return res.status(200).json({
      success: true,
      users: allUsers,
    });
  } catch (error) {
    console.error("Error in getAllUsersController:", error);
    return res.status(400).json({ error: error.message });
  }
};
