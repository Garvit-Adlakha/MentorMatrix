import React from 'react';
import { motion } from 'motion/react';
import { IconLayoutGrid, IconList, IconPlus } from '../../components/ui/Icons';

const DashboardHeader = ({userRole, viewMode, toggleViewMode, handleNewProposalForm }) => {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="dashboard-header"
    >
      <div>
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Manage your projects and proposals</p>
      </div>
      <div className="flex items-center gap-3">
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.3 }}
          className="dashboard-toggle"
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
          className="dashboard-cta"
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