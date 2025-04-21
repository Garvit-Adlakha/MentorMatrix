import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconCircleCheck, 
  IconCircleX, 
  IconCheck, 
  IconAlertTriangle,
  IconArrowRight 
} from '../../components/ui/Icons';

const ProjectCards = ({ proposals, userRole, handleViewDetails }) => {
  return (
    <motion.div 
      key="card-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {proposals.map((proposal, index) => (
        <ProjectCard 
          key={proposal.id}
          proposal={proposal}
          userRole={userRole}
          index={index}
          handleViewDetails={handleViewDetails}
        />
      ))}
    </motion.div>
  );
};

const ProjectCard = ({ proposal, userRole, index, handleViewDetails }) => {
  const getStatusColor = () => {
    switch (proposal.status) {
      case 'approved':
        return 'bg-teal-500';
      case 'rejected':
        return 'bg-rose-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-amber-500';
    }
  };

  const getStatusBadgeClasses = () => {
    switch (proposal.status) {
      case 'approved':
        return 'bg-teal-50 text-teal-700';
      case 'rejected':
        return 'bg-rose-50 text-rose-700';
      case 'completed':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-amber-50 text-amber-700';
    }
  };

  const getStatusIcon = () => {
    switch (proposal.status) {
      case 'approved':
        return <IconCircleCheck className="w-3.5 h-3.5 flex-shrink-0" />;
      case 'rejected':
        return <IconCircleX className="w-3.5 h-3.5 flex-shrink-0" />;
      case 'completed':
        return <IconCheck className="w-3.5 h-3.5 flex-shrink-0" />;
      default:
        return <IconAlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)" }}
      className="bg-gradient-to-br from-card to-background/60 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden border border-primary/10"
      onClick={() => handleViewDetails(proposal.id)}
    >
      {/* Colored top bar based on status */}
      <div className={`h-1.5 w-full absolute top-0 left-0 ${getStatusColor()}`}></div>
      
      {/* Status badge positioned at top right */}
      <div className="absolute top-3 right-3 z-10">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1.5
          ${getStatusBadgeClasses()}`}
        >
          {getStatusIcon()}
          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
        </span>
      </div>
      
      <div className="p-6 pt-8">
        <h2 className="text-xl font-medium mb-4 break-words line-clamp-2">
          {proposal.title}
        </h2>
        
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <span className="font-medium">
              {userRole === 'student' ? proposal.facultyName.charAt(0) : proposal.studentName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium break-words line-clamp-1">
              {userRole === 'student' ? 'Faculty: ' : 'Student: '}
              {userRole === 'student' ? proposal.facultyName : proposal.studentName}
            </p>
            <p className="text-xs text-muted-foreground">
              Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6 break-words line-clamp-3">{proposal.description}</p>
        
        <div className="mt-auto pt-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary/90 to-primary/70 text-white shadow-sm hover:shadow-md transition-all duration-300 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(proposal.id);
            }}
          >
            View Details
            <IconArrowRight size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCards;