import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../components/layouts/AppLayout';
import ProjectService from '../service/ProjectService';
import authService from '../service/authService';
import {
  IconUsers,
  IconCalendar,
  IconFileDescription,
  IconFileText,
  IconArrowLeft
} from '../components/ui/Icons';
import ProjectSummaryModal from '../components/ui/modals/ProjectSummaryModal';
import Loader from '../components/ui/Loader';
import AlertBox from '../components/ui/alerts/AlertBox';
import ProjectHeader from '../components/project/ProjectHeader';
import TabNavigation from '../components/common/TabNavigation';
import OverviewSection from '../components/project/OverviewSection';
import TeamSection from '../components/project/TeamSection';
import DocumentsSection from '../components/project/DocumentsSection';
import ActivitySection from '../components/project/ActivitySection';
import ProjectReviewModal from '../components/ui/modals/ProjectReviewModal';
import toast from 'react-hot-toast';

const ProjectDetailPageComponent = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState('');

  // Fetch project data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => ProjectService.getProjectById(projectId),
    enabled: !!projectId,
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => authService.currentUser(),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  })
  const userRole = user?.role;

  const project = data?.project;
  const ProjectLead = project?.createdBy

  // Accept project request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: () => ProjectService.mentorDecision({ projectId, decision: 'accept' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      queryClient.invalidateQueries(['projects']);
    }
  });

  // Reject project request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: () => ProjectService.mentorDecision({ projectId, decision: 'reject' }),
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


  const handleTeamAddMembersMutation = useMutation({
    mutationFn: ({ newMembersEmails }) => ProjectService.addTeamMembers({ projectId, newMembersEmails }),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      queryClient.invalidateQueries(['projects']);
      toast.success('Team members added successfully!');
    },
    onError: (error) => {
      toast.error(`Error adding team members: ${error.message}`);
    }
  });

  const handleAddTeamMembers = async (newMembersEmails) => {
    try {

      await handleTeamAddMembersMutation.mutateAsync({ newMembersEmails });
    } catch (error) {
      console.error("Error adding team members:", error);
    }
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

  const handleGoBack = () => {
    navigate(-1);
  };

  // Tab content variants for animations
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // Tab definitions
  const tabs = [
    { key: 'overview', icon: <IconFileDescription size={18} />, label: 'Overview' },
    { key: 'team', icon: <IconUsers size={18} />, label: 'Team' },
    { key: 'documents', icon: <IconFileText size={18} />, label: 'Documents' },
    { key: 'activity', icon: <IconCalendar size={18} />, label: 'Activity' },
  ];

  if (isError) {
    return (
      <div className="project-error-wrap">
        <div className="project-error-card">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Unable to Load Project</h2>
          <p className="mb-6 text-muted-foreground">{error.message || "Failed to load project details. Please try again later."}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="project-error-action"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-page">
      <div className="project-bg">
        <div className="project-orb project-orb--one" />
        <div className="project-orb project-orb--two" />
        <div className="project-grid" />
      </div>

      <div className="container mx-auto px-4 py-8 project-container">
      <div className="project-back">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="project-back-btn"
          onClick={handleGoBack}
        >
          <IconArrowLeft size={18} />
          <span className="font-medium">Go Back</span>
        </motion.button>
      </div>

      {/* Project Header */}
      <ProjectHeader
        userRole={userRole}
        project={project}
        onChat={() => navigate(`/chat`)}
        onSummarize={() => setShowSummaryModal(true)}
        onReview={() => setShowReviewModal(true)}
      />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={tabContentVariants}
          className="project-tab-panel"
        >
          {(isLoading || acceptRequestMutation.isPending || rejectRequestMutation.isPending || handleTeamAddMembersMutation.isPending) ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader text="Fetching project details..." />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewSection description={project?.description} />
              )}
              {activeTab === 'team' && (
                <TeamSection teamMembers={project?.teamMembers} createdBy={ProjectLead} assignedMentor={project?.assignedMentor} handleAddTeamMembers={handleAddTeamMembers}  />
              )}
              {activeTab === 'documents' && (
                <DocumentsSection documents={project?.documents} formatDate={formatDate} />
              )}
              {activeTab === 'activity' && (
                <ActivitySection
                  activity={[
                    { id: 1, action: 'Project created', user: project?.createdBy?.name || 'User', date: project?.createdAt },
                    { id: 2, action: 'Team member added', user: 'System', date: project?.updatedAt },
                    { id: 3, action: 'Updated project description', user: project?.createdBy?.name || 'User', date: project?.updatedAt }
                  ]}
                  formatDate={formatDate}
                />
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {userRole === 'mentor' && project?.status === 'pending' && project?.mentorRequests && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="project-action-bar"
        >
          <button
            className="project-action project-action--reject"
            onClick={() => {
              setConfirmationType('reject');
              setShowConfirmation(true);
            }}
          >
            Reject Project
          </button>
          <button
            className="project-action project-action--accept"
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
        open={showSummaryModal}
        onOpenChange={setShowSummaryModal}
        projectId={projectId}
        />

      {/* Project Review Modal */}
      <ProjectReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        projectId={projectId}
        isReviewMode={true}
        />
    </div>
    </div>
  );
};

ProjectDetailPageComponent.layoutClassName = "landing-theme";

const ProjectDetailPage = AppLayout()(ProjectDetailPageComponent);
export default ProjectDetailPage;