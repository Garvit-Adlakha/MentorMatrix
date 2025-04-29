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

  console.log('Meeting data:', data);

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
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-accent rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-xl">Loading meeting...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-8 max-w-md bg-red-50 rounded-lg shadow">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">Meeting Error</h2>
        <p className="text-lg text-red-500">{error?.message || 'Failed to load meeting.'}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors" 
          onClick={() => navigate('/collaborate?tab=meetings')}
        >
          Return to Meetings
        </button>
      </div>
    </div>
  );

  if (!jitsiInfo || !data?.meeting) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-8 max-w-md bg-yellow-50 rounded-lg shadow">
        <div className="text-yellow-500 text-5xl mb-4">🤔</div>
        <h2 className="text-2xl font-bold mb-2">Meeting Not Found</h2>
        <p className="text-lg">We couldn&apos;t find information for this meeting.</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors" 
          onClick={() => navigate('/collaborate?tab=meetings')}
        >
          Return to Meetings
        </button>
      </div>
    </div>
  );

  const meeting = data.meeting;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{meeting.title || 'Meeting Room'}</h1>
          <p className="text-gray-500">{meeting.description || 'No description provided'}</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-1"
            onClick={handleCopyLink}
          >
            <IconShare className="w-5 h-5" />
            {isCopied ? 'Copied!' : 'Copy Link'}
          </button>
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors" 
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
        <div className="bg-neutral-900 p-4 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Meeting Details</h2>
          
          <div className="flex items-start gap-3">
            <IconCalendar className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{formatDate(meeting.startTime)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <IconClock className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">
                {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                <span className="block text-sm text-gray-400">({meeting.durationMinutes || calculateDuration()} minutes)</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <IconUsers className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Scheduled By</p>
              <p className="font-medium">{meeting.scheduledBy?.name || 'Unknown'}</p>
            </div>
          </div>

          {meeting.participants && meeting.participants.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-500">Participants</p>
              <div className="mt-1">
                {meeting.participants.map((participant, index) => (
                  <div key={index} className="text-sm font-medium">
                    {participant.name || participant.email || 'Unknown participant'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {meeting.projectId && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-500">Project</p>
              <p className="font-medium">{meeting.projectId.title}</p>
            </div>
          )}

          {meeting.location && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{meeting.location}</p>
            </div>
          )}

          {meeting.meetingNotes && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-500 mb-1">Meeting Notes</p>
              <div className="bg-white p-3 rounded border text-sm">
                {meeting.meetingNotes}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button 
              className="w-full px-4 py-2 bg-neutral-800 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
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
  );
};

export default MeetingRoomPage;
