import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import * as authMiddleWares from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/create",
  authMiddleWares.authUser,
  body("name").isString().withMessage("Name is required"),
  projectController.createProject
);

router.put(
  "/add-user",
  authMiddleWares.authUser,
  body("projectId").isString().withMessage("projectId is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("users must be a non-empty array")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("each user must be a string"),
  projectController.addUserToProject // ✅ fixed case
);

router.get('/get-project/:projectId',
    authMiddleWares.authUser,projectController.getPropertybyId
)

router.get(
  "/all",
  authMiddleWares.authUser,
  projectController.getAllProjects
);
router.put("/leave",authMiddleWares.authUser,
  body("projectId").isString().withMessage("projectId is required"),
  projectController.leaveProject
);

export default router;
