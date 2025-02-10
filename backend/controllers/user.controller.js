import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateTokens.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import crypto from 'crypto'
import { sendEmail } from "../utils/sendEmail.js";
import mongoose from "mongoose";

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

    // Check if the user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return next(new AppError("User already exists", 400));
    }

    // Validate roll_no and sap_id for students
    if (role === "student" && (!roll_no || !sap_id)) {
        return next(new AppError("Roll number and SAP ID are required for students", 400));
    }

    // Create new user
    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role,
        university,
        department, 
        cgpa,
        roll_no: role === "student" ? roll_no : undefined,
        sap_id: role === "student" ? sap_id : undefined,
        yearOfStudy: role === "student" ? yearOfStudy : undefined,
        skills: role === "student" ? skills : [],
        expertise: role === "mentor" ? expertise : [],
    });

    // Update last active timestamp
    await user.updateLastActive();

    // ✅ Fix: Ensure only ONE response is sent
    generateToken(res, user._id, "Account created successfully");
});


export const authenticateUser=catchAsync(async (req,res)=>{
    const {email,password}=req.body
    
    const user=await User.findOne({
        email:email.toLowerCase()
    }).select("+password")
    console.log(user) //remove it later for checking if password is coming or not

    if(!user || !(await user.comparePassword(password))){
        throw new AppError("Invalid email or password",401)
    }

    await user.updateLastActive()
    generateToken(res,user._id,`Welcome back ${user.name}`)
})


export const signOutUser = catchAsync(async(_,res)=>{
    res.cookie('token',"",{maxAge:0})
    res
    .status(200)
    .json({
        success:true,
        message:"Signed out Successfully"
    })
})


export const getCurrentUserProfile = catchAsync(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.id)
    console.log(userId)

    const userProfile = await User.aggregate([
        {
            $match: { _id: userId }, // ✅ Match user
        },
        {
            $lookup: {
                from: "projects",
                localField: "_id",
                foreignField: "createdBy",
                as: "leaderProjects", // ✅ Projects where user is team leader
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "_id",
                foreignField: "teamMembers",
                as: "memberProjects", // ✅ Projects where user is a team member
            },
        },
        {
            $addFields: {
                projects: { $setUnion: ["$leaderProjects", "$memberProjects"] }, // ✅ Merge both arrays
            },
        },
        {
            $project: {
                password: 0, // ✅ Exclude sensitive fields
                resetPasswordToken: 0,
                resetPasswordExpire: 0,
                leaderProjects: 0,
                memberProjects: 0, // ✅ Remove temporary arrays
            },
        },
    ]);

    if (!userProfile.length) {
        throw new AppError("User not found", 404);
    }

    res.status(200).json({
        success: true,
        message:"profile fetched successfully",
        user: userProfile[0], 
    });
});


export const updateUserProfile = catchAsync(async (req, res) => {
    const { name, email, bio, skills, expertise } = req.body;
    const updateData = {};

    // Fetch the user
    const user = await User.findById(req.id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    // Update fields only if provided
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;

    // Validate email update
    if (email && email.toLowerCase() !== user.email) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== req.id) {
            throw new AppError("Email is already in use", 400);
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
        const avatarResult = await uploadMedia(req.file.path);
        updateData.avatar = avatarResult?.secure_url || req.file.path;

        // Delete old avatar if it's not the default one
        if (user.avatar && user.avatar !== "default-avatar.png") {
            await deleteMediaFromCloudinary(user.avatar);
        }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(req.id, updateData, {
        new: true,
        runValidators: true,
    });

    if (!updatedUser) {
        throw new AppError("User not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            bio: updatedUser.bio,
            skills: updatedUser.skills,
            expertise: updatedUser.expertise,
            avatar: updatedUser.avatar,
        },
    });
});


export const changeUserPassword=catchAsync(async(req,res)=>{
    const {currentPassword,newPassword} = req.body

    //get user with password (check it for password)
    const user=await User.findById(req.id).select("+password")
    
    if(!user ){
        throw new AppError("User not found",404)
    }

    if(!(await user.comparePassword(currentPassword))){
        throw new AppError("Current password is incorrect", 401);
    }   

    user.password = newPassword
    await user.save() //pre save hook will hash

    res
    .status(200)
    .json({
        success:true,
        message:"Password changed successfully"
    })
})


export const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
        throw new AppError("No user found with this email", 404);
    }

    // Generate reset token & store only the hashed version
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${resetToken}`;

    await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message: `Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.status(200).json({
        success: true,
        message: "Password reset instructions sent to email",
    });
});


export const resetPassword = catchAsync(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    // Get user by reset token
    const user = await User.findOne({
      resetPasswordToken: crypto.createHash("sha256").update(token).digest("hex"),
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");
  
    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }
    if (await user.comparePassword(password)) {
        throw new AppError("New password cannot be the same as the old password", 400);
    }
    // Update password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
  
    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  });
  
  /**
   * Delete user account
   * @route DELETE /api/v1/users/account
   */
  export const deleteUserAccount = catchAsync(async (req, res) => {
    const user = await User.findById(req.id);
  
    // Delete avatar if not default
    if (user.avatar && user.avatar !== "default-avatar.png") {
      await deleteMediaFromCloudinary(user.avatar);
    }
  
    // Delete user
    await User.findByIdAndDelete(req.id);
  
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  });
  