import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: {
            abstract: { type: String, required: true, trim: true },
            problemStatement: { type: String, required: true, trim: true },
            proposedMethodology: { type: String, required: true, trim: true },
            techStack: {
                type: [String], 
                lowercase: true,
                trim: true,
                validate: {
                    validator: function (v) {
                        return new Set(v).size === v.length; 
                    },
                    message: "Tech stack must have unique values.",
                },
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, // ✅ Team leader
        },
        assignedMentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // ✅ Mentor assigned later
        },
        teamMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // ✅ Other students in the project
            },
        ],
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending", // ✅ On creation
            index: true, 
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ✅ Virtual: Total Members (including leader)
projectSchema.virtual("totalMembers").get(function () {
    return this.teamMembers.length + 1; // +1 for `createdBy`
});

// ✅ Middleware to enforce unique `techStack`
projectSchema.pre("save", function (next) {
    this.description.techStack = [...new Set(this.description.techStack)];
    next();
});

export const Project = mongoose.model("Project", projectSchema);
