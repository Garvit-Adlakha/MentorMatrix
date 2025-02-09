import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateTokens.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import crypto from 'crypto'
import { sendEmail } from "../utils/sendEmail.js";

export const createUserAccount=catchAsync(async(req,res)=>{
    const {name,email,password,role="student"}=req.body
    
    const existingUser = await User.findOne({
        email:email.toLowerCase()
    }) 
    if(existingUser){
        throw new AppError("User already exists",400)
    }
    const user=await User.create(
        {
            name,
            email:email.toLowerCase(),
            password,
            role
        }
    )
    await user.updateLastActive()
    generateToken(res,user._id,"Accound created successfully")
})

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


export const getCurrentUserProfile = catchAsync(async(req,res)=>{
    //write aggregations to get project details
})


export const updateUserProfile = catchAsync(async(req,res)=>{
    const {name,email,bio}=req.body
    const updateData={
        name,
        email:email?.toLowerCase(),
        bio
    }
    
    if (email) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== req.id) {
            throw new AppError("Email is already in use", 400);
        }
    }
    // check for avatar and handle it if provided
    if(req.file){
        const avatarResult = await uploadMedia(req.file.path)
        updateData.avatar = avatarResult?.secure_url || req.file.path

        //delete old avatar if it's not default-avatar png
        const user=await User.findById(req.id)
        if(!user){
            throw new AppError("User not found",404)
        }
        if(user.avatar && user.avatar!=='default-avatar.png'){
            await deleteMediaFromCloudinary(user.avatar)
        }
    }
        
        const updatedUser= await User.findByIdAndUpdate(
            req.id, updateData,
            {
                new:true,
                runValidators:true
            }
        )
        if(!updatedUser){
            throw new AppError("User not found",404)
        }
        res
        .status(200)
        .json({
            success:true,
            message:"Profile updated successfully",
            data:updateData
        })
})


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
  