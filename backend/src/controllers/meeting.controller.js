// Functions to implement:
// - createMeeting: Create a new meeting
// - getAllMeetings: Get all meetings for a user
// - getMeetingById: Get a specific meeting
// - updateMeeting: Update meeting details
// - deleteMeeting: Cancel/delete a meeting
// - addMeetingNotes: Add notes after a meeting
import { catchAsync } from "../middleware/error.middleware.js";
import { sendEmail } from "../utils/sendEmail.js";

const createMeeting=catchAsync(async (req,res,next)=>{
    
}) 