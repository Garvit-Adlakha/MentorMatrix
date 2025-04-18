import express from "express";
import {
    authenticateUser,
    changeUserPassword,
    createUserAccount,
    deleteUserAccount,
    getCurrentUserProfile,
    signOutUser,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    getAllMentors,
    SearchMentor,

} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import upload from "../utils/multer.js";
import { validateSignup, validateSignin, validatePasswordChange } from "../middleware/validation.middleware.js";

const router = express.Router();

// Auth routes
router.post("/signup", validateSignup, createUserAccount);
router.post("/signin", validateSignin, authenticateUser);
router.post("/signout", signOutUser); // No authentication middleware for signout

// Profile routes
router.get("/profile", isAuthenticated, getCurrentUserProfile);
router.patch("/profile", isAuthenticated, upload.single("avatar"), updateUserProfile);

router.get('/mentor/search',isAuthenticated,SearchMentor)
// Password routes
router.patch("/change-password", isAuthenticated, validatePasswordChange, changeUserPassword);
router.delete("/account", isAuthenticated, deleteUserAccount);

// Forgot Password Route (validate email)
router.post(
    "/forgot-password",
    forgotPassword
);

router.get('/mentor',getAllMentors)

// Reset Password Route (validate new password)
router.post(
    "/reset-password/:token",
    resetPassword
);

export default router;
