import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MeetingService from '../../service/MeetingService';
import ProjectService from '../../service/ProjectService';
import JitsiMeetComponent from './JitsiMeetComponent';
import { 
  IconCalendar, 
  IconClock, 
  IconUsers, 
  IconMessage,
  IconVideo,
  IconArrowLeft
} from '../ui/Icons';

const MeetingScheduler = () => {
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showJitsi, setShowJitsi] = useState(false);
  const [jitsiInfo, setJitsiInfo] = useState({ roomName: '', displayName: '' });
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
    onSuccess: (data) => {
      toast.success('Meeting scheduled successfully');
      queryClient.invalidateQueries(['meetings']);
      reset();
      setStep(1);
      setSelectedProject(null);
      // Set Jitsi info and show Jitsi component
      setJitsiInfo({
        roomName: data?.meeting?.roomName || data?.roomName || 'MentorMatrixRoom',
        displayName: data?.meeting?.createdBy?.name || data?.createdBy?.name || 'User',
      });
      setShowJitsi(true);
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
      startTime: new Date(`${data.date}T${data.time}`),
      endTime: new Date(new Date(`${data.date}T${data.time}`).getTime() + data.duration * 60000),
      location: data.meetingType === 'video' ? 'Online' : 'In-Person',
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-gradient-to-br from-[#18181b] to-[#23272f] rounded-2xl p-8 shadow-xl backdrop-blur-xl border-none"
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-700 transition-all shadow"
      >
        <IconArrowLeft size={18} />
        Go Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
      >
        <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow mb-6">Schedule a Meeting</h2>
      </motion.div>
      
      {showJitsi ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="my-6 bg-zinc-900/80 p-6 rounded-xl shadow-lg ring-1 ring-zinc-700/40"
        >
          <JitsiMeetComponent roomName={jitsiInfo.roomName} displayName={jitsiInfo.displayName} />
          <motion.button 
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="mt-6 px-5 py-2.5 bg-gradient-to-r from-primary to-blue-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            onClick={() => setShowJitsi(false)}
          >
            Close Meeting
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* Step indicator */}
          <div className="flex items-center mb-8">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center shadow-md ${step >= 1 ? 'bg-gradient-to-r from-primary to-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>1</div>
            <div className={`h-1 w-12 mx-2 ${step >= 2 ? 'bg-gradient-to-r from-primary to-blue-500' : 'bg-zinc-700'}`}></div>
            <div className={`rounded-full h-10 w-10 flex items-center justify-center shadow-md ${step >= 2 ? 'bg-gradient-to-r from-primary to-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>2</div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Select project */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-xl p-6 bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 shadow-lg border-none ring-1 ring-zinc-700/40"
              >
                <div className="mb-5">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Select Project
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-zinc-700/50 bg-zinc-800/90 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
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
                    <p className="mt-2 text-sm text-red-400">{errors.projectId.message}</p>
                  )}
                </div>

                {selectedProject && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 p-5 rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/20"
                  >
                    <h3 className="font-medium text-lg text-white mb-2">{selectedProject.title}</h3>
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {selectedProject.description?.abstract || 'No description available'}
                    </p>
                    <div className="mt-3 text-sm">
                      {selectedProject.assignedMentor ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                            <IconUsers size={14} className="text-green-400" />
                          </div>
                          <span className="text-green-400">Mentor: {selectedProject.assignedMentor.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <IconUsers size={14} className="text-amber-400" />
                          </div>
                          <span className="text-amber-400">No mentor assigned</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="mt-8 flex justify-end">
                  <motion.button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!selectedProjectId}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-blue-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Next Step
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Meeting details */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-xl p-6 bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 shadow-lg border-none ring-1 ring-zinc-700/40"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Meeting Title
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-zinc-700/50 bg-zinc-800/90 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                        placeholder="Enter meeting title"
                        {...register('title', { required: 'Meeting title is required' })}
                      />
                      <div className="absolute left-3 top-3 text-primary/70">
                        <IconCalendar size={18} />
                      </div>
                    </div>
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Meeting Type
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-zinc-700/50 bg-zinc-800/90 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                        {...register('meetingType', { required: 'Meeting type is required' })}
                      >
                        <option value="video">Video Call</option>
                        <option value="audio">Audio Call</option>
                        <option value="in-person">In-Person</option>
                      </select>
                      <div className="absolute left-3 top-3 text-primary/70">
                        <IconVideo size={18} />
                      </div>
                    </div>
                    {errors.meetingType && (
                      <p className="mt-2 text-sm text-red-400">{errors.meetingType.message}</p>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-zinc-700/50 bg-zinc-800/90 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner resize-none"
                      rows="3"
                      placeholder="Enter meeting description"
                      {...register('description', { required: 'Description is required' })}
                    ></textarea>
                    <div className="absolute left-3 top-3 text-primary/70">
                      <IconMessage size={18} />
                    </div>
                  </div>
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-400">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-zinc-700/50 bg-zinc-800/90 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                        {...register('date', { required: 'Date is required' })}
                      />
                      <div className="absolute left-3 top-3 text-primary/70">
                        <IconCalendar size={18} />
                      </div>
                    </div>
                    {errors.date && (
                      <p className="mt-2 text-sm text-red-400">{errors.date.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-zinc-700/50 bg-zinc-800/90 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                        {...register('time', { required: 'Time is required' })}
                      />
                      <div className="absolute left-3 top-3 text-primary/70">
                        <IconClock size={18} />
                      </div>
                    </div>
                    {errors.time && (
                      <p className="mt-2 text-sm text-red-400">{errors.time.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Duration
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-zinc-700/50 bg-zinc-800/90 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
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
                      <p className="mt-2 text-sm text-red-400">{errors.duration.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <motion.button
                    type="button"
                    onClick={handleBackStep}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    className="px-5 py-2.5 bg-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-700 transition-all shadow"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={createMeetingMutation.isPending}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-blue-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                  >
                    {createMeetingMutation.isPending ? 'Scheduling...' : 'Schedule Meeting'}
                    {createMeetingMutation.isPending ? (
                      <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></div>
                    ) : (
                      <IconCalendar size={18} />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>
        </>
      )}
    </motion.div>
  );
};

export default MeetingScheduler;