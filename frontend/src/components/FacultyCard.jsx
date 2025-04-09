import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconChevronDown, IconMail, IconX } from '../components/ui/Icons';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import ProjectService from '../service/ProjectService';
import { createPortal } from 'react-dom';

export const FacultyCard = ({ faculty }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  // Handle data structure differences - create fallbacks for missing fields
  const avatar = faculty.avatar || faculty.image || 'default-avatar.png';
  const expertise = faculty.expertise || [];
  const researchInterests = faculty.researchInterests || expertise || [];

  const queryClient = useQueryClient();
  
  const facultyRequestMutation = useMutation({
    mutationFn: ({ facultyId, projectId }) => ProjectService.requestMentor({ mentorId: facultyId, projectId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['mentors']); 
      alert('Mentor request sent successfully!');
      setShowProjectModal(false);
    },
    onError: (error) => {
      alert(`Error sending mentor request: ${error.message}`);
    }
  });
  
  const handleContactClick = () => {
    setShowProjectModal(true);
  };
  
  const handleProjectSelect = (project) => {
    facultyRequestMutation.mutate({
      facultyId: faculty._id,
      projectId: project._id
    });
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-24 h-24 rounded-full ring-2 ring-primary ring-offset-2 overflow-hidden">
                {!imageError && avatar ? (
                  <>
                    {!imageLoaded && (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                        {getInitials(faculty.name)}
                      </div>
                    )}
                    <img 
                      src={avatar}
                      alt={faculty.name}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onError={() => setImageError(true)}
                      onLoad={() => setImageLoaded(true)}
                      loading="lazy"
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                    {getInitials(faculty.name)}
                  </div>
                )}
              </div>
            </motion.div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h3 className="text-xl font-semibold">{faculty.name}</h3>
              <p className="text-sm text-muted-foreground">{faculty.department || faculty.university || ''}</p>
              {expertise.length > 0 && (
                <p className="text-sm font-medium text-primary">
                  {expertise.join(', ')}
                </p>
              )}
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent text-sm font-medium"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show less' : 'Learn more'}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconChevronDown size={16} />
                </motion.div>
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 space-y-4"
              >
                {faculty.bio && (
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground">{faculty.bio}</p>
                  </div>
                )}
                
                {researchInterests.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Research Interests</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {researchInterests.map((interest, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {interest}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-center"
                  onClick={handleContactClick}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <IconMail size={18} />
                    Contact Mentor
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Project Selection Modal */}
      {showProjectModal && (
        <ProjectSelectionModal 
          onClose={() => setShowProjectModal(false)} 
          onSelect={handleProjectSelect}
          facultyName={faculty.name}
        />
      )}
    </>
  );
};

export const ProjectSelectionModal = ({ onClose, onSelect, facultyName }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn:()=> ProjectService.getAllProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1
  } )
  
  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/60 z-[9999] transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card p-6 rounded-xl shadow-2xl w-full max-w-lg m-4 border border-primary/10 transition-all relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconX size={20} />
        </button>
        
        <h2 className="text-xl font-semibold mb-2">Select a Project</h2>
        <p className="text-muted-foreground mb-6">
          Choose which project you want to request mentorship from {facultyName} for:
        </p>
        
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-destructive">
            <p>Failed to load your projects.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        ) : data?.projects && data.projects.length > 0 ? (
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/50 border border-border/50 rounded-lg">
            {data.projects.map(project => (
              <ProjectListItem 
                key={project._id}
                project={project}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="mb-4">You don't have any projects yet.</p>
            <p className="text-sm text-muted-foreground">Create a project first to request mentorship.</p>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
};

export const ProjectListItem = ({ project, onSelect }) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-border/50 hover:bg-accent/10 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium">{project.title}</h4>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        onClick={() => onSelect(project)}
      >
        Select
      </motion.button>
    </div>
  );
};

export const ProjectList = () => {
  const { data, isLoading, isError } = useQuery(['projects'], ProjectService.getAllProjects);

  const handleSelect = (project) => {
    // Handle project selection logic here
    console.log('Selected project:', project);
    // You can add further logic like navigation or state updates
  };

  if (isLoading) {
    return (
      <div className="w-full p-4 flex items-center justify-center text-muted-foreground">
        Loading projects...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-4 flex items-center justify-center text-red-500">
        Error loading projects
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50 border border-border/50 rounded-lg overflow-hidden">
      {data?.projects?.map((project) => (
        <ProjectListItem 
          key={project._id} 
          project={project} 
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};


export default FacultyCard;
