// Functions to implement:
// - createMeeting: Create a new meeting
// - getAllMeetings: Get all meetings for a user
// - getMeetingById: Get a specific meeting
// - updateMeeting: Update meeting details
// - deleteMeeting: Cancel/delete a meeting
// - addMeetingNotes: Add notes after a meeting
import { catchAsync } from "../middleware/error.middleware.js";
import { sendEmail } from "../utils/sendEmail.js";
import Project from "../models/project.model.js";
import { Meeting } from "../models/meeting.model.js";

const createMeeting = catchAsync(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.id;

    // Validate required fields
    const { title, description, startTime, endTime, location } = req.body;
    if (!title || !startTime || !endTime) {
        return res.status(400).json({
            status: "fail",
            message: "Title, startTime, and endTime are required."
        });
    }
    if (new Date(startTime) >= new Date(endTime)) {
        return res.status(400).json({
            status: "fail",
            message: "startTime must be before endTime."
        });
    }
    if (new Date(startTime) < new Date()) {
        return res.status(400).json({
            status: "fail",
            message: "Meeting cannot be scheduled in the past."
        });
    }

    // Fetch project and validate
    const project = await Project.findById(projectId).select("teamMembers title");
    if (!project) {
        return res.status(404).json({
            status: "fail",
            message: "Project not found."
        });
    }

    // Ensure unique participants
    const participantsSet = new Set([
        ...project.teamMembers.map(id => id.toString()),
        userId
    ]);
    const participants = Array.from(participantsSet);

    // Generate Jitsi meeting link
    const jitsiRoom = `MentorMatrix-${project.title}-${projectId}-${Date.now()}`;
    const meetingLink = `https://meet.jit.si/${jitsiRoom}`;

    const meeting = {
        title,
        description,
        projectId,
        scheduledBy: userId,
        participants,
        startTime,
        endTime,
        location,
        meetingLink
    };
    const meetingCreated = await Meeting.create(meeting);
    const meetingDetails = await Meeting.findById(meetingCreated._id)
        .populate("participants", "name email")
        .populate("scheduledBy", "name email")
        .populate("projectId", "title");

    // Send email notification
    const emailData = {
        subject: `Meeting Scheduled for ${project.title}`,
        to: meetingDetails.participants.map((participant) => participant.email),
        text: `Hello, \n\nA meeting has been scheduled for the project \"${project.title}\".\n\nDetails:\nTitle: ${meetingDetails.title}\nDescription: ${meetingDetails.description}\nStart Time: ${meetingDetails.startTime}\nEnd Time: ${meetingDetails.endTime}\nLocation: ${meetingDetails.location}\nMeeting Link: ${meetingDetails.meetingLink}\n\nBest regards,\nMentorMatrix Team`
    };
    await sendEmail(emailData);
    res.status(201).json({
        status: "success",
        message: "Meeting created successfully",
        data: {
            meeting: meetingDetails
        }
    });
});

const getUserMeetings = catchAsync(async (req, res, next) => {
    const userId = req.id;
    const { status, page = 1, limit = 10, sort = "-startTime" } = req.query;

    const query = {
        $or: [
            { scheduledBy: userId },
            { participants: userId }
        ]
    };

    if (status) {
        // Optionally, validate status here if needed
        query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const meetings = await Meeting.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("participants", "name email")
        .populate("scheduledBy", "name email")
        .populate("projectId", "title");

    const total = await Meeting.countDocuments(query);

    res.status(200).json({
        status: "success",
        data: {
            meetings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        }
    });
});

