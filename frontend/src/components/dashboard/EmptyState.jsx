import React from 'react';
import { motion } from 'framer-motion';
import { IconFolder, IconPlus } from '../../components/ui/Icons';

const EmptyState = ({ searchTerm, statusFilter, handleNewProposalForm }) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card rounded-xl p-8 text-center shadow-md"
    >
      <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <IconFolder size={32} className="text-primary" />
      </div>
      <h3 className="mt-2 text-lg font-medium">No projects found</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto break-words">
        {searchTerm || statusFilter !== 'all' 
          ? "No projects match your search criteria. Try adjusting your filters or search terms." 
          : "Create a new project to get started with your academic journey."
        }
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="mt-6 px-5 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm font-medium mx-auto"
        onClick={handleNewProposalForm}
      >
        <IconPlus size={16} />
        Create Project
      </motion.button>
    </motion.div>
  );
};

export default EmptyState;