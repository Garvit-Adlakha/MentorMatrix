import { IconBriefcase, IconUsers, IconCalendar, IconFileDescription, IconClipboardList, IconCode, IconUserCircle, IconMessage, IconCircleCheck, IconX, IconCheck } from './ui/Icons';
import { formatDate } from '../libs/utils';

const ProjectHeader = ({ userRole, project, onChat, onSummarize, onReview }) => {
  // Safe formatDate function that handles null/undefined dates
  const safeFormatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return formatDate(dateString);
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-6 mb-8">
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
          <button
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2"
            onClick={onChat}
          >
            <IconMessage size={18} />
            <span className="font-medium">Chat</span>
          </button>
          <button
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={onSummarize}
          >
            <IconFileDescription size={18} />
            <span className="font-medium">Summarize</span>
          </button>
          { userRole==='student' &&
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              onClick={onReview}
            >
              <IconFileDescription size={18} />
              <span className="font-medium">Review</span>
            </button>
          }
        </div>
      </div>
      {/* Project Title */}
      <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
        {project?.title || 'Untitled Project'}
      </h1>
      {/* Project Metadata */}
      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
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
