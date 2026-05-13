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
  IconTrash,
  IconArrowLeft
} from '../ui/Icons';
import { useNavigate } from 'react-router-dom';

const MeetingsList = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query to fetch meetings
  const { data:meetingData, isLoading, isError, error } = useQuery({
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
    navigate(`/meetings/${meetingId}`);
  };

  if(isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

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
        return <span className="meeting-badge meeting-badge--pending">Pending</span>;
      case 'accepted':
        return <span className="meeting-badge meeting-badge--accepted">Accepted</span>;
      case 'rejected':
        return <span className="meeting-badge meeting-badge--rejected">Rejected</span>;
      case 'cancelled':
        return <span className="meeting-badge meeting-badge--cancelled">Cancelled</span>;
      case 'completed':
        return <span className="meeting-badge meeting-badge--completed">Completed</span>;
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
            className="meeting-action meeting-action--accept"
            title="Accept"
          >
            <IconCheck size={16} />
          </button>
          <button
            onClick={() => handleRejectMeeting(meeting._id)}
            disabled={updateStatusMutation.isPending}
            className="meeting-action meeting-action--reject"
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
            className="meeting-join"
          >
            Join Meeting
          </button>
          <button
            onClick={() => handleDeleteMeeting(meeting._id)}
            disabled={deleteMeetingMutation.isPending}
            className="meeting-action meeting-action--delete"
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
          className="meeting-action meeting-action--delete"
          title="Delete"
        >
          <IconTrash size={16} />
        </button>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="meeting-list"
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate('/collaborate')}
        className="meeting-back-btn"
      >
        <IconArrowLeft size={18} />
        Go Back
      </motion.button>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
        className="meeting-list-header"
      >
        <h2 className="meeting-list-title">Your Meetings</h2>
        <div className="meeting-tabs">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab('upcoming')}
            className={`meeting-tab ${activeTab === 'upcoming' ? 'meeting-tab--active' : ''}`}
          >
            Upcoming
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab('past')}
            className={`meeting-tab ${activeTab === 'past' ? 'meeting-tab--active' : ''}`}
          >
            Past
          </motion.button>
        </div>
      </motion.div>

      {isError ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="meeting-list-error"
        >
          <p>Error fetching meetings: {error.message}</p>
          <button 
            className="meeting-secondary-btn"
            onClick={() => queryClient.invalidateQueries(['meetings'])}
          >
            Try Again
          </button>
        </motion.div>
      ) : meetingData?.meetings?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="meeting-list-empty"
        >
          <div className="meeting-empty-icon">
            <IconCalendar size={40} className="text-blue-400" />
          </div>
          <p className="meeting-empty-title">No {activeTab} meetings</p>
          <p className="meeting-empty-text">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming meetings scheduled."
              : "You don't have any past meetings."}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 gap-6"
        >
          {meetingData.meetings.map((meeting, idx) => (
            <motion.div
              key={meeting.id || meeting._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5, ease: 'easeOut' }}
              className="meeting-card"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getMeetingTypeIcon(meeting.meetingType)}
                    <h3 className="font-semibold text-lg text-white drop-shadow-sm">{meeting.title}</h3>
                    {renderStatusBadge(meeting.status)}
                  </div>
                  <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
                    {meeting.description || 'No description provided'}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-400 mb-1">
                    <div className="flex items-center gap-1">
                      <IconCalendar size={14} />
                      <span>{formatDate(meeting.scheduledFor || meeting.startTime || meeting.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconClock size={14} />
                      <span>{formatTime(meeting.scheduledFor || meeting.startTime || meeting.createdAt)} ({meeting.durationMinutes || meeting.duration || 30} min)</span>
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-1">
                        <IconMapPin size={14} />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                    {meeting.project?.title && (
                      <div className="flex items-center gap-1">
                        <IconUsers size={14} />
                        <span>{meeting.project.title}</span>
                      </div>
                    )}
                  </div>
                  {meeting.meetingLink && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleJoinMeeting(meeting._id)}
                        className="inline-flex items-center px-3 py-1 text-xs bg-blue-600/20 text-blue-300 rounded hover:underline gap-1 shadow"
                      >
                        <IconVideo size={14} />
                        Join Meeting
                      </button>
                    </div>
                  )}
                  {meeting.meetingNotes && meeting.meetingNotes.trim() !== '' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-3 p-3 bg-zinc-800/80 rounded text-xs text-zinc-300 shadow-inner"
                    >
                      <span className="font-semibold text-blue-300">Notes:</span> {meeting.meetingNotes}
                    </motion.div>
                  )}
                </div>
                <div className="mt-2 md:mt-0 flex flex-col items-end justify-between gap-3 min-w-[120px]">
                  {renderMeetingActions(meeting)}
                  {meeting.endTime && (
                    <span className="text-xs text-zinc-500 mt-2">Ends: {formatTime(meeting.endTime)}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default MeetingsList;