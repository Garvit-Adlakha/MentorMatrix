import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconChevronDown, 
  IconMail, 
  IconX, 
  IconLoader2,
  IconUserCircle, 
  IconBuildingSkyscraper,
  IconSchool
} from './ui/Icons';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import ProjectService from '../service/ProjectService';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';

// Avatar component with improved error handling and loading state
const Avatar = ({ src, alt, initials }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div className="w-24 h-24 rounded-full ring-2 ring-primary/30 ring-offset-2 overflow-hidden shadow-md">
      {!imageError && src ? (
        <>
          {!imageLoaded && (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
              {initials}
            </div>
          )}
          <img 
            src={src}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl font-semibold text-primary">
          {initials}
        </div>
      )}
    </div>
  );
};

// ResearchInterests component with enhanced visualization
const ResearchInterests = ({ interests }) => {
  if (!interests || interests.length === 0) return null;

  return (
    <div>
      <h4 className="font-medium mb-2 text-sm text-foreground/90 flex items-center gap-1">
        <span className="w-1 h-4 bg-secondary rounded-full inline-block mr-1"></span>
        Research Interests
      </h4>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {interests.map((interest, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground break-words overflow-wrap-anywhere"
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary/70 flex-shrink-0" />
            {interest}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export const FacultyCard = ({ faculty }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const cardRef = useRef(null);

  const getInitials = useCallback((name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }, []);

  // Handle data structure differences - create fallbacks for missing fields
  const avatar = faculty.avatar || faculty.image || 'default-avatar.png';
  const expertise = faculty.expertise || [];
  const researchInterests = faculty.researchInterests || expertise || [];

  const queryClient = useQueryClient();
  
  const facultyRequestMutation = useMutation({
    mutationFn: ({ facultyId, projectId }) => ProjectService.requestMentor({ mentorId: facultyId, projectId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['mentors']); 
      toast.success('Mentor request sent successfully!');
      setShowProjectModal(false);
    },
    onError: (error) => {
      toast.error(`Failed to send mentor request: ${error.message || 'Unknown error occurred'}`);
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
        className="card bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden w-full h-full flex flex-col border border-primary/10"
        ref={cardRef}
      >
        {/* Card with fixed heights in collapsed state */}
        <div className={`p-5 sm:p-6 flex flex-col ${isExpanded ? 'flex-grow' : 'h-68'}`}>
          {/* Top content - always visible */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
            <motion.div 
              className="relative flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Avatar 
                src={avatar}
                alt={faculty.name}
                initials={getInitials(faculty.name)}
              />
              
              {faculty.lastActiveAt && (
                <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </motion.div>
            
            <div className="flex-1 text-center sm:text-left space-y-2">
              <motion.h3 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-semibold break-words overflow-wrap-anywhere" 
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              >
                {faculty.name}
              </motion.h3>
              
              <div className="flex flex-col gap-1">
                {(faculty.department || faculty.university) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-1 text-sm text-muted-foreground"
                  >
                    {faculty.department && (
                      <div className="flex items-center gap-1">
                        <IconBuildingSkyscraper size={14} className="text-primary/70" />
                        <span className="break-words overflow-wrap-anywhere">{faculty.department}</span>
                      </div>
                    )}
                    
                    {faculty.department && faculty.university && (
                      <span className="mx-1">•</span>
                    )}
                    
                    {faculty.university && (
                      <div className="flex items-center gap-1">
                        <IconSchool size={14} className="text-primary/70" />
                        <span className="break-words overflow-wrap-anywhere">{faculty.university}</span>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {expertise.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-1 mt-1"
                  >
                    {expertise.slice(0, 3).map((exp, index) => (
                      <span key={index} className="px-2 py-0.5 bg-primary/10 text-primary/80 text-xs rounded-full">
                        {exp}
                      </span>
                    ))}
                    {expertise.length > 3 && (
                      <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full">
                        +{expertise.length - 3} more
                      </span>
                    )}
                  </motion.div>
                )}
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/50 hover:bg-accent/80 text-sm font-medium mt-1"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls={`faculty-details-${faculty._id}`}
              >
                {isExpanded ? 'Show less' : 'Learn more'}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3, type: "spring" }}
                  aria-hidden="true"
                >
                  <IconChevronDown size={16} />
                </motion.div>
              </motion.button>
            </div>
          </div>

          {/* Expanded view */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                id={`faculty-details-${faculty._id}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 space-y-4"
              >
                {faculty.bio && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm text-foreground/90 flex items-center gap-1">
                      <span className="w-1 h-4 bg-primary rounded-full inline-block mr-1"></span>
                      Bio
                    </h4>
                    <p className="text-sm text-muted-foreground break-words overflow-wrap-anywhere bg-accent/30 p-3 rounded-lg" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{faculty.bio}</p>
                  </div>
                )}
                
                <ResearchInterests interests={researchInterests} />

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/95 hover:to-primary/85 px-4 py-2.5 rounded-lg font-medium text-center shadow-sm hover:shadow-md transition-all duration-200 mt-4"
                  onClick={handleContactClick}
                  disabled={facultyRequestMutation.isPending}
                  aria-label={`Contact ${faculty.name}`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {facultyRequestMutation.isPending ? (
                      <>
                        <IconLoader2 size={18} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <IconMail size={18} />
                        <span>Request Mentorship</span>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Spacer for collapsed state to push the button to the bottom */}
          {!isExpanded && <div className="flex-grow" />}
          
          {/* Contact button always at the bottom in collapsed state */}
          {!isExpanded && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/95 hover:to-primary/85 px-4 py-2.5 rounded-lg font-medium text-center shadow-sm hover:shadow-md transition-all duration-200 mt-4"
              onClick={handleContactClick}
              disabled={facultyRequestMutation.isPending}
              aria-label={`Contact ${faculty.name}`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {facultyRequestMutation.isPending ? (
                  <>
                    <IconLoader2 size={18} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <IconMail size={18} />
                    <span>Request Mentorship</span>
                  </>
                )}
              </span>
            </motion.button>
          )}
        </div>
      </motion.div>
      
      {/* Project Selection Modal */}
      {showProjectModal && (
        <ProjectSelectionModal 
          onClose={() => setShowProjectModal(false)} 
          onSelect={handleProjectSelect}
          facultyName={faculty.name}
          isLoading={facultyRequestMutation.isPending}
        />
      )}
    </>
  );
};

export const ProjectSelectionModal = ({ onClose, onSelect, facultyName, isLoading }) => {
  const { data, error, isSuccess } = useSuspenseQuery({
    queryKey: ['projects'],
    queryFn:()=> ProjectService.getAllProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });
  
  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-neutral-900/70 z-[9999]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-selection-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          delay: 0.1,
        }}
        className="bg-card/95 backdrop-blur-sm p-6 rounded-xl shadow-xl w-full max-w-lg mx-4 transition-all relative overflow-hidden border border-primary/20"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div 
          initial={{ opacity: 0, height: "0%" }}
          animate={{ opacity: 1, height: "100%" }}
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background/0 pointer-events-none"
        />
        
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors hover:scale-110 z-10"
          disabled={isLoading}
          aria-label="Close modal"
        >
          <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
            <IconX size={20} />
          </motion.div>
        </button>
        
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          id="project-selection-title" 
          className="text-2xl font-semibold mb-2 pr-6 break-words overflow-wrap-anywhere" 
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
        >
          Select a Project
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-6 break-words overflow-wrap-anywhere" 
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
        >
          Choose which project you want to request mentorship from <span className="font-medium text-primary">{facultyName}</span> for:
        </motion.p>
        
        {error ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 text-center bg-destructive/10 rounded-xl"
          >
            <p className="text-destructive break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              Failed to load projects: {error.message || 'Unknown error'}
            </p>
          </motion.div>
        ) : isLoading ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-8"
          >
            <div className="flex flex-col items-center">
              <IconLoader2 size={32} className="animate-spin text-primary mb-3" />
              <p className="text-muted-foreground">Loading your projects...</p>
            </div>
          </motion.div>
        ) : isSuccess && data?.projects && data.projects.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-h-[60vh] overflow-y-auto divide-y divide-border/20 bg-background/30 backdrop-blur-sm rounded-xl overflow-hidden border border-border/20"
          >
            {data.projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <ProjectListItem 
                  project={project}
                  onSelect={onSelect}
                  disabled={isLoading}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 text-center bg-background/30 backdrop-blur-sm rounded-xl border border-border/20"
          >
            <p className="mb-4 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>You don't have any projects yet.</p>
            <p className="text-sm text-muted-foreground break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Create a project first to request mentorship.</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
};

export const ProjectListItem = ({ project, onSelect, disabled = false }) => {
  return (
    <motion.div 
      className="p-4 hover:bg-accent/20 transition-all duration-200"
      whileHover={{ backgroundColor: "rgba(var(--accent)/0.2)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-medium text-base text-foreground truncate break-words overflow-wrap-anywhere" 
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} 
            title={project.title}
          >
            {project.title}
          </h4>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {project.description.abstract || project.description}
            </p>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${
            disabled 
              ? 'bg-primary/40 text-primary-foreground/70 cursor-not-allowed' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow'
          }`}
          onClick={() => !disabled && onSelect(project)}
          disabled={disabled}
          aria-label={`Select ${project.title} project`}
        >
          {disabled ? (
            <div className="flex items-center gap-2">
              <IconLoader2 size={16} className="animate-spin" />
              <span>Selecting</span>
            </div>
          ) : 'Select'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FacultyCard;
