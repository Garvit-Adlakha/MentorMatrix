import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MeetingService from '../service/MeetingService';
import JitsiMeetComponent from '../components/meetings/JitsiMeetComponent';
import toast from 'react-hot-toast';
import { IconCalendar, IconClock, IconUsers, IconShare } from '../components/ui/Icons';

const MeetingRoomPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [jitsiInfo, setJitsiInfo] = useState(null);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: () => MeetingService.getProjectMeetings(meetingId),
  });


  useEffect(() => {
    if (data?.meeting) {
      setJitsiInfo({
        roomName: data.meeting.roomName || `MentorMatrix-${meetingId}`,
        displayName: data.meeting.scheduledBy?.name || 'User',
      });
    }
  }, [data, meetingId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const calculateDuration = () => {
    if (!data?.meeting?.startTime || !data?.meeting?.endTime) return 'N/A';
    const start = new Date(data.meeting.startTime);
    const end = new Date(data.meeting.endTime);
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / (1000 * 60));
    return `${minutes} minutes`;
  };

  const handleCopyLink = () => {
    const meetingLink = data?.meeting?.meetingLink || window.location.href;
    navigator.clipboard.writeText(meetingLink)
      .then(() => {
        setIsCopied(true);
        toast.success('Meeting link copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };

  const handleApiReady = (api) => {
    setJitsiApi(api);
    
    api.addEventListener('videoConferenceLeft', () => {
      navigate('/collaborate?tab=meetings');
      toast.success('You have left the meeting');
    });
  };

  if (isLoading) return (
    <div className="meeting-state">
      <div className="meeting-state-card">
        <div className="meeting-spinner"></div>
        <p className="meeting-state-text">Loading meeting...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="meeting-state">
      <div className="meeting-state-card meeting-state-card--error">
        <div className="meeting-state-icon">⚠️</div>
        <h2 className="meeting-state-title">Meeting Error</h2>
        <p className="meeting-state-text">{error?.message || 'Failed to load meeting.'}</p>
        <button 
          className="meeting-state-action"
          onClick={() => navigate('/collaborate?tab=meetings')}
        >
          Return to Meetings
        </button>
      </div>
    </div>
  );

  if (!jitsiInfo || !data?.meeting) return (
    <div className="meeting-state">
      <div className="meeting-state-card meeting-state-card--warn">
        <div className="meeting-state-icon">🤔</div>
        <h2 className="meeting-state-title">Meeting Not Found</h2>
        <p className="meeting-state-text">We couldn&apos;t find information for this meeting.</p>
        <button 
          className="meeting-state-action"
          onClick={() => navigate('/collaborate?tab=meetings')}
        >
          Return to Meetings
        </button>
      </div>
    </div>
  );

  const meeting = data.meeting;

  return (
    <div className="meeting-page">
      <div className="meeting-bg">
        <div className="meeting-orb meeting-orb--one" />
        <div className="meeting-orb meeting-orb--two" />
        <div className="meeting-grid" />
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6 meeting-container">
      <div className="meeting-header">
        <div>
          <h1 className="meeting-title">{meeting.title || 'Meeting Room'}</h1>
          <p className="meeting-subtitle">{meeting.description || 'No description provided'}</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="meeting-btn meeting-btn--primary"
            onClick={handleCopyLink}
          >
            <IconShare className="w-5 h-5" />
            {isCopied ? 'Copied!' : 'Copy Link'}
          </button>
          <button 
            className="meeting-btn meeting-btn--ghost"
            onClick={() => navigate('/collaborate?tab=meetings')}
          >
            Back to Meetings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <JitsiMeetComponent 
            roomName={jitsiInfo.roomName} 
            displayName={jitsiInfo.displayName} 
            onApiReady={handleApiReady}
          />
        </div>
        <div className="meeting-details">
          <h2 className="meeting-details-title">Meeting Details</h2>
          
          <div className="flex items-start gap-3">
            <IconCalendar className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="meeting-details-label">Date</p>
              <p className="meeting-details-value">{formatDate(meeting.startTime)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <IconClock className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="meeting-details-label">Time</p>
              <p className="meeting-details-value">
                {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                <span className="meeting-details-muted">({meeting.durationMinutes || calculateDuration()} minutes)</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <IconUsers className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="meeting-details-label">Scheduled By</p>
              <p className="meeting-details-value">{meeting.scheduledBy?.name || 'Unknown'}</p>
            </div>
          </div>

          {meeting.participants && meeting.participants.length > 0 && (
            <div className="meeting-details-section">
              <p className="meeting-details-label">Participants</p>
              <div className="mt-1">
                {meeting.participants.map((participant, index) => (
                  <div key={index} className="meeting-details-value">
                    {participant.name || participant.email || 'Unknown participant'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {meeting.projectId && (
            <div className="meeting-details-section">
              <p className="meeting-details-label">Project</p>
              <p className="meeting-details-value">{meeting.projectId.title}</p>
            </div>
          )}

          {meeting.location && (
            <div className="meeting-details-section">
              <p className="meeting-details-label">Location</p>
              <p className="meeting-details-value">{meeting.location}</p>
            </div>
          )}

          {meeting.meetingNotes && (
            <div className="meeting-details-section">
              <p className="meeting-details-label">Meeting Notes</p>
              <div className="meeting-notes">
                {meeting.meetingNotes}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button 
              className="meeting-leave"
              onClick={() => {
                if (jitsiApi) {
                  jitsiApi.executeCommand('hangup');
                } else {
                  navigate('/collaborate?tab=meetings');
                  toast.success('You have left the meeting');
                }
              }}
            >
              Leave Meeting
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default MeetingRoomPage;
