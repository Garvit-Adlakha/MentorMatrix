import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSearch, IconX } from '@tabler/icons-react';
import FacultyCard from './FacultyCard';
import { facultyData } from '../data/facultyData';

const FacultyCards = () => {
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <section className="container mx-auto px-4 py-12">
      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md mx-auto m-12"
      >
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search faculty..."
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconX size={18} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Faculty Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={searchTerm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
        >
          {filteredFaculty.length > 0 ? (
            filteredFaculty.map((faculty, index) => (
              <motion.div
                key={faculty.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
              >
                <FacultyCard faculty={faculty} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <p className="text-lg text-muted-foreground">
                No faculty members found matching "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-primary hover:underline"
              >
                Clear search
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default FacultyCards;
