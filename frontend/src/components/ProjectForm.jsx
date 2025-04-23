import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProjectService from "../service/ProjectService";
import MentorService from "../service/MentorService";
import { motion, AnimatePresence } from "framer-motion";
import { IconX } from "../components/ui/Icons";

// Zod schema aligned with backend requirements
const formSchema = z.object({
  title: z.string().min(3, { message: "Project title is required" }),
  description: z.object({
    abstract: z.string().min(20, { message: "Abstract is required (min 20 characters)" }),
    problemStatement: z.string().min(20, { message: "Problem statement is required (min 20 characters)" }),
    proposedMethodology: z.string().min(20, { message: "Proposed methodology is required (min 20 characters)" }),
    techStack: z.string()
      .min(2, { message: "At least one technology is required" })
      .refine(
        (value) => {
          const techs = value.split(',').map(tech => tech.trim()).filter(Boolean);
          return techs.length > 0;
        },
        { message: "Please enter at least one valid technology" }
      )
  }),
  teamMembers: z.string().optional(),
  targetFaculty: z.string().optional(),
});

const ProjectForm = ({ open, onOpenChange, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentorSuggestions, setMentorSuggestions] = useState([]);
  const [showMentorDropdown, setShowMentorDropdown] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [activeMentorIndex, setActiveMentorIndex] = useState(-1);
  const debounceTimeout = useRef(null);
  const mentorInputRef = useRef(null);
  const mentorDropdownRef = useRef(null);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
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
    }
  });

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

  // Focus management for accessibility
  useEffect(() => {
    if (open && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
      
      // Trap focus inside modal
      if (open && modalRef.current) {
        const focusableEls = modalRef.current.querySelectorAll('button, [tabindex]:not([tabindex="-1"]), input, textarea, select');
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];
        
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent background scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  const fetchMentorSuggestions = async (query) => {
    if (!query.trim()) {
      setMentorSuggestions([]);
      return;
    }

    try {
      const data = await MentorService.searchMentors(query);
      setMentorSuggestions(data);
      setShowMentorDropdown(data.length > 0);
    } catch (error) {
      console.error("Error fetching mentor suggestions:", error);
      setMentorSuggestions([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mentorDropdownRef.current &&
        !mentorDropdownRef.current.contains(event.target) &&
        mentorInputRef.current &&
        !mentorInputRef.current.contains(event.target)
      ) {
        setShowMentorDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const targetFaculty = watch("targetFaculty");

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchMentorSuggestions(targetFaculty);
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [watch("targetFaculty")]);

  const handleSelectMentor = (mentor) => {
    setSelectedMentor(mentor);
    setValue("targetFaculty", mentor.name);
    setShowMentorDropdown(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      reset();
      setSelectedMentor(null);
      setMentorSuggestions([]);
      setShowMentorDropdown(false);
      onOpenChange(false);
    }
  };

  const handleKeyDown = (event) => {
    if (showMentorDropdown) {
      if (event.key === "ArrowDown") {
        setActiveMentorIndex((prevIndex) => Math.min(prevIndex + 1, mentorSuggestions.length - 1));
      } else if (event.key === "ArrowUp") {
        setActiveMentorIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (event.key === "Enter" && activeMentorIndex >= 0) {
        handleSelectMentor(mentorSuggestions[activeMentorIndex]);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const formattedData = {
        title: data.title,
        description: {
          abstract: data.description.abstract,
          problemStatement: data.description.problemStatement,
          proposedMethodology: data.description.proposedMethodology,
          techStack: data.description.techStack.split(',').map(tech => tech.trim())
        }
      };

      if (data.teamMembers) {
        formattedData.teamMembers = data.teamMembers.split(',').map(member => member.trim());
        console.log("Team members to add:", formattedData.teamMembers);
      }

      if (selectedMentor) {
        formattedData.targetFaculty = selectedMentor._id;
        console.log("Will request mentor:", selectedMentor.name, selectedMentor._id);
      }

      createProjectMutation.mutate(formattedData);

    } catch (error) {
      console.error("Error preparing project data:", error);
      toast.error("Failed to prepare project data");
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with improved blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 backdrop-blur-xl shadow-2xl bg-black/70 z-[9999]"
            aria-hidden="true"
            onClick={handleBackdropClick}
          />
          
          {/* Modal with enhanced animations */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3
            }}
            className="fixed z-[9999] inset-0 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-form-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-gradient-to-br from-card to-card/95 p-8 rounded-2xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] border border-primary/10 transition-all duration-300 relative"
            >
              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              
              {/* Modal header with improved styling */}
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 id="project-form-title" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Create New Project
                </h2>
                <button
                  ref={closeBtnRef}
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-full hover:bg-accent/30 transition-colors transform active:scale-95 focus:ring-2 focus:ring-primary/30 focus:outline-none duration-150"
                  aria-label="Close"
                >
                  <IconX size={18} />
                </button>
              </div>

              <p className="text-muted-foreground text-sm mb-8 relative z-10">Complete the form below to create a new project proposal.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-5 rounded-xl space-y-6">
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

                  <div className="relative">
                    <label className="block text-sm font-semibold text-foreground mb-2">Preferred Faculty (Optional)</label>
                    <input
                      type="text"
                      ref={mentorInputRef}
                      className="block w-full px-4 py-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                      placeholder="Start typing mentor name..."
                      {...register("targetFaculty")}
                      onClick={() => {
                        if (mentorSuggestions.length > 0) {
                          setShowMentorDropdown(true);
                        }
                      }}
                      onKeyDown={handleKeyDown}
                      autoComplete="off"
                    />
                    {showMentorDropdown && mentorSuggestions.length > 0 && 
                     (
                      <div 
                        ref={mentorDropdownRef}
                        className="absolute z-120 w-full mt-1 bg-zinc-900 border border-border rounded-lg max-h-60 overflow-y-auto"
                        role="listbox"
                        aria-labelledby="mentor-dropdown"
                      >
                        <ul>
                          {mentorSuggestions.map((mentor, index) => (
                            <li 
                              key={mentor._id} 
                              className={`px-4 py-3 hover:bg-primary/10 cursor-pointer flex items-center gap-3 border-b border-border/40 last:border-b-0 ${
                                activeMentorIndex === index ? "bg-primary/10" : ""
                              }`}
                              onClick={() => handleSelectMentor(mentor)}
                              role="option"
                              aria-selected={selectedMentor?._id === mentor._id}
                            >
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                {mentor.profilePic ? (
                                  <img 
                                    src={mentor.profilePic} 
                                    alt={mentor.name} 
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{mentor.name}</p>
                                <p className="text-xs text-muted-foreground">{mentor.department || "Faculty"}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {mentorSuggestions.length === 0 && watch("targetFaculty")?.trim().length > 2 && (
                      <p className="mt-2 text-xs text-muted-foreground">No mentors found with that name. Try a different search.</p>
                    )}
                    {selectedMentor && (
                      <div className="mt-2 flex items-center gap-2 bg-primary/10 p-2 rounded-md">
                        <span className="text-sm text-primary font-medium">Selected: {selectedMentor.name}</span>
                        <button 
                          type="button"
                          className="ml-auto text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setSelectedMentor(null);
                            setValue("targetFaculty", "");
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
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

                <div className="border-t border-border/20 pt-6 flex justify-end gap-4 bg-gradient-to-r from-transparent to-primary/5">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    className="px-6 py-2.5 rounded-lg text-foreground bg-accent/50 hover:bg-accent/70 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
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
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById('portal-root')
  );
};

export default ProjectForm;
