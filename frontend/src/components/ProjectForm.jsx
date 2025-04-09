import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProjectService from "../service/ProjectService";

// Zod schema aligned with backend requirements
const formSchema = z.object({
  title: z.string().min(3, { message: "Project title is required" }),
  description: z.object({
    abstract: z.string().min(20, { message: "Abstract is required (min 20 characters)" }),
    problemStatement: z.string().min(20, { message: "Problem statement is required (min 20 characters)" }),
    proposedMethodology: z.string().min(20, { message: "Proposed methodology is required (min 20 characters)" }),
    techStack: z.string().min(2, { message: "At least one technology is required" })
  }),
  teamMembers: z.string().optional(),
  targetFaculty: z.string().optional(),
  course: z.string().optional(),
});

const ProjectForm = ({ open, onOpenChange, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: {
        abstract: "",
        problemStatement: "",
        proposedMethodology: "",
        techStack: ""
      },
      teamMembers: "",
      targetFaculty: "",
      course: ""
    }
  });

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: (formattedData) => ProjectService.createProject(formattedData),
    onSuccess: (data) => {
      toast.success("Project created successfully!");
      queryClient.invalidateQueries(["projects"]);
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Error creating project:", error);
      toast.error(error.response?.data?.message || "Failed to create project");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Format data for API
      const formattedData = {
        title: data.title,
        description: {
          abstract: data.description.abstract,
          problemStatement: data.description.problemStatement,
          proposedMethodology: data.description.proposedMethodology,
          techStack: data.description.techStack.split(',').map(tech => tech.trim())
        }
      };

      // If team members provided, log for now (will be handled separately)
      if (data.teamMembers) {
        console.log("Team members to add:", data.teamMembers.split(',').map(member => member.trim()));
      }
      
      // If preferred faculty provided, log for now (will be handled separately)
      if (data.targetFaculty) {
        console.log("Will request mentor:", data.targetFaculty);
      }

      // Call the mutation to create the project
      createProjectMutation.mutate(formattedData);
      
    } catch (error) {
      console.error("Error preparing project data:", error);
      toast.error("Failed to prepare project data");
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  // Render the form using createPortal to append it to the portal-root element
  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/60 z-[9999] transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-card p-8 rounded-2xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] m-4 border border-primary/10 transition-all duration-300 transform animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Create New Project</h2>
          <button 
            onClick={() => onOpenChange(false)}
            className="rounded-full h-8 w-8 flex items-center justify-center bg-accent/30 hover:bg-accent/50 text-foreground transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-muted-foreground text-sm mb-8">Complete the form below to create a new project proposal.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-primary/5 p-5 rounded-xl space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Project Title</label>
              <input 
                type="text" 
                className="block w-full px-4 py-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                placeholder="Enter a descriptive title for your project"
                {...register("title")} 
              />
              {errors.title && <p className="mt-2 text-sm text-destructive font-medium">{errors.title.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Course (Optional)</label>
                <input 
                  type="text" 
                  className="block w-full px-4 py-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                  placeholder="Related course name"
                  {...register("course")} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Preferred Faculty (Optional)</label>
                <input 
                  type="text" 
                  className="block w-full px-4 py-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                  placeholder="Name of preferred mentor"
                  {...register("targetFaculty")} 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Team Members (Optional)</label>
              <input 
                type="text" 
                className="block w-full px-4 py-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                placeholder="Comma-separated list of email addresses or roll numbers"
                {...register("teamMembers")} 
              />
              <p className="mt-2 text-xs text-muted-foreground">Enter email addresses or roll numbers separated by commas</p>
            </div>
          </div>
          
          <div className="bg-primary/5 p-5 rounded-xl space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <span className="bg-primary/20 rounded-full w-7 h-7 flex items-center justify-center mr-2 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </span>
              Project Description
            </h3>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Project Abstract</label>
              <textarea 
                className="block w-full px-4 py-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                rows="3"
                placeholder="A brief overview of your project"
                {...register("description.abstract")} 
              />
              {errors.description?.abstract && (
                <p className="mt-2 text-sm text-destructive font-medium">{errors.description.abstract.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Problem Statement</label>
              <textarea 
                className="block w-full px-4 py-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                rows="3"
                placeholder="What problem does your project solve?"
                {...register("description.problemStatement")} 
              />
              {errors.description?.problemStatement && (
                <p className="mt-2 text-sm text-destructive font-medium">{errors.description.problemStatement.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Proposed Methodology</label>
              <textarea 
                className="block w-full px-4 py-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                rows="3"
                placeholder="How do you plan to implement your solution?"
                {...register("description.proposedMethodology")} 
              />
              {errors.description?.proposedMethodology && (
                <p className="mt-2 text-sm text-destructive font-medium">{errors.description.proposedMethodology.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Tech Stack</label>
              <input 
                type="text"
                className="block w-full px-4 py-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                placeholder="e.g., React, Node.js, MongoDB"
                {...register("description.techStack")} 
              />
              <p className="mt-2 text-xs text-muted-foreground">Enter technologies separated by commas</p>
              {errors.description?.techStack && (
                <p className="mt-2 text-sm text-destructive font-medium">{errors.description.techStack.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button 
              type="button" 
              className="px-6 py-2.5 rounded-lg text-foreground bg-accent/50 hover:bg-accent/70 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-lg text-primary-foreground bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Project...
                </span>
              ) : (
                <span className="flex items-center">
                  Create Project
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('portal-root') // Render to the portal-root element
  );
};

export default ProjectForm;
