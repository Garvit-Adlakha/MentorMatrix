import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '../../components/ui/Icons';

const ParticipantsModal = ({ isOpen, onClose, participants = [] }) => {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-background/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Participants</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-accent/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Close modal"
            >
              <IconX className="w-5 h-5 text-foreground" />
            </button>
          </div>
          
          <div className="space-y-4">
            {participants.length > 0 ? (
              participants.map((participant) => (
                <div
                  key={participant._id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-medium text-neutral-200">
                      {participant.name?.substring(0, 2)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{participant.name}</p>
                    <p className="text-sm text-foreground/60">{participant.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-foreground/60">No participants found</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.getElementById('portal-root')
  );
};

ParticipantsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      email: PropTypes.string,
    })
  ),
};

export default ParticipantsModal;