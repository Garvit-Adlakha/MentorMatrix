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
      className="overflow-auto rounded-xl shadow-xl backdrop-blur-2xl no-scrollbar"
    >
      <table className="w-full overflow-visible">
        <thead className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent text-foreground
          shadow-2xl rounded-t-xl backdrop-blur-xl
          text-center"
        >
          <tr>
            <th className="px-6 py-4 text-sm font-semibold text-left">{userRole === 'student' ? 'Faculty' : 'Student'}</th>
            <th className="px-6 py-4 text-sm font-semibold text-left">Title</th>
            <th className="px-6 py-4 text-sm font-semibold text-left">Submission Date</th>
            <th className="px-6 py-4 text-sm font-semibold text-left">Status</th>
            <th className="px-6 py-4 text-sm font-semibold text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-card">
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
      className="cursor-pointer text-sm text-muted-foreground
        hover:font-bold
        hover:shadow-2xl
        hover:border-0
        hover:bg-gradient-to-br
        from-primary/20 via-primary/5 to-transparent  
        hover:bg-opacity-50
        hover:rounded-2xl
        hover:backdrop-blur-xl
        relative
        transition-colors  border-b border-neutral-700 last:border-0 overflow-hidden"
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
        return 'bg-teal-50 text-teal-700';
      case 'rejected':
        return 'bg-rose-50 text-rose-700';
      case 'completed':
        return 'bg-blue-50 text-blue-700';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-700';
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