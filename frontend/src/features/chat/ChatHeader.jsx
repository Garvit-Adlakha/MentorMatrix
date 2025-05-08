import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { IconMenu, IconDots, IconUsers } from '../../components/ui/Icons';
import ParticipantsModal from './ParticipantsModal';

const ChatHeader = ({ activeChat, toggleSidebar, socketConnected }) => {
  const [showParticipants, setShowParticipants] = useState(false);

  const clickHandler = () => {
    setShowParticipants(!showParticipants);
  };

  return (
    <>
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 shadow-2xl rounded-2xl  bg-background/60 backdrop-blur-2xl flex items-center justify-between sticky top-0 z-10"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            aria-label="Open chat sidebar"
            className="md:hidden p-2 rounded-md hover:bg-accent/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <IconMenu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/10"
            >
              <span className="font-medium text-neutral-200 text-lg">
                {activeChat?.name?.substring(0, 2)?.toUpperCase() || 'GC'}
              </span>
            </motion.div>
            <div>
              <h3 className="font-medium text-lg bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 to-neutral-200/70">
                {activeChat?.name || 'Project Chat'}
              </h3>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-md hover:bg-accent/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
            onClick={clickHandler}
            aria-label="View participants"
          >
            <IconUsers className="w-5 h-5 text-foreground" />
          </motion.button>
        </div>
      </motion.div>

      <ParticipantsModal
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        participants={activeChat?.participants || []}
      />
    </>
  );
};

ChatHeader.propTypes = {
  activeChat: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    participants: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string,
        email: PropTypes.string,
      })
    ),
  }),
  toggleSidebar: PropTypes.func.isRequired,
  socketConnected: PropTypes.bool.isRequired,
};

export default ChatHeader;
