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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-gradient-to-br from-[#18181b] to-[#23272f] rounded-2xl p-8 shadow-xl backdrop-blur-xl border-none"
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate('/collaborate')}
        className="flex items-center gap-2 mb-6 px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-700 transition-all shadow"
      >
        <IconArrowLeft size={18} />
        Go Back
      </motion.button>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow">Your Meetings</h2>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-base font-semibold rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background
              ${activeTab === 'upcoming'
                ? 'bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}
          >
            Upcoming
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 text-base font-semibold rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background
              ${activeTab === 'past'
                ? 'bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}
          >
            Past
          </motion.button>
        </div>
      </motion.div>

      {isError ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center text-red-400"
        >
          <p>Error fetching meetings: {error.message}</p>
          <button 
            className="mt-4 px-5 py-2 bg-zinc-700 text-white rounded-lg hover:bg-red-500/80 transition-colors shadow"
            onClick={() => queryClient.invalidateQueries(['meetings'])}
          >
            Try Again
          </button>
        </motion.div>
      ) : meetingData?.meetings?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center"
        >
          <div className="bg-blue-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <IconCalendar size={40} className="text-blue-400" />
          </div>
          <p className="text-xl font-semibold text-white mb-2">No {activeTab} meetings</p>
          <p className="text-zinc-400 mb-4">
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
              className="rounded-xl p-6 bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 shadow-lg hover:shadow-2xl hover:scale-[1.015] transition-all border-none ring-1 ring-zinc-700/40"
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