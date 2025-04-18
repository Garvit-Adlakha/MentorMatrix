import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import { IconMessage, IconCalendar, IconFiles } from '../components/ui/Icons';
import MeetingScheduler from '../components/meetings/MeetingScheduler';
import MeetingsList from '../components/meetings/MeetingsList';
import FileSharing from '../components/ui/FileSharing';
import ProjectChatList from '../components/chat/projects/ProjectChatList';

const CollaborationPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const location = useLocation();

  // Check for tab query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam && ['chat', 'meetings', 'files'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="mt-6">
            <h3 className="text-xl font-medium mb-4">Project Chats</h3>
            <p className="text-muted-foreground mb-4">
              Connect with your team and mentors through real-time chat for each of your projects.
            </p>
            <ProjectChatList />
          </div>
        );
      case 'meetings':
        return (
          <div className="mt-6 space-y-6">
            {showMeetingScheduler ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <MeetingScheduler />
                </motion.div>
                <motion.div 
                  className="flex justify-center mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    onClick={() => setShowMeetingScheduler(false)}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all shadow-sm hover:shadow flex items-center gap-2"
                  >
                    <span>View Your Meetings</span>
                  </button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div 
                  className="flex justify-end"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={() => setShowMeetingScheduler(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <IconCalendar size={16} />
                    <span>Schedule Meeting</span>
                  </button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <MeetingsList />
                </motion.div>
              </>
            )}
          </div>
        );
      case 'files':
        return (
          <div className="mt-6">
            <motion.h3 
              className="text-xl font-medium mb-4"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              Project Files
            </motion.h3>
            <motion.p 
              className="text-muted-foreground mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Access and share documents, presentations, and other files with your team.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <FileSharing />
            </motion.div>
          </div>
        );
      default:
        return (
          <div className="mt-6">
            <p className="text-neutral-300 mb-6 text-center italic">
              Use these tools to effectively collaborate with your mentors and team members
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => setActiveTab('chat')}
                className="card p-6 hover:border-primary/30 hover:scale-110 shadow-2xl backdrop-blur-2xl rounded-3xl  transition-all cursor-pointer"

              >
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <IconMessage size={24} className="text-primary" />
                </div>
                <h4 className="text-lg font-medium mb-2">Project Chats</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time messaging for quick communication with your team and mentors
                </p>
              </div>
              
              <div 
                onClick={() => setActiveTab('meetings')}
                className="card p-6 hover:border-primary/30 hover:scale-110 shadow-2xl backdrop-blur-2xl rounded-3xl  transition-all cursor-pointer"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <IconCalendar size={24} className="text-primary" />
                </div>
                <h4 className="text-lg font-medium mb-2">Schedule Meetings</h4>
                <p className="text-sm text-muted-foreground">
                  Schedule and join video meetings to discuss progress and ideas
                </p>
              </div>
              
              <div 
                onClick={() => setActiveTab('files')}
                className="card p-6 hover:border-primary/30 hover:scale-110 shadow-2xl backdrop-blur-2xl rounded-3xl  transition-all cursor-pointer"

              >
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <IconFiles size={24} className="text-primary" />
                </div>
                <h4 className="text-lg font-medium mb-2">Shared Files</h4>
                <p className="text-sm text-muted-foreground">
                  Share documents, presentations and other resources 
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.div 
        {...fadeInUp} 
        className="card bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl p-6 shadow-xl backdrop-blur-sm"
        whileHover={{ boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)" }}
        transition={{ duration: 0.4 }}
      >
        <motion.div 
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Collaboration Hub
          </motion.h2>
          
          {activeTab !== 'overview' && (
            <motion.button 
              onClick={() => {
                setActiveTab('overview');
                setShowMeetingScheduler(false);
              }}
              className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Back to Overview
            </motion.button>
          )}
        </motion.div>
        
        {/* Tab navigation - only show when not in overview */}
        {activeTab !== 'overview' && (
          <motion.div 
            className="flex overflow-x-auto scrollbar-hide pb-2 mb-6 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <motion.button 
              onClick={() => setActiveTab('chat')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 shadow-sm
                ${activeTab === 'chat' 
                  ? 'bg-primary text-white scale-105' 
                  : 'bg-accent/50 hover:bg-accent/80'}`}
              whileHover={{ scale: activeTab === 'chat' ? 1.02 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <IconMessage size={18} />
              <span>Chats</span>
            </motion.button>
            
            <motion.button 
              onClick={() => {
                setActiveTab('meetings');
                setShowMeetingScheduler(false);
              }}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 shadow-sm
                ${activeTab === 'meetings' 
                  ? 'bg-primary text-white scale-105' 
                  : 'bg-accent/50 hover:bg-accent/80'}`}
              whileHover={{ scale: activeTab === 'meetings' ? 1.02 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <IconCalendar size={18} />
              <span>Meetings</span>
            </motion.button>
            
            <motion.button 
              onClick={() => setActiveTab('files')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 shadow-sm
                ${activeTab === 'files' 
                  ? 'bg-primary text-white scale-105' 
                  : 'bg-accent/50 hover:bg-accent/80'}`}
              whileHover={{ scale: activeTab === 'files' ? 1.02 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <IconFiles size={18} />
              <span>Files</span>
            </motion.button>
          </motion.div>
        )}

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`${activeTab !== 'overview' ? 'bg-white/5 backdrop-blur-sm rounded-lg p-5 shadow-inner' : ''}`}
        >
          {renderTabContent()}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const Collaboration=AppLayout()(CollaborationPage);
export default Collaboration;