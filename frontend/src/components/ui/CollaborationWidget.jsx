import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IconMessage, IconCalendar, IconFiles, IconShare, IconClock } from './Icons';
import MeetingService from '../../service/MeetingService';
import { formatRelativeDate } from '../../libs/utils';

const CollaborationWidget = () => {
  const navigate = useNavigate();
  
  // Query to fetch upcoming meetings
  const { data: meetingsData } = useQuery({
    queryKey: ['meetings', 'upcoming', 'widget'],
    queryFn: () => MeetingService.getUserMeetings('upcoming'),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Format time function
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get the next upcoming meeting
  const nextMeeting = meetingsData?.meetings?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="collab-widget"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="collab-widget-icon">
            <IconShare size={16} className="text-primary" />
          </div>
          <h3 className="collab-widget-title">Collaboration</h3>
        </div>
      </div>

      <div className="collab-widget-grid">
        <div 
          onClick={() => navigate('/collaborate?tab=chat')}
          className="collab-widget-tile"
        >
          <IconMessage size={24} className="text-blue-500 mb-2" />
          <span className="text-xs text-muted-foreground text-center">Chats</span>
        </div>
        
        <div 
          onClick={() => navigate('/collaborate?tab=meetings')}
          className="collab-widget-tile"
        >
          <IconCalendar size={24} className="text-amber-500 mb-2" />
          <span className="text-xs text-muted-foreground text-center">Meetings</span>
        </div>
        
        <div 
          onClick={() => navigate('/collaborate?tab=files')}
          className="collab-widget-tile"
        >
          <IconFiles size={24} className="text-green-500 mb-2" />
          <span className="text-xs text-muted-foreground text-center">Files</span>
        </div>
      </div>

      {nextMeeting && (
        <div 
          onClick={() => navigate('/collaborate?tab=meetings')}
          className="collab-widget-next"
        >
          <div className="flex items-center gap-2 mb-1">
            <IconClock size={14} className="text-primary" />
            <p className="text-sm font-medium">Next Meeting</p>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{nextMeeting.title}</p>
          <p className="text-xs font-medium">{formatRelativeDate(nextMeeting.scheduledFor)}</p>
        </div>
      )}

      <button
        onClick={() => navigate('/collaborate')}
        className="collab-widget-action"
      >
        View All Collaboration Tools
      </button>
    </motion.div>
  );
};

export default CollaborationWidget;