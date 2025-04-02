import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import FacultyCard from './FacultyCard';
import { facultyData } from '../data/facultyData';

const FacultyCards = ({ searchTerm = '' }) => {
  const filteredFaculty = useMemo(() => 
    facultyData.filter(faculty => {
      const searchLower = searchTerm.toLowerCase();
      return (
        faculty.name.toLowerCase().includes(searchLower) ||
        faculty.department.toLowerCase().includes(searchLower) ||
        faculty.specialization.toLowerCase().includes(searchLower) ||
        faculty.researchInterests.some(interest => 
          interest.toLowerCase().includes(searchLower)
        )
      );
    }), [searchTerm]
  );

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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min"
      >
        {filteredFaculty.length > 0 ? (
          filteredFaculty.map((faculty) => (
            <motion.div
              key={faculty.id}
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
              No faculty members found matching "{searchTerm}"
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
