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
import ProjectHeader from '../components/ProjectHeader';
import TabNavigation from '../components/TabNavigation';
import OverviewSection from '../components/OverviewSection';
import TeamSection from '../components/TeamSection';
import DocumentsSection from '../components/DocumentsSection';
import ActivitySection from '../components/ActivitySection';
import ProjectReviewModal from '../components/ui/ProjectReviewModal';

const ProjectDetailPage = () => {
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
      <ProjectHeader
        project={project}
        onChat={() => navigate(`/chat/${projectId}`)}
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
          className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-6 mb-8"
        >
          {activeTab === 'overview' && (
            <OverviewSection description={project?.description} />
          )}
          {activeTab === 'team' && (
            <TeamSection teamMembers={project?.teamMembers} assignedMentor={project?.assignedMentor} />
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
  );
};

export default AppLayout()(ProjectDetailPage);