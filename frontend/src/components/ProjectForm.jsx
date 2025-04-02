

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

const formSchema = z.object({
  title: z.string().min(3, { message: "Project title is required" }),
  description: z.string().min(50, { message: "Please provide a detailed project description (at least 50 characters)" }),
  teamMembers: z.string().optional(),
  targetFaculty: z.string().optional(),
  course: z.string().optional(),
});

const ProjectForm = ({ open, onOpenChange }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    toast.success("Project proposal submitted successfully!");
    reset();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Project Proposal</h2>
        <p className="text-gray-600 text-sm mb-4">Fill out the form with details about your project idea.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Project Title</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded mt-1" 
              {...register("title")} 
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium">Course (Optional)</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded mt-1" 
              {...register("course")} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Preferred Faculty (Optional)</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded mt-1" 
              {...register("targetFaculty")} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Team Members (Optional)</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded mt-1" 
              {...register("teamMembers")} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Project Description</label>
            <textarea 
              className="w-full p-2 border rounded mt-1 min-h-[100px]" 
              {...register("description")} 
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button 
              type="button" 
              className="px-4 py-2 border rounded text-gray-700" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Submit Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
