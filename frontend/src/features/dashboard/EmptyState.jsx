import React from 'react';
import { motion } from 'framer-motion';
import { IconFolder, IconPlus } from '../../components/ui/Icons';

const EmptyState = ({ searchTerm, statusFilter, handleNewProposalForm }) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="dashboard-empty"
    >
      <div className="dashboard-empty-icon">
        <IconFolder size={32} className="text-primary" />
      </div>
      <h3 className="dashboard-empty-title">No projects found</h3>
      <p className="dashboard-empty-text">
        {searchTerm || statusFilter !== 'all' 
          ? "No projects match your search criteria. Try adjusting your filters or search terms." 
          : "Create a new project to get started with your academic journey."
        }
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="dashboard-empty-action"
        onClick={handleNewProposalForm}
      >
        <IconPlus size={16} />
        Create Project
      </motion.button>
    </motion.div>
  );
};

export default EmptyState;