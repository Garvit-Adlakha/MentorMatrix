import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../components/layouts/AppLayout';
import ProjectService from '../service/ProjectService';
import {
  IconBriefcase,
  IconUsers,
  IconCalendar,
  IconFileDescription,
  IconClipboardList,
  IconCode,
  IconFileText,
  IconUserCircle,
  IconMessage,
  IconArrowRight,
  IconDownload,
  IconEdit,
  IconCheck,
  IconCircleCheck,
  IconX
} from '../components/ui/Icons';
import ProjectSummaryModal from '../components/ui/ProjectSummaryModal';
import Loader from '../components/ui/Loader';
import AlertBox from '../components/ui/AlertBox';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSummary, setShowSummary] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState('');

  // Fetch project data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => ProjectService.getProjectById(projectId),
    enabled: !!projectId,
  });

  const project = data?.project;

  // Accept project request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: () => ProjectService.acceptProjectRequest(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      queryClient.invalidateQueries(['projects']);
    }
  });

  // Reject project request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: () => ProjectService.rejectProjectRequest(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      queryClient.invalidateQueries(['projects']);
    }
  });

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle accept request
  const onAcceptRequest = async () => {
    try {
      await acceptRequestMutation.mutateAsync();
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  // Handle reject request
  const onRejectRequest = async () => {
    try {
      await rejectRequestMutation.mutateAsync();
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleGoBack=()=>{
    navigate(-1);
  }

  // Tab content variants for animations
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader text="Loading project details..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 text-red-800 p-6 rounded-xl max-w-2xl mx-auto shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Error Loading Project</h2>
          <p className="mb-6">{error.message || "Failed to load project details. Please try again later."}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="container mx-auto px-4 py-8">

      <div className="bg-back text-center ring-0 inset 0 rounded-xl shadow-lg border border-primary/10 p-6 mb-8 w-fit flex items-center ">
        <button
        className='btn-priamry'
          onClick={handleGoBack}
        >
          Go Back
        </button>
      </div>

      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-6 mb-8"
      >
        {/* Status indicator */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <IconBriefcase size={24} className="text-primary" />
            </div>
            <div>
              <h5 className="text-sm font-medium text-muted-foreground">Project Status</h5>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
                  ${project?.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    project?.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    project?.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}
                >
                  {project?.status === 'approved' ? <IconCircleCheck size={16} /> :
                   project?.status === 'rejected' ? <IconX size={16} /> :
                   project?.status === 'completed' ? <IconCheck size={16} /> :
                   <IconClipboardList size={16} />
                  }
                  <span>{project?.status?.charAt(0).toUpperCase() + project?.status?.slice(1)}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2"
              onClick={() => navigate(`/chat/${projectId}`)}
            >
              <IconMessage size={18} />
              <span className="font-medium">Chat</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-2 ${isSummarizing ? 'bg-primary/20' : 'bg-primary'} text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70`}
              onClick={() => {
                setIsSummarizing(true);
                ProjectService.getSummary(projectId)
                  .then(() => {
                    setShowSummary(true);
                    setIsSummarizing(false);
                  })
                  .catch(() => {
                    setIsSummarizing(false);
                  });
              }}
              disabled={isSummarizing}
            >
              {isSummarizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  <span>Summarizing...</span>
                </>
              ) : (
                <>
                  <IconFileDescription size={18} />
                  <span className="font-medium">Summarize</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
        
        {/* Project Title */}
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          {project?.title}
        </h1>
        
        {/* Project Metadata */}
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <IconCalendar size={16} className="flex-shrink-0" />
            <span>Created: {formatDate(project?.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <IconUserCircle size={16} className="flex-shrink-0" />
            <span>Created by: {project?.createdBy?.name || 'Unknown'}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <IconUsers size={16} className="flex-shrink-0" />
            <span>Team Members: {project?.teamMembers?.length || 1}</span>
          </div>
        </div>
      </motion.div>
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-border/30">
        <div className="flex overflow-x-auto space-x-6 pb-2 scrollbar-hide">
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon={<IconFileDescription size={18} />}
            label="Overview"
          />
          <TabButton 
            active={activeTab === 'team'} 
            onClick={() => setActiveTab('team')}
            icon={<IconUsers size={18} />}
            label="Team"
          />
          <TabButton 
            active={activeTab === 'documents'} 
            onClick={() => setActiveTab('documents')}
            icon={<IconFileText size={18} />}
            label="Documents"
          />
          <TabButton 
            active={activeTab === 'activity'} 
            onClick={() => setActiveTab('activity')}
            icon={<IconCalendar size={18} />}
            label="Activity"
          />
        </div>
      </div>
      
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={tabContentVariants}
          className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-sm"
        >
          {activeTab === 'overview' && (
            <div>
              {/* Project description sections */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <IconFileDescription size={18} className="text-primary flex-shrink-0" />
                  <h2 className="text-xl font-semibold">Abstract</h2>
                </div>
                <p className="text-muted-foreground mb-6 whitespace-pre-wrap break-words">
                  {project?.description?.abstract || 'No abstract available'}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <IconClipboardList size={18} className="text-primary flex-shrink-0" />
                  <h2 className="text-xl font-semibold">Problem Statement</h2>
                </div>
                <p className="text-muted-foreground mb-6 whitespace-pre-wrap break-words">
                  {project?.description?.problemStatement || 'No problem statement available'}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <IconBriefcase size={18} className="text-primary flex-shrink-0" />
                  <h2 className="text-xl font-semibold">Proposed Methodology</h2>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap break-words">
                  {project?.description?.proposedMethodology || 'No methodology available'}
                </p>
              </div>

              {/* Tech stack */}
              {project?.description?.techStack && project?.description?.techStack.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center gap-2 mb-4">
                    <IconCode size={18} className="text-primary flex-shrink-0" />
                    <h2 className="text-xl font-semibold">Technologies</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.description.techStack.map((tech, index) => (
                      <span key={index} className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              {/* Team members */}
              {project?.teamMembers && project?.teamMembers.length > 0 ? (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <IconUsers className="text-primary" size={20} />
                    Team Members
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.teamMembers.map((member, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all"
                      >
                        <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <IconUserCircle size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{member?.name}</p>
                          <p className="text-sm text-muted-foreground">{member?.email}</p>
                          {member?.role && (
                            <p className="text-xs text-primary mt-1">{member.role}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <IconUsers size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Team Members</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    This project doesn't have any team members assigned yet.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium inline-flex items-center gap-2"
                  >
                    Add Team Members
                    <IconArrowRight size={16} />
                  </motion.button>
                </div>
              )}

              {/* Mentor information if available */}
              {project?.assignedMentor && (
                <div className="mt-10">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <IconUserCircle className="text-primary" size={20} />
                    Assigned Mentor
                  </h2>
                  <div className="bg-gradient-to-br from-primary/10 to-transparent p-5 rounded-xl border border-primary/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconUserCircle size={32} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xl font-bold">{project.assignedMentor.name}</p>
                        <p className="text-muted-foreground">{project.assignedMentor.email}</p>
                        {project.assignedMentor.department && (
                          <p className="text-sm text-primary/80 mt-1">{project.assignedMentor.department}</p>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2"
                      >
                        <IconMessage size={16} />
                        <span className="font-medium">Contact</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <IconFileText className="text-primary" size={20} />
                Project Documents
              </h2>
              
              {project?.documents && project?.documents.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {project.documents.map((doc, index) => (
                    <motion.a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconFileText size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium break-words">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.format} • Uploaded on {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                          <IconDownload size={20} className="text-primary" />
                        </span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <IconFileText size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Documents Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    There are no documents uploaded for this project yet.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium inline-flex items-center gap-2"
                  >
                    Upload Document
                    <IconArrowRight size={16} />
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <IconCalendar className="text-primary" size={20} />
                Project Activity
              </h2>
              
              <div className="relative border-l-2 border-primary/30 ml-3 pl-6 py-2">
                {/* Sample activity items - can be replaced with real data */}
                {[
                  { id: 1, action: 'Project created', user: project?.createdBy?.name || 'User', date: project?.createdAt },
                  { id: 2, action: 'Team member added', user: 'System', date: project?.updatedAt },
                  { id: 3, action: 'Updated project description', user: project?.createdBy?.name || 'User', date: project?.updatedAt }
                ].map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="mb-8 relative"
                  >
                    <div className="absolute -left-10 w-4 h-4 rounded-full bg-primary"></div>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{activity.action}</h3>
                        <span className="text-xs text-muted-foreground">{formatDate(activity.date)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">by {activity.user}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Action buttons for mentors - Accept/Reject */}
      {project?.status === 'pending' && project?.mentorRequests && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-end gap-4"
        >
          <button
            className="px-6 py-3 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
            onClick={() => {
              setConfirmationType('reject');
              setShowConfirmation(true);
            }}
          >
            Reject Project
          </button>
          <button
            className="px-6 py-3 bg-green-100 text-green-800 font-medium rounded-lg hover:bg-green-200 transition-colors"
            onClick={() => {
              setConfirmationType('accept');
              setShowConfirmation(true);
            }}
          >
            Accept Project
          </button>
        </motion.div>
      )}
      
      {/* Confirmation modals */}
      {showConfirmation && confirmationType === 'accept' && (
        <AlertBox
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={onAcceptRequest}
          title="Accept Project"
          message="Are you sure you want to accept this project?"
          confirmText="Accept"
          cancelText="Cancel"
          type="success"
        />
      )}
      
      {showConfirmation && confirmationType === 'reject' && (
        <AlertBox
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={onRejectRequest}
          title="Reject Project"
          message="Are you sure you want to reject this project?"
          confirmText="Reject"
          cancelText="Cancel"
          type="error"
        />
      )}

      {/* Project Summary Modal */}
      <ProjectSummaryModal
        open={showSummary}
        onOpenChange={setShowSummary}
        projectId={projectId}
      />
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon, label }) => {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm rounded-t-lg border-b-2 whitespace-nowrap 
        ${active ? 
          'text-primary border-primary' : 
          'text-muted-foreground border-transparent hover:border-primary/30 hover:text-foreground'
        }`}
    >
      {icon}
      {label}
    </motion.button>
  );
};

export default AppLayout()(ProjectDetailPage);