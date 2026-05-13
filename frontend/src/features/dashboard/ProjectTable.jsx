import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconCircleCheck, 
  IconCircleX, 
  IconCheck, 
  IconAlertTriangle 
} from '../../components/ui/Icons';

const ProjectTable = ({ proposals, userRole, handleViewDetails }) => {
  return (
    <motion.div 
      key="table-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="dashboard-table"
    >
      <table className="w-full overflow-visible">
        <thead className="dashboard-table-head">
          <tr>
            <th className="px-6 py-4 text-sm font-semibold text-left">{userRole === 'student' ? 'Faculty' : 'Student'}</th>
            <th className="px-6 py-4 text-sm font-semibold text-left">Title</th>
            <th className="px-6 py-4 text-sm font-semibold text-left">Submission Date</th>
            <th className="px-6 py-4 text-sm font-semibold text-left">Status</th>
            <th className="px-6 py-4 text-sm font-semibold text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="dashboard-table-body">
          {proposals.map((proposal, index) => (
            <ProjectTableRow 
              key={proposal.id}
              proposal={proposal}
              userRole={userRole}
              index={index}
              handleViewDetails={handleViewDetails}
            />
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

const ProjectTableRow = ({ proposal, userRole, index, handleViewDetails }) => {
  return (
    <motion.tr 
      key={proposal.id} 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02, 
        y: -2
      }}
      transition={{ 
        duration: 0.2, 
        delay: index * 0.04, 
        type: "spring", 
        stiffness: 120, 
        damping: 14 
      }}
      className="dashboard-table-row"
      style={{
        transformOrigin: "center",
        transform: "translateZ(0)", // Force GPU acceleration
      }}
      onClick={() => handleViewDetails(proposal.id)}
    >
      <td className="px-6 py-4 no-scrollbar">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">
              {userRole === 'student' ? proposal.facultyName.charAt(0) : proposal.studentName.charAt(0)}
            </span>
          </div>
          <span className="font-medium text-sm line-clamp-1 break-all">
            {userRole === 'student' ? proposal.facultyName : proposal.studentName}
          </span>
        </div>
      </td>
      <td className="px-6 py-4" style={{ maxWidth: '220px' }}>
        <div className="font-medium text-sm line-clamp-1 break-all">{proposal.title}</div>
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(proposal.createdAt).toLocaleDateString()}</td>
      <td className="px-6 py-4">
        <StatusBadge status={proposal.status} />
      </td>
      <td className="px-6 py-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium text-primary"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(proposal.id);
          }}
        >
          View Details
        </motion.button>
      </td>
    </motion.tr>
  );
};

const StatusBadge = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <IconCircleCheck className="w-3.5 h-3.5 flex-shrink-0" />;
      case 'rejected':
        return <IconCircleX className="w-3.5 h-3.5 flex-shrink-0" />;
      case 'completed':
        return <IconCheck className="w-3.5 h-3.5 flex-shrink-0" />;
      case 'pending':
      default:
        return <IconAlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />;
    }
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'approved':
        return 'bg-teal-400/15 text-teal-200 border border-teal-400/30';
      case 'rejected':
        return 'bg-rose-400/15 text-rose-200 border border-rose-400/30';
      case 'completed':
        return 'bg-sky-400/15 text-sky-200 border border-sky-400/30';
      case 'pending':
      default:
        return 'bg-amber-400/15 text-amber-200 border border-amber-400/30';
    }
  };

  return (
    <span className={`px-2.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${getStatusClasses()}`}>
      {getStatusIcon()}
      <span className="truncate">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </span>
  );
};

export default React.memo(ProjectTable);