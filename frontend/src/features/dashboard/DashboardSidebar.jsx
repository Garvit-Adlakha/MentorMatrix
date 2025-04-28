import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconCalendar, 
  IconUsers, 
  IconCircleCheck,
  IconBell, 
  IconAlertTriangle,
  IconArrowRight,
  IconCheck
} from '../../components/ui/Icons';

const UpcomingEvent = ({ color, icon, date, title }) => {
  return (
    <div className={`border-l-2 border-${color}/70 pl-4 py-2 hover:bg-accent/10 rounded-r-lg transition-colors`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <p className="font-medium text-sm break-words">{title}</p>
    </div>
  );
};

const NotificationItem = ({ icon, iconBg, title, message, time, isUnread = false }) => {
  return (
    <div className={`${isUnread ? 'bg-accent/30 hover:bg-accent/40 border-l-2 border-primary' : 'bg-accent/20 hover:bg-accent/30'} p-3 rounded-lg transition-colors cursor-pointer shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 ${iconBg} rounded-full relative`}>
          {icon}
          {isUnread && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${isUnread ? 'font-bold' : 'font-medium'} break-words`}>{title}</p>
          <p className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">{message}</p>
          <p className="text-xs text-primary/80 mt-2">{time}</p>
        </div>
      </div>
    </div>
  );
};

const DashboardSidebar = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: <IconCircleCheck size={16} className="text-teal-600" />,
      iconBg: "bg-teal-50",
      title: "Project Approved",
      message: 'Your project proposal "AI Research" was approved by Prof. Johnson',
      time: "2 hours ago",
      isUnread: true
    },
    {
      id: 2,
      icon: <IconBell size={16} className="text-blue-600" />,
      iconBg: "bg-blue-50",
      title: "New Comment",
      message: 'Prof. Johnson commented on your proposal: "Great progress so far! Let\'s discuss the methodology in our next meeting."',
      time: "1 day ago",
      isUnread: true
    },
    {
      id: 3,
      icon: <IconAlertTriangle size={16} className="text-amber-600" />,
      iconBg: "bg-amber-50",
      title: "Deadline Approaching",
      message: 'Project milestone "Implementation Phase" is due in 3 days',
      time: "2 days ago",
      isUnread: false
    }
  ]);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      isUnread: false
    })));
  };

  return (
    <div className="hidden lg:block">
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-card rounded-xl shadow-md sticky top-24"
      >
        {/* Upcoming Events Section */}
        <div className="p-6 border-b border-border/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Upcoming</h3>
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
              This Week
            </span>
          </div>
          
          <div className="space-y-4">
            <UpcomingEvent
              color="primary"
              icon={<IconCalendar size={14} className="text-primary" />}
              date="Tomorrow, 10:00 AM"
              title="Project Review Meeting"
            />
            
            <UpcomingEvent
              color="amber-500"
              icon={<IconCalendar size={14} className="text-amber-500" />}
              date="Friday, 2:30 PM"
              title="Deadline: Initial Proposal"
            />
            
            <UpcomingEvent
              color="blue-500"
              icon={<IconUsers size={14} className="text-blue-500" />}
              date="Saturday, 1:00 PM"
              title="Team Brainstorming Session"
            />
          </div>
        </div>
        
        {/* Notifications Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Notifications</h3>
              {unreadCount > 0 && (
                <span className="h-5 w-5 flex items-center justify-center rounded-full bg-primary/90 text-white text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                aria-label="Mark all notifications as read"
              >
                <IconCheck size={12} />
                Mark all read
              </button>
            )}
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-96 thin-scrollbar">
            {notifications.map(notification => (
              <NotificationItem 
                key={notification.id}
                icon={notification.icon}
                iconBg={notification.iconBg}
                title={notification.title}
                message={notification.message}
                time={notification.time}
                isUnread={notification.isUnread}
              />
            ))}
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full mt-5 px-4 py-2.5 rounded-lg bg-card bg-gradient-to-r from-primary/10 to-transparent hover:from-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30 focus:outline-none"
          >
            View All Notifications
            <IconArrowRight size={14} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardSidebar;