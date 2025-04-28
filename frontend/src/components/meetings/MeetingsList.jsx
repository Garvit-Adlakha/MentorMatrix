import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import MeetingService from '../../service/MeetingService';
import { formatDate, formatTime } from '../../libs/utils';
import {
  IconCalendar,
  IconClock,
  IconUsers,
  IconVideo,
  IconPhone,
  IconMapPin,
  IconCheck,
  IconX,
  IconTrash
} from '../ui/Icons';

const MeetingsList = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const queryClient = useQueryClient();

  // Query to fetch meetings
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['meetings', activeTab],
    queryFn: () => MeetingService.getUserMeetings(activeTab),
    refetchOnWindowFocus: false,
  });

  // Mutation to update meeting status
  const updateStatusMutation = useMutation({
    mutationFn: ({ meetingId, status }) => MeetingService.updateMeetingStatus(meetingId, status),
    onSuccess: () => {
      toast.success('Meeting status updated successfully');
      queryClient.invalidateQueries(['meetings']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update meeting status');
    }
  });

  // Mutation to delete meeting
  const deleteMeetingMutation = useMutation({
    mutationFn: (meetingId) => MeetingService.deleteMeeting(meetingId),
    onSuccess: () => {
      toast.success('Meeting deleted successfully');
      queryClient.invalidateQueries(['meetings']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete meeting');
    }
  });

  // Handle accept meeting
  const handleAcceptMeeting = (meetingId) => {
    updateStatusMutation.mutate({ meetingId, status: 'accepted' });
  };

  // Handle reject meeting
  const handleRejectMeeting = (meetingId) => {
    updateStatusMutation.mutate({ meetingId, status: 'rejected' });
  };

  // Handle delete meeting
  const handleDeleteMeeting = (meetingId) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      deleteMeetingMutation.mutate(meetingId);
    }
  };

  // Handle join meeting
  const handleJoinMeeting = async (meetingId) => {
    try {
      const response = await MeetingService.joinMeeting(meetingId);
      if (response.meetingUrl) {
        window.open(response.meetingUrl, '_blank');
      } else {
        toast.error('Unable to join meeting. No meeting URL provided.');
      }
    } catch (error) {
      toast.error('Failed to join meeting');
    }
  };

  // Get meeting type icon
  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <IconVideo size={16} className="text-blue-500" />;
      case 'audio':
        return <IconPhone size={16} className="text-green-500" />;
      case 'in-person':
        return <IconMapPin size={16} className="text-amber-500" />;
      default:
        return <IconCalendar size={16} className="text-primary" />;
    }
  };

  // Render meeting status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">Pending</span>;
      case 'accepted':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">Rejected</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Cancelled</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Completed</span>;
      default:
        return null;
    }
  };

  // Show meeting action buttons based on status
  const renderMeetingActions = (meeting) => {
    // For pending meetings that the current user needs to accept/reject
    if (meeting.status === 'pending' && meeting.isPendingForCurrentUser) {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAcceptMeeting(meeting._id)}
            disabled={updateStatusMutation.isPending}
            className="p-1.5 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
            title="Accept"
          >
            <IconCheck size={16} />
          </button>
          <button
            onClick={() => handleRejectMeeting(meeting._id)}
            disabled={updateStatusMutation.isPending}
            className="p-1.5 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
            title="Reject"
          >
            <IconX size={16} />
          </button>
        </div>
      );
    }

    // For accepted meetings that haven't happened yet
    if (meeting.status === 'accepted' && new Date(meeting.scheduledFor) > new Date()) {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleJoinMeeting(meeting._id)}
            className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
          >
            Join Meeting
          </button>
          <button
            onClick={() => handleDeleteMeeting(meeting._id)}
            disabled={deleteMeetingMutation.isPending}
            className="p-1.5 bg-accent text-muted-foreground rounded hover:bg-accent/80 transition-colors"
            title="Delete"
          >
            <IconTrash size={16} />
          </button>
        </div>
      );
    }

    // For past meetings
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleDeleteMeeting(meeting._id)}
          disabled={deleteMeetingMutation.isPending}
          className="p-1.5 bg-accent text-muted-foreground rounded hover:bg-accent/80 transition-colors"
          title="Delete"
        >
          <IconTrash size={16} />
        </button>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card border border-border/50 rounded-xl p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Your Meetings</h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-primary/10 text-primary'
                : 'bg-accent/50 text-foreground hover:bg-accent/80'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              activeTab === 'past'
                ? 'bg-primary/10 text-primary'
                : 'bg-accent/50 text-foreground hover:bg-accent/80'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meetings...</p>
        </div>
      ) : isError ? (
        <div className="py-8 text-center text-red-500">
          <p>Error fetching meetings: {error.message}</p>
          <button 
            className="mt-2 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
            onClick={() => queryClient.invalidateQueries(['meetings'])}
          >
            Try Again
          </button>
        </div>
      ) : data?.meetings?.length === 0 ? (
        <div className="py-8 text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCalendar size={32} className="text-primary" />
          </div>
          <p className="text-lg font-medium mb-2">No {activeTab} meetings</p>
          <p className="text-muted-foreground mb-4">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming meetings scheduled."
              : "You don't have any past meetings."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {data.meetings.map((meeting) => (
            <motion.div
              key={meeting._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-all bg-card"
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getMeetingTypeIcon(meeting.meetingType)}
                    <h3 className="font-medium">{meeting.title}</h3>
                    {renderStatusBadge(meeting.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {meeting.description || 'No description provided'}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-1">
                    <div className="flex items-center gap-1">
                      <IconCalendar size={14} />
                      <span>{formatDate(meeting.scheduledFor)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconClock size={14} />
                      <span>{formatTime(meeting.scheduledFor)} ({meeting.duration} min)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconUsers size={14} />
                      <span>{meeting.project?.title || 'Unknown Project'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 md:mt-0 flex justify-end">
                  {renderMeetingActions(meeting)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MeetingsList;