import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSearch, IconFilter } from '../../components/ui/Icons';

const SearchAndFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  showFilters, 
  setShowFilters, 
  statusFilter, 
  setStatusFilter 
}) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-6"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <IconSearch size={16} className="text-muted-foreground" />
          </div>
          <input
            type="search"
            className="w-full px-4 py-2.5 pl-10 rounded-lg bg-gradient-to-br from-card to-background/60 border border-primary/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all shadow-sm"
            placeholder="Search proposals by title, faculty, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 border border-primary/30 backdrop-blur-sm transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <IconFilter size={16} className="text-primary" />
            Filter
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-card to-background/60 border border-primary/10 backdrop-blur-sm shadow-md">
              <p className="text-xs font-medium text-primary mb-3">Filter by status:</p>
              <div className="flex flex-wrap gap-2">
                <FilterButton 
                  label="All" 
                  active={statusFilter === 'all'} 
                  onClick={() => setStatusFilter('all')} 
                  color="primary"
                />
                <FilterButton 
                  label="Approved" 
                  active={statusFilter === 'approved'} 
                  onClick={() => setStatusFilter('approved')} 
                  color="teal"
                />
                <FilterButton 
                  label="Pending" 
                  active={statusFilter === 'pending'} 
                  onClick={() => setStatusFilter('pending')} 
                  color="amber"
                />
                <FilterButton 
                  label="Rejected" 
                  active={statusFilter === 'rejected'} 
                  onClick={() => setStatusFilter('rejected')} 
                  color="rose"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FilterButton = ({ label, active, onClick, color }) => {
  const colorClasses = {
    primary: {
      active: 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md',
      inactive: 'bg-accent/50 text-foreground hover:bg-accent/80'
    },
    teal: {
      active: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md',
      inactive: 'bg-teal-500/10 text-teal-500 hover:bg-teal-500/20'
    },
    amber: {
      active: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md',
      inactive: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
    },
    rose: {
      active: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md',
      inactive: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
    }
  };

  const classes = colorClasses[color] || colorClasses.primary;

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
        active ? classes.active : classes.inactive
      }`}
    >
      {label}
    </button>
  );
};

export default SearchAndFilter;