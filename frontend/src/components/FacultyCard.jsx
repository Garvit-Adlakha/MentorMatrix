import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { IconChevronDown, IconMail } from '@tabler/icons-react';

export const FacultyCard = ({ faculty }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-24 h-24 rounded-full ring-2 ring-primary ring-offset-2 overflow-hidden">
              {!imageError && faculty.image ? (
                <img 
                  src={faculty.image} 
                  alt={faculty.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                  {getInitials(faculty.name)}
                </div>
              )}
            </div>
          </motion.div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-xl font-semibold">{faculty.name}</h3>
            <p className="text-sm text-muted-foreground">{faculty.department}</p>
            <p className="text-sm font-medium text-primary">{faculty.specialization}</p>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent text-sm font-medium"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show less' : 'Learn more'}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <IconChevronDown size={16} />
              </motion.div>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 space-y-4"
            >
              <div>
                <h4 className="font-medium mb-2">Research Interests</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {faculty.researchInterests.map((interest, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {interest}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <Link 
                to={faculty.proposalFormLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-2"
                >
                  <IconMail size={18} />
                  Send Project Proposal
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FacultyCard;
