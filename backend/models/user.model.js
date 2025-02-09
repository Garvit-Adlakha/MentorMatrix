import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                "Please provide a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false, // Exclude password by default when querying
        },
        role: {
            type: String,
            enum: ["student", "mentor", "admin"],
            default: "student",
        },
        avatar: {
            type: String,
            default: "default-avatar.png",
        },
        bio: {
            type: String,
            maxlength: [200, "Bio cannot exceed 200 characters"],
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        lastActive: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash reset password token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Update last active timestamp
userSchema.methods.updateLastActive = async function () {
    this.lastActive = Date.now();
    await this.save();
};

// Export model
export const User = mongoose.model("User", userSchema);
