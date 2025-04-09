import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import FacultyCard from './FacultyCard';

const FacultyCards = ({ mentors, searchTerm, isLoading }) => {
 
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="col-span-full flex flex-col items-center justify-center py-16 text-center"
      >
        <p className="text-xl text-muted-foreground mb-4">Loading mentors...</p>
        <motion.div
          className="w-16 h-1 bg-primary/50 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      </motion.div>
    );
  }

  const hasNoMentors = !mentors || mentors.length === 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min"
      >
        {!hasNoMentors ? (
          mentors.map((faculty) => (
            <motion.div
              key={faculty._id || faculty.id}
              variants={cardVariants}
              layout
              className="h-full"
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <FacultyCard faculty={faculty} />
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16 text-center"
          >
            <p className="text-xl text-muted-foreground mb-4">
              No mentors found {searchTerm ? `matching "${searchTerm}"` : ""}
            </p>
            <motion.div
              className="w-16 h-1 bg-primary/50 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default FacultyCards;
