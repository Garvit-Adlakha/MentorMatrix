import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconCalendar, 
  IconUsers, 
  IconCircleCheck,
  IconBell, 
  IconAlertTriangle,
  IconArrowRight
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

const NotificationItem = ({ icon, iconBg, title, message, time }) => {
  return (
    <div className="bg-accent/20 hover:bg-accent/30 p-3 rounded-lg transition-colors cursor-pointer shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`p-2 ${iconBg} rounded-full`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">{title}</p>
          <p className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">{message}</p>
          <p className="text-xs text-primary/80 mt-2">{time}</p>
        </div>
      </div>
    </div>
  );
};

const DashboardSidebar = () => {
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
            <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Notifications</h3>
            <span className="h-5 w-5 flex items-center justify-center rounded-full bg-primary/90 text-white text-xs font-medium">
              3
            </span>
          </div>
          
          <div className="space-y-3">
            <NotificationItem 
              icon={<IconCircleCheck size={16} className="text-teal-600" />}
              iconBg="bg-teal-50"
              title="Project Approved"
              message='Your project proposal "AI Research" was approved by Prof. Johnson'
              time="2 hours ago"
            />
            
            <NotificationItem
              icon={<IconBell size={16} className="text-blue-600" />}
              iconBg="bg-blue-50" 
              title="New Comment"
              message={`Prof. Johnson commented on your proposal: "Great progress so far! Let's discuss the methodology in our next meeting."`}
              time="1 day ago"
            />
            
            <NotificationItem 
              icon={<IconAlertTriangle size={16} className="text-amber-600" />}
              iconBg="bg-amber-50"
              title="Deadline Approaching"
              message='Project milestone "Implementation Phase" is due in 3 days'
              time="2 days ago"
            />
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full mt-5 px-4 py-2.5 rounded-lg bg-card bg-gradient-to-r from-primary/10 to-transparent hover:from-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
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