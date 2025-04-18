    import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MeetingService from '../../service/MeetingService';
import ProjectService from '../../service/ProjectService';
import { 
  IconCalendar, 
  IconClock, 
  IconUsers, 
  IconMessage,
  IconVideo
} from '../ui/Icons';

const MeetingScheduler = () => {
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form handling with react-hook-form
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 30,
      meetingType: 'video',
      projectId: ''
    }
  });

  // Fetch user's projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectService.getAllProjects(),
    refetchOnWindowFocus: false,
  });

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: (meetingData) => MeetingService.createMeeting(meetingData),
    onSuccess: () => {
      toast.success('Meeting scheduled successfully');
      queryClient.invalidateQueries(['meetings']);
      reset();
      setStep(1);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to schedule meeting');
    }
  });

  // Watch for project selection
  const selectedProjectId = watch('projectId');
  
  useEffect(() => {
    if (selectedProjectId && projectsData?.projects) {
      const project = projectsData.projects.find(p => p._id === selectedProjectId);
      setSelectedProject(project);
    } else {
      setSelectedProject(null);
    }
  }, [selectedProjectId, projectsData]);

  // Handle form submission
  const onSubmit = (data) => {
    // Convert form data to the format expected by the API
    const meetingData = {
      title: data.title,
      description: data.description,
      projectId: data.projectId,
      scheduledFor: new Date(`${data.date}T${data.time}`).toISOString(),
      duration: parseInt(data.duration),
      meetingType: data.meetingType
    };
    
    createMeetingMutation.mutate(meetingData);
  };

  // Handle next step
  const handleNextStep = () => {
    setStep(2);
  };

  // Handle back step
  const handleBackStep = () => {
    setStep(1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card border border-border/50 rounded-xl p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold mb-4">Schedule a Meeting</h2>
      
      {/* Step indicator */}
      <div className="flex items-center mb-6">
        <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}>1</div>
        <div className={`h-1 w-8 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
        <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}>2</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Select project */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Select Project
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                {...register('projectId', { required: 'Please select a project' })}
              >
                <option value="">Select a project</option>
                {projectsData?.projects?.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-500">{errors.projectId.message}</p>
              )}
            </div>

            {selectedProject && (
              <div className="mb-6 p-4 border border-border/50 rounded-lg bg-accent/5">
                <h3 className="font-medium mb-2">{selectedProject.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {selectedProject.description?.abstract || 'No description available'}
                </p>
                <div className="mt-2 text-sm">
                  {selectedProject.assignedMentor ? (
                    <span className="text-green-500">Mentor: {selectedProject.assignedMentor.name}</span>
                  ) : (
                    <span className="text-amber-500">No mentor assigned</span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedProjectId}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Meeting details */}
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Meeting Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  placeholder="Enter meeting title"
                  {...register('title', { required: 'Meeting title is required' })}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Meeting Type
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  {...register('meetingType', { required: 'Meeting type is required' })}
                >
                  <option value="video">Video Call</option>
                  <option value="audio">Audio Call</option>
                  <option value="in-person">In-Person</option>
                </select>
                {errors.meetingType && (
                  <p className="mt-1 text-sm text-red-500">{errors.meetingType.message}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none"
                rows="3"
                placeholder="Enter meeting description"
                {...register('description', { required: 'Description is required' })}
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  {...register('date', { required: 'Date is required' })}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Time
                </label>
                <input
                  type="time"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  {...register('time', { required: 'Time is required' })}
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-500">{errors.time.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Duration (minutes)
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  {...register('duration', { required: 'Duration is required' })}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handleBackStep}
                className="px-6 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={createMeetingMutation.isPending}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createMeetingMutation.isPending ? 'Scheduling...' : 'Schedule Meeting'}
                {createMeetingMutation.isPending ? (
                  <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                ) : (
                  <IconCalendar size={16} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default MeetingScheduler;