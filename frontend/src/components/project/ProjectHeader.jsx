  import { IconBriefcase, IconUsers, IconCalendar, IconFileDescription, IconClipboardList, IconCode, IconUserCircle, IconMessage, IconCircleCheck, IconX, IconCheck } from '../ui/Icons';
import { formatDate } from '../../libs/utils';

const ProjectHeader = ({ userRole, project, onChat, onSummarize, onReview }) => {
  // Safe formatDate function that handles null/undefined dates
  const safeFormatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return formatDate(dateString);
  };

  return (
    <div className="project-header">
      {/* Status indicator */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <IconBriefcase size={24} className="text-primary" />
          </div>
          <div>
            <h5 className="text-sm font-medium text-muted-foreground">Project Status</h5>
            <div className="mt-1">
              <span className={`project-status ${project?.status ? `project-status--${project.status}` : ''}`}>
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
          <button
            className="project-header-btn project-header-btn--ghost"
            onClick={onChat}
          >
            <IconMessage size={18} />
            <span className="font-medium">Chat</span>
          </button>
          <button
            className="project-header-btn project-header-btn--solid"
            onClick={onSummarize}
          >
            <IconFileDescription size={18} />
            <span className="font-medium">Summarize</span>
          </button>
          { userRole==='student' &&
            <button
              className="project-header-btn project-header-btn--solid"
              onClick={onReview}
            >
              <IconFileDescription size={18} />
              <span className="font-medium">Review</span>
            </button>
          }
        </div>
      </div>
      {/* Project Title */}
      <h1 className="project-title">
        {project?.title || 'Untitled Project'}
      </h1>
      {/* Project Metadata */}
      <div className="project-meta">
        <div className="flex items-center gap-1">
          <IconCalendar size={16} className="flex-shrink-0" />
          <span>Created: {safeFormatDate(project?.createdAt)}</span>
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
    </div>
  );
};

export default ProjectHeader;
