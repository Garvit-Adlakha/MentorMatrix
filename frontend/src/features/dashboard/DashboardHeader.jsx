import React from 'react';
import { motion } from 'motion/react';
import { IconLayoutGrid, IconList, IconPlus } from '../../components/ui/Icons';

const DashboardHeader = ({userRole, viewMode, toggleViewMode, handleNewProposalForm }) => {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your projects and proposals</p>
      </div>
      <div className="flex items-center gap-3">
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.3 }}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent/50 to-accent/30 border border-accent/20 backdrop-blur-sm flex items-center gap-2 text-sm font-medium shadow-sm"
          onClick={toggleViewMode}
        >
          {viewMode === 'table' ? (
            <><IconLayoutGrid size={16} /> Card View</>
          ) : (
            <><IconList size={16} /> Table View</>
          )}
        </motion.button>
        { userRole === 'student' &&
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm font-medium" 
          onClick={handleNewProposalForm}
        >
          <IconPlus size={16} />
          New Proposal
        </motion.button>
}
      </div>
    </motion.div>
  );
};

export default React.memo(DashboardHeader);