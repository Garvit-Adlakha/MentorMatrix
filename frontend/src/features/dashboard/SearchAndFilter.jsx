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
      className="dashboard-filter"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="dashboard-search">
          <div className="dashboard-search-icon">
            <IconSearch size={16} className="text-muted-foreground" />
          </div>
          <input
            type="search"
            className="dashboard-search-input"
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
            className="dashboard-filter-btn"
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
            <div className="dashboard-filter-panel">
              <p className="dashboard-filter-label">Filter by status:</p>
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

export default React.memo(SearchAndFilter);