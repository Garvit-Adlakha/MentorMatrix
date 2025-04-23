import { addMemberToProject, createProject, getProject, getProjectById, getProjectReview, getProjectSummary, listProjects, mentorDecision, requestMentor } from "../controllers/project.controller.js";
import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { validateDescription } from "../middleware/validation.middleware.js";

const router=Router()



//authenticated route
router.post("/create-project",isAuthenticated,validateDescription,createProject)
router.post("/add-members",isAuthenticated,addMemberToProject)
router.post('/request-mentor',isAuthenticated,requestMentor)
router.post('/request-mentor/:mentorId',isAuthenticated,requestMentor)
router.post('/assign-mentor/:projectId',isAuthenticated,mentorDecision)
router.get('/get-project',isAuthenticated,getProject)
router.get('/get-project/:projectId',isAuthenticated,getProjectById)
router.get('/list-projects',isAuthenticated,listProjects)
router.get('/:projectId/summary',isAuthenticated,getProjectSummary)
router.get('/project-review/:projectId',isAuthenticated,getProjectReview)
export default router