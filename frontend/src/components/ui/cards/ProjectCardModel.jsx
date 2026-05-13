import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import ProjectService from '../../service/ProjectService';
import {
    IconX,
    IconCalendar,
    IconUserCircle,
    IconClipboardList,
    IconFileText,
    IconBriefcase,
    IconCode,
    IconUsers,
    IconFileDescription,
    IconMessage
} from './Icons';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import authService from '../../service/authService';
import AlertBox from './AlertBox';
import Loader from './Loader';
import ProjectSummaryModal from './ProjectSummaryModal';
import { formatDate } from '../../libs/utils';

const ProjectCardModel = ({ open, onOpenChange, projectId, onSuccess }) => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState("");
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onOpenChange(false);
        }
    };

    const { data: projectData, isLoading, isError } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => ProjectService.getProjectById(projectId),
        enabled: !!projectId
    });

    const { data: userData} = useSuspenseQuery({
        queryKey: ["user"],
        queryFn: () => authService.currentUser(),
        staleTime: 1000 * 60 * 60 * 24,
    });

    const user = userData?.user;
    const project = projectData?.project;

    const queryClient = useQueryClient();

    const [showConformation, setShowConfirmation] = React.useState(false);
    const [conformationType, setConfirmationType] = React.useState(null);

    const acceptRequestMutation = useMutation({
        mutationFn: () => ProjectService.mentorDecision({ projectId, decision: 'accept' }),
        onSuccess: (data) => {
            console.log("Accepted request successfully", data);
            queryClient.invalidateQueries(["project", projectId]);
            queryClient.invalidateQueries(["projects"]);
        },
        onError: (error) => {
            console.log("Error accepting request", error);
        }
    });
    
    const acceptRequestClickHandler = async () => {
        setShowConfirmation(true);   
        setConfirmationType('accept');
    }
    const onAcceptRequest = async() => {
        try {
            await acceptRequestMutation.mutateAsync();
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    }

    const rejectRequestMutation = useMutation({
        mutationFn: () => ProjectService.mentorDecision({ projectId, decision: 'reject' }),
        onSuccess: (data) => {
            console.log("Rejected request successfully", data);
            queryClient.invalidateQueries(["project", projectId]);
            queryClient.invalidateQueries(["projects"]);
        },
        onError: (error) => {
            console.log("Error rejecting request", error);
        }
    });
    const onRejectRequest = async () => {
        try {
            await rejectRequestMutation.mutateAsync();
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    }

    const rejectRequestClickHandler = async () => {
        setShowConfirmation(true);
        setConfirmationType('reject');
    }

    const handleChatClick = () => {
        onOpenChange(false);
        navigate(`/chat/${projectId}`);
    };

    if (!open) return null;

    if (isLoading ) {
        return (
            <div className="modal-backdrop modal-backdrop--blocking">
                <div className="modal-loading">
                    <div className="modal-spinner">
                        <div className="modal-spinner-ring"></div>
                    </div>
                    <p className="modal-loading-title">Loading project details...</p>
                </div>
            </div>
        );
    }

    if(acceptRequestMutation.isPending || rejectRequestMutation.isPending) {
        return createPortal(
            <div className="modal-backdrop modal-backdrop--blocking">
                <Loader />
            </div>,
            document.getElementById('portal-root')
        );
    }

    if (isError) {
        return (
            <div className="modal-backdrop modal-backdrop--blocking">
                <div className="modal-error modal-error--panel">
                    <h3 className="modal-error-title">Error Loading Project</h3>
                    <p>Failed to load project details. Please try again later.</p>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="modal-btn modal-btn--solid"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return createPortal(
        <div className="project-card-backdrop"
            onClick={handleBackdropClick}
        >
            <div
                className="project-card-modal"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with close button */}
                <div className="project-card-header">
                    <h2 className="project-card-title">
                        Project Details
                    </h2>
                    <div className="project-card-actions">
                        <button
                            className="project-card-btn project-card-btn--ghost"
                            onClick={handleChatClick}
                        >
                            <IconMessage size={18} />
                            <span className="project-card-btn-text">Chat</span>
                        </button>
                        <button
                            className="project-card-btn project-card-btn--solid"
                            onClick={() => {
                                setIsSummarizing(true);
                                ProjectService.getSummary(projectId)
                                    .then(response => {
                                        if (response && response.summary) {
                                            setSummary(response.summary);
                                            setShowSummary(true);
                                        } else {
                                            setSummary("Sorry, we couldn't generate a summary at this time.");
                                            setShowSummary(true);
                                        }
                                    })
                                    .catch(error => {
                                        console.error("Error getting summary:", error);
                                        setSummary("An error occurred while generating the summary.");
                                        setShowSummary(true);
                                    })
                                    .finally(() => {
                                        setIsSummarizing(false);
                                    });
                            }}
                            disabled={isSummarizing}
                        >
                            {isSummarizing ? (
                                <>
                                    <svg className="project-card-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="project-card-btn-text">Summarizing...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="project-card-btn-text">Summarize</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="project-card-close"
                            aria-label="Close"
                        >
                            <IconX size={20} />
                        </button>
                    </div>
                </div>
                {/* Project title */}
                <div className="project-card-block">
                    <div className="project-card-row">
                        <h3 className="project-card-subtitle" style={{ wordBreak: 'break-word' }}>{project?.title}</h3>
                    </div>

                    <div className="project-card-meta">
                        <div className="project-card-meta-item">
                            <IconCalendar size={16} className="flex-shrink-0" />
                            <span>Created: {formatDate(project?.createdAt)}</span>
                        </div>

                        <div className="project-card-meta-item">
                            <IconUserCircle size={16} className="flex-shrink-0" />
                            <span>Created by: {project.createdBy?.name || 'Unknown'}</span>
                        </div>

                        <div className="project-card-meta-item">
                            <IconUsers size={16} className="flex-shrink-0" />
                            <span>Team Members: {project?.totalMembers || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Project description sections */}
                <div className="project-card-section">
                    <div className="project-card-section-title">
                        <IconFileDescription size={18} className="text-primary flex-shrink-0" />
                        <h4>Abstract</h4>
                    </div>
                    <p className="project-card-text" style={{ wordBreak: 'break-word' }}>
                        {project?.description?.abstract || 'No abstract available'}
                    </p>

                    <div className="project-card-section-title">
                        <IconClipboardList size={18} className="text-primary flex-shrink-0" />
                        <h4>Problem Statement</h4>
                    </div>
                    <p className="project-card-text" style={{ wordBreak: 'break-word' }}>
                        {project?.description?.problemStatement || 'No problem statement available'}
                    </p>

                    <div className="project-card-section-title">
                        <IconBriefcase size={18} className="text-primary flex-shrink-0" />
                        <h4>Proposed Methodology</h4>
                    </div>
                    <p className="project-card-text" style={{ wordBreak: 'break-word' }}>
                        {project?.description?.proposedMethodology || 'No methodology available'}
                    </p>
                </div>

                {/* Tech stack */}
                {project.description?.techStack && project.description.techStack.length > 0 && (
                    <div className="project-card-block">
                        <div className="project-card-section-title">
                            <IconCode size={18} className="text-primary flex-shrink-0" />
                            <h4>Technologies</h4>
                        </div>
                        <div className="project-card-tags">
                            {project.description.techStack.map((tech, index) => (
                                <span key={index} className="project-card-tag" style={{ wordBreak: 'break-word' }}>
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Team members */}
                {project.teamMembers && project.teamMembers.length > 0 && (
                    <div className="project-card-block">
                        <div className="project-card-section-title">
                            <IconUsers size={18} className="text-primary flex-shrink-0" />
                            <h4>Team Members</h4>
                        </div>
                        <div className="project-card-grid">
                            {project.teamMembers.map((member, index) => (
                                <div key={index} className="project-card-member">
                                    <div className="project-card-member-icon">
                                        <IconUserCircle size={16} />
                                    </div>
                                    <div className="project-card-member-info">
                                        <p style={{ wordBreak: 'break-word' }}>{member?.name}</p>
                                        <p style={{ wordBreak: 'break-word' }}>{member?.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mentor information */}
                {project.assignedMentor && (
                    <div className="project-card-block">
                        <div className="project-card-section-title">
                            <IconUserCircle size={18} className="text-primary flex-shrink-0" />
                            <h4>Assigned Mentor</h4>
                        </div>
                        <div className="project-card-mentor">
                            <div className="project-card-mentor-icon">
                                <IconUserCircle size={24} />
                            </div>
                            <div className="project-card-mentor-info">
                                <p style={{ wordBreak: 'break-word' }}>{project.assignedMentor.name}</p>
                                <p style={{ wordBreak: 'break-word' }}>{project.assignedMentor.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Documents */}
                {project.documents && project.documents.length > 0 && (
                    <div>
                        <div className="project-card-section-title">
                            <IconFileText size={18} className="text-primary flex-shrink-0" />
                            <h4>Documents</h4>
                        </div>
                        <div className="project-card-docs">
                            {project.documents.map((doc, index) => (
                                <a
                                    key={index}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="project-card-doc"
                                >
                                    <IconFileText size={18} className="flex-shrink-0" />
                                    <div className="project-card-doc-info">
                                        <p style={{ wordBreak: 'break-word' }}>{doc.name}</p>
                                        <p style={{ wordBreak: 'break-word' }}>
                                            {doc.format} • Uploaded on {formatDate(doc.uploadedAt)}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action buttons for mentor */}
                {user && project?.mentorRequests && project.mentorRequests.some(request => request === user._id) && project.status === 'pending' && (
                    <div className="project-card-footer">
                        <button
                            className="project-card-btn project-card-btn--danger"
                            onClick={rejectRequestClickHandler}
                        >
                            Reject
                        </button>
                        <button
                            className="project-card-btn project-card-btn--success"
                            onClick={acceptRequestClickHandler}
                        >
                            Accept
                        </button>
                    </div>
                )}
            
            {showConformation && conformationType === 'accept' && (
                <div>
                    <AlertBox 
                        isOpen={showConformation}
                        onClose={() => setShowConfirmation(false)}
                        onConfirm={onAcceptRequest}
                        title="Accept Request"
                        message="Are you sure you want to accept this request?"
                        confirmText="Accept"
                        cancelText="Cancel"
                        type="success"
                    />
                </div>
            )}
            
            {showConformation && conformationType === 'reject' && (
                <div>
                    <AlertBox 
                        isOpen={showConformation}
                        onClose={() => setShowConfirmation(false)}
                        onConfirm={onRejectRequest}
                        title="Reject Request"
                        message="Are you sure you want to reject this request?"
                        confirmText="Reject"
                        cancelText="Cancel"
                        type="error"
                    />
                </div>
            )}

            {/* add Members To a project */}
            {project?.status === 'pending' && (
                <div className="project-card-footer">
                    <button
                        className="project-card-btn project-card-btn--info"
                        onClick={() => {
                            onOpenChange(false);
                            navigate(`/projects/${projectId}/add-member`);
                        }}
                    >
                        Add Members
                    </button>
                </div>
            )}
            
            {/* Summary modal */}
            {showSummary && (
                <ProjectSummaryModal 
                    open={showSummary}
                    onOpenChange={setShowSummary}
                    projectId={projectId}
                />
            )}
            </div>
           
        </div>,
        document.getElementById('portal-root')
    );
};

export default ProjectCardModel;