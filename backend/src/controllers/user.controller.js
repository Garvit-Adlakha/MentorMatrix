import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateTokens.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { catchAsync, AppError } from "../middleware/error.middleware.js";
import crypto from 'crypto';
import { sendEmail } from "../utils/sendEmail.js";
import mongoose from "mongoose";

/**
 * Create a new user account
 * @route POST /api/v1/user/signup
 */
export const createUserAccount = catchAsync(async (req, res, next) => {
    const { 
        name, 
        email, 
        password, 
        role = "student", 
        university, 
        department, 
        yearOfStudy, 
        skills = [], 
        expertise = [], 
        roll_no, 
        sap_id,
        cgpa
    } = req.body;

    const avatar=req.file?.avatar

    // Validate required fields
    if (!name || !email || !password) {
        return next(new AppError("Name, email and password are required", 400, "MISSING_REQUIRED_FIELDS"));
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return next(new AppError("User already exists with this email", 400, "USER_EXISTS"));
    }

    // Validate roll_no and sap_id for students
    if (role === "student" && (!roll_no || !sap_id)) {
        return next(new AppError("Roll number and SAP ID are required for students", 400, "MISSING_STUDENT_INFO"));
    }

    const Uploadedavatar=uploadMedia(avatar?.path)

    const resultAvatar={
        publicId: Uploadedavatar?.public_id,
        url: Uploadedavatar?.secure_url,
    }

    // Create new user
    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        resultAvatar,
        role,
        university,
        department, 
        cgpa,
        roll_no: role === "student" ? roll_no : undefined,
        sap_id: role === "student" ? sap_id : undefined,
        yearOfStudy: role === "student" ? yearOfStudy : undefined,
        skills: role === "student" ? skills.map(skill => skill.toLowerCase().trim()) : [],
        expertise: role === "mentor" ? expertise.map(exp => exp.toLowerCase().trim()) : [],
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined,
        availability: role === "mentor" ? true : undefined,
        passwordChangedAt: new Date(),
    });
    // Update last active timestamp
    await user.updateLastActive();
    // Send welcome email
    try {
        await sendEmail({
            email: user.email,
            subject: "Welcome to MentorMatrix",
            message: `
                <h1>Welcome to MentorMatrix, ${user.name}!</h1>
                <p>Thank you for joining our platform. We're excited to have you with us!</p>
                <p>You can now log in to your account and start exploring the platform.</p>
            `,
        });
    } catch (error) {
        console.error("Welcome email could not be sent:", error);
    }

    generateToken(res, user._id, "Account created successfully");
});

/**
 * Authenticate user
 * @route POST /api/v1/user/signin
 */
export const authenticateUser = catchAsync(async (req, res, next) => {
    const { email, password, rememberMe } = req.body;
    
    if (!email || !password) {
        throw new AppError("Email and password are required", 400, "MISSING_CREDENTIALS");
    }
    
    const user = await User.findOne({
        email: email.toLowerCase()
    }).select("+password");

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    // Check if user account is active
    if (user.status === 'inactive') {
        throw new AppError("Your account has been deactivated", 401, "ACCOUNT_INACTIVE");
    }

    // Update last login information
    user.lastLoginAt = new Date();
    await user.updateLastActive();
    await user.save({ validateBeforeSave: false });

    // Set token expiry based on rememberMe
    const tokenExpiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day

    generateToken(res, user._id, `Welcome back ${user.name}`, tokenExpiry);
});

/**
 * Sign out user
 * @route POST /api/v1/user/signout
 */
export const signOutUser = catchAsync(async(req, res) => {
    // Clear token cookie (legacy)
    res.cookie('token', "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        sameSite: 'strict'
    });
    
    
    res.status(200).json({
        success: true,
        message: "Signed out Successfully"
    });
});

/**
 * Get current user profile
 * @route GET /api/v1/user/profile
 */
export const getCurrentUserProfile = catchAsync(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const userProfile = await User.aggregate([
        {
            $match: { _id: userId }, 
        },
        {
            $lookup: {
                from: "projects",
                localField: "_id",
                foreignField: "createdBy",
                as: "leaderProjects", 
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "_id",
                foreignField: "teamMembers",
                as: "memberProjects", 
            },
        },
        {
            $addFields: {
                projects: { $setUnion: ["$leaderProjects", "$memberProjects"] },
                projectCount: { 
                    $size: { $setUnion: ["$leaderProjects", "$memberProjects"] } 
                }
            },
        },
        {
            $project: {
                password: 0, 
                resetPasswordToken: 0,
                resetPasswordExpire: 0,
                leaderProjects: 0,
                memberProjects: 0, 
            },
        },
    ]);

    if (!userProfile.length) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Update last active
    await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });

    res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        user: userProfile[0], 
    });
});

/**
 * Update user profile
 * @route PUT /api/v1/user/profile
 */
export const updateUserProfile = catchAsync(async (req, res) => {
    const { name, email, bio, skills, expertise, university, department, yearOfStudy } = req.body;
    const updateData = {};

    // Fetch the user
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Update basic fields if provided
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    if (university) updateData.university = university;
    if (department) updateData.department = department;
    if (yearOfStudy && user.role === "student") updateData.yearOfStudy = yearOfStudy;

    // Validate email update
    if (email && email.toLowerCase() !== user.email) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
            throw new AppError("Email is already in use", 400, "EMAIL_IN_USE");
        }
        updateData.email = email.toLowerCase();
    }

    // Update skills only if the user is a student
    if (skills && user.role === "student") {
        const uniqueSkills = [...new Set(skills.map(skill => skill.trim().toLowerCase()))];
        updateData.skills = uniqueSkills;
    }

    // Update expertise only if the user is a mentor
    if (expertise && user.role === "mentor") {
        const uniqueExpertise = [...new Set(expertise.map(exp => exp.trim().toLowerCase()))];
        updateData.expertise = uniqueExpertise;
    }

    // Handle avatar upload if file is provided
    if (req.file) {
        try {
            const avatarResult = await uploadMedia(req.file.path);
            updateData.avatar = avatarResult?.secure_url || req.file.path;

            // Delete old avatar if it's not the default one
            if (user.avatar && !user.avatar.includes("default-avatar")) {
                await deleteMediaFromCloudinary(user.avatar);
            }
        } catch (error) {
            throw new AppError("Error uploading profile image", 500, "UPLOAD_ERROR");
        }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
        runValidators: true,
    });

    if (!updatedUser) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            bio: updatedUser.bio,
            role: updatedUser.role,
            university: updatedUser.university,
            department: updatedUser.department,
            yearOfStudy: updatedUser.yearOfStudy,
            skills: updatedUser.skills,
            expertise: updatedUser.expertise,
            avatar: updatedUser.avatar,
        },
    });
});

/**
 * Change user password
 * @route POST /api/v1/user/change-password
 */
export const changeUserPassword = catchAsync(async(req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new AppError("Current password and new password are required", 400, "MISSING_PASSWORD_INFO");
    }

    // Get user with password field
    const user = await User.findById(req.user._id).select("+password");
    
    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Verify current password
    if (!(await user.comparePassword(currentPassword))) {
        throw new AppError("Current password is incorrect", 401, "INVALID_PASSWORD");
    }   

    // Check if new password is same as old
    if (await user.comparePassword(newPassword)) {
        throw new AppError("New password cannot be the same as your current password", 400, "SAME_PASSWORD");
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save(); // Pre-save hook will hash the password

    // Send password change notification email
    try {
        await sendEmail({
            email: user.email,
            subject: "Your MentorMatrix Password Has Been Changed",
            message: `
                <h1>Password Changed</h1>
                <p>Your password was changed successfully. If you did not make this change, please contact us immediately.</p>
            `,
        });
    } catch (error) {
        console.error("Password change email could not be sent:", error);
    }

    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    });
});

/**
 * Forgot password - sends reset email
 * @route POST /api/v1/user/forgot-password
 */
export const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        throw new AppError("Email address is required", 400, "MISSING_EMAIL");
    }
    
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
        throw new AppError("No user found with this email", 404, "USER_NOT_FOUND");
    }

    // Generate reset token & store only the hashed version
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL - in production, this should be a frontend URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            message: `
                <h1>Password Reset</h1>
                <p>You requested a password reset. Please click the button below to reset your password:</p>
                <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:white;padding:10px 15px;text-decoration:none;border-radius:4px;">Reset Password</a>
                <p>If you didn't request this, please ignore this email. This link is valid for 15 minutes.</p>
            `,
        });

        res.status(200).json({
            success: true,
            message: "Password reset instructions sent to email"
        });
    } catch (error) {
        // If email sending fails, clear reset tokens
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        throw new AppError("Failed to send reset email. Please try again later.", 500, "EMAIL_SEND_FAILED");
    }
});

/**
 * Reset password with token
 * @route POST /api/v1/user/reset-password/:token
 */
export const resetPassword = catchAsync(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    if (!password) {
        throw new AppError("New password is required", 400, "MISSING_PASSWORD");
    }

    // Hash the token to compare with stored hashed token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    // Find user with matching token and valid expiry
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");
  
    if (!user) {
        throw new AppError("Invalid or expired reset token", 400, "INVALID_RESET_TOKEN");
    }

    // Ensure new password is different from old one
    if (await user.comparePassword(password)) {
        throw new AppError("New password cannot be the same as the old password", 400, "SAME_PASSWORD");
    }

    // Update password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordChangedAt = new Date();
    await user.save();
  
    // Send confirmation email
    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Successful",
            message: `
                <h1>Password Reset Successful</h1>
                <p>Your password has been successfully reset. If you did not make this change, please contact us immediately.</p>
            `,
        });
    } catch (error) {
        console.error("Password reset confirmation email could not be sent:", error);
    }

    res.status(200).json({
        success: true,
        message: "Password reset successful"
    });
});

/**
 * Delete user account
 * @route DELETE /api/v1/user/delete-account
 */
export const deleteUserAccount = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
  
    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Delete avatar if not default
    if (user.avatar && !user.avatar.includes("default-avatar")) {
        try {
            await deleteMediaFromCloudinary(user.avatar);
        } catch (error) {
            console.error("Error deleting avatar:", error);
        }
    }
  
    // Delete user
    await User.findByIdAndDelete(req.user._id);
  
    // Clear authentication token
    res.cookie("token", "", { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        sameSite: 'strict'
    });
    
    res.status(200).json({
        success: true,
        message: "Account deleted successfully"
    });
});

/**
 * Get all mentors
 * @route GET /api/v1/user/mentors
 */
export const getAllMentors = catchAsync(async (req, res) => {
    const { search } = req.query;
  
    const filter = {
      role: "mentor",
    };
  
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { expertise: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }
  
    const mentors = await User.find(filter)
      .select('name email bio department expertise avatar university lastActiveAt')
      .sort({ lastActiveAt: -1 });
  
    res.status(200).json({
      success: true,
      count: mentors.length,
      mentors,
    });
  });
  

/**
 * Get mentor by ID
 * @route GET /api/v1/user/mentors/:id
 */
export const getMentorById = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const mentor = await User.findOne({
        _id: id,
        role: "mentor"
    }).select('-password -resetPasswordToken -resetPasswordExpire');
    
    if (!mentor) {
        throw new AppError("Mentor not found", 404, "MENTOR_NOT_FOUND");
    }
    
    res.status(200).json({
        success: true,
        mentor
    });
});

export const SearchMentor=catchAsync(async(req,res)=>{
    const { search } = req.query;
    const filter = {
        role: "mentor",
    };

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { department: { $regex: search, $options: 'i' } },
            { expertise: { $elemMatch: { $regex: search, $options: 'i' } } },
        ];
    }

    const mentors = await User.find(filter)
        .select('name email bio department expertise avatar university lastActiveAt')
        .sort({ lastActiveAt: -1 });

    res.status(200).json({
        success: true,
        count: mentors.length,
        mentors,
    });
});

