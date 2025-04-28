import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import { IconMessage, IconCalendar, IconFiles, IconShare } from '../components/ui/Icons';
import MeetingScheduler from '../components/meetings/MeetingScheduler';
import MeetingsList from '../components/meetings/MeetingsList';
import FileSharing from '../components/ui/FileSharing';

const CollaborationPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['chat', 'meetings', 'files'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('overview');
    }
  }, [location.search]);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`?tab=${tab}`, { replace: true });
  };

  // Return to overview
  const handleBackToOverview = () => {
    setActiveTab('overview');
    setShowMeetingScheduler(false);
    navigate('', { replace: true });
  };

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
            navigate('/chat', { replace: true })
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
              <motion.div 
                onClick={() => handleTabChange('chat')}
                className="card p-6 hover:border-primary/40 hover:scale-105 bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 transition-all cursor-pointer group glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ 
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.25), 0 8px 10px -6px rgba(0,0,0,0.2)",
                  scale: 1.05
                }}
              >
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <IconMessage size={24} className="text-primary" />
                </div>
                <h4 className="text-lg font-medium mb-2 text-white">Project Chats</h4>
                <p className="text-sm text-slate-300">
                  Real-time messaging for quick communication with your team and mentors
                </p>
              </motion.div>
              
              <motion.div 
                onClick={() => handleTabChange('meetings')}
                className="card p-6 hover:border-primary/40 hover:scale-105 bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 transition-all cursor-pointer group glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ 
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.25), 0 8px 10px -6px rgba(0,0,0,0.2)",
                  scale: 1.05
                }}
              >
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <IconCalendar size={24} className="text-primary" />
                </div>
                <h4 className="text-lg font-medium mb-2 text-white">Schedule Meetings</h4>
                <p className="text-sm text-slate-300">
                  Schedule and join video meetings to discuss progress and ideas
                </p>
              </motion.div>
              
              <motion.div 
                onClick={() => handleTabChange('files')}
                className="card p-6 hover:border-primary/40 hover:scale-105 bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 transition-all cursor-pointer group glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ 
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.25), 0 8px 10px -6px rgba(0,0,0,0.2)",
                  scale: 1.05
                }}
              >
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <IconFiles size={24} className="text-primary" />
                </div>
                <h4 className="text-lg font-medium mb-2 text-white">Shared Files</h4>
                <p className="text-sm text-slate-300">
                  Share documents, presentations and other resources 
                </p>
              </motion.div>
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
      className="relative min-h-56 rounded-2xl w-[90vw] mx-auto shadow-2xl backdrop-blur-2xl flex flex-col justify-center items-center px-4 py-8 overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)',
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-60 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-2xl opacity-40 animate-pulse delay-2000" />
      </div>

      {/* Header Section */}
      <div className="flex flex-col items-center mb-8 z-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-primary/10 p-3 rounded-full">
            <IconShare className="text-primary" size={28} />
          </span>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Collaboration Hub</h1>
        </div>
        <p className="text-muted-foreground text-center max-w-2xl text-lg">All your project collaboration tools in one place. Chat, share files, and schedule meetings with your team and mentors.</p>
      </div>

      {/* Main Content (no navigation bar) */}
      <div className="w-full max-w-5xl z-10">
        {renderTabContent()}
      </div>
    </motion.div>
  );
};

const Collaboration=AppLayout()(CollaborationPage);
export default Collaboration;