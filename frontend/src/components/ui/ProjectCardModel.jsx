import React from 'react';
import { createPortal } from 'react-dom';
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
    IconFileDescription
} from './Icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authService from '../../service/authService';
import AlertBox from './AlertBox';
import Loader from './Loader';

const ProjectCardModel = ({ open, onOpenChange, projectId, onSuccess }) => {

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

    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ["user"],
        queryFn: () => authService.currentUser(),
        staleTime: 1000 * 60 * 60 * 24,
    });
    const user = userData?.user;
    const project = projectData?.project;

    // Function to format dates
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status badge style based on status
    const getStatusBadge = (status) => {
        const statusStyles = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
            completed: "bg-blue-100 text-blue-800"
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

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

    if (!open) return null;

    if (isLoading || userLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/60 z-[9999] transition-opacity duration-300">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Loading project details...</p>
            </div>
        );
    }

    if(acceptRequestMutation.isPending || rejectRequestMutation.isPending) {
        return createPortal(
            <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/60 z-[9999] transition-opacity duration-300">
                <Loader />
            </div>,
            document.getElementById('portal-root')
        );
    }

    if (isError) {
        return (
            <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/60 z-[9999] transition-opacity duration-300">
                <div className="bg-card p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-medium text-red-500 mb-2">Error Loading Project</h3>
                    <p className="text-muted-foreground mb-4">Failed to load project details. Please try again later.</p>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/60 z-20 transition-opacity duration-300"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-card p-8 rounded-2xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] m-4 border border-primary/10 transition-all duration-300 transform animate-fadeIn"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with close button */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                        Project Details
                    </h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-accent/30 transition-colors"
                        aria-label="Close"
                    >
                        <IconX size={18} />
                    </button>
                </div>
                {  /* Project title and status */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', maxWidth: '100%' }}>{project?.title}</h3>
                        {getStatusBadge(project?.status)}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <IconCalendar size={16} />
                            <span>Created: {formatDate(project?.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <IconUserCircle size={16} />
                            <span>Created by: {project.createdBy?.name || 'Unknown'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <IconUsers size={16} />
                            <span>Team Members: {project?.totalMembers || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Project description sections */}
                <div className="bg-accent/5 rounded-lg p-5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <IconFileDescription size={18} className="text-primary" />
                        <h4 className="text-md font-medium">Abstract</h4>
                    </div>
                    <p className="text-muted-foreground mb-4 whitespace-pre-wrap break-words">
                        {project?.description?.abstract || 'No abstract available'}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                        <IconClipboardList size={18} className="text-primary" />
                        <h4 className="text-md font-medium">Problem Statement</h4>
                    </div>
                    <p className="text-muted-foreground mb-4 whitespace-pre-wrap break-words">
                        {project?.description?.problemStatement || 'No problem statement available'}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                        <IconBriefcase size={18} className="text-primary" />
                        <h4 className="text-md font-medium">Proposed Methodology</h4>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap break-words">
                        {project?.description?.proposedMethodology || 'No methodology available'}
                    </p>
                </div>

                {/* Tech stack */}
                {project.description?.techStack && project.description.techStack.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <IconCode size={18} className="text-primary" />
                            <h4 className="text-md font-medium">Technologies</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {project.description.techStack.map((tech, index) => (
                                <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Team members */}
                {project.teamMembers && project.teamMembers.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <IconUsers size={18} className="text-primary" />
                            <h4 className="text-md font-medium">Team Members</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {project.teamMembers.map((member, index) => (
                                <div key={index} className="flex items-center gap-2 bg-accent/10 p-2 rounded-lg">
                                    <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                                        <IconUserCircle size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium">{member?.name}</p>
                                        <p className="text-xs text-muted-foreground">{member?.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mentor information */}
                {project.assignedMentor && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <IconUserCircle size={18} className="text-primary" />
                            <h4 className="text-md font-medium">Assigned Mentor</h4>
                        </div>
                        <div className="bg-accent/10 p-4 rounded-lg flex items-center gap-3">
                            <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                                <IconUserCircle size={24} />
                            </div>
                            <div>
                                <p className="font-medium">{project.assignedMentor.name}</p>
                                <p className="text-sm text-muted-foreground">{project.assignedMentor.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Documents */}
                {project.documents && project.documents.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <IconFileText size={18} className="text-primary" />
                            <h4 className="text-md font-medium">Documents</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {project.documents.map((doc, index) => (
                                <a
                                    key={index}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 bg-accent/10 p-3 rounded-lg hover:bg-accent/20 transition-colors"
                                >
                                    <IconFileText size={18} />
                                    <div>
                                        <p className="font-medium">{doc.name}</p>
                                        <p className="text-xs text-muted-foreground">
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
                <div className="mt-6 flex gap-4 justify-end">
                    <button
                        className="px-6 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
                        onClick={rejectRequestClickHandler}
                    >
                        Reject
                    </button>
                    <button
                        className="px-6 py-2 bg-green-100 text-green-800 font-medium rounded-lg hover:bg-green-200 transition-colors"
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
            </div>
        </div>,
        document.getElementById('portal-root')
    );
};

export default ProjectCardModel;