import { motion } from 'motion/react';
import { IconSearch, IconFilter } from '../ui/Icons';
import FacultyCards from './FacultyCards';  
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mentorService from '../../service/MentorService';

const Mentor = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Departments list
  const departments = [
    'Computer Science',
    'Information Technology',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Data Science',
    'Civil Engineering',
    'Mathematics',
    'Physics'
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 600);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const {data: mentorsData, isLoading} = useQuery({
    queryKey: ['mentors', debouncedSearchTerm],
    queryFn: () => mentorService.getAllMentors(debouncedSearchTerm),
    staleTime: 5*60*1000,
    refetchOnWindowFocus: false,
    retry: 1
  });
  
  // Filter mentors by department if needed
  const filteredMentors = selectedDepartment === 'all' 
    ? mentorsData?.mentors 
    : mentorsData?.mentors?.filter(mentor => 
        mentor.department?.toLowerCase().includes(selectedDepartment.toLowerCase())
      );

  return (
    <div className="mentor-page">
      <div className="mentor-bg">
        <div className="mentor-orb mentor-orb--one" />
        <div className="mentor-orb mentor-orb--two" />
        <div className="mentor-orb mentor-orb--three" />
        <div className="mentor-grid" />
      </div>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mentor-hero"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mentor-hero-content"
          >
            <h1 className="mentor-title">
              Find Your Perfect Project Mentor
            </h1>
            <p className="mentor-subtitle">
              Connect with experienced faculty members who can guide you through your academic journey
            </p>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <motion.div 
                className="mentor-search"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <IconSearch className="mentor-search-icon" />
                <input
                  type="text"
                  placeholder="Search by name, department, or research interest..."
                  className="mentor-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </motion.div>
              
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mentor-filter-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <IconFilter size={20} />
                <span className="font-medium">Filters</span>
                <span className={`w-2 h-2 rounded-full bg-primary transition-all duration-300 ${selectedDepartment !== 'all' ? 'opacity-100' : 'opacity-0'}`}></span>
              </motion.button>
            </div>

            {/* Department Filters */}
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: showFilters ? 'auto' : 0,
                opacity: showFilters ? 1 : 0
              }}
              className="overflow-hidden transition-all duration-300"
            >
              <div className="mentor-filter-panel">
                <h3 className="mentor-filter-title">Filter by Department:</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    key="all"
                    onClick={() => setSelectedDepartment('all')}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      selectedDepartment === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-accent/50 hover:bg-accent/80'
                    }`}
                  >
                    All Departments
                  </button>
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDepartment(dept)}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        selectedDepartment === dept
                          ? 'bg-primary text-white'
                          : 'bg-accent/50 hover:bg-accent/80'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Faculty Cards Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mentor-results"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="mentor-count">
              {filteredMentors?.length || 0} {filteredMentors?.length === 1 ? 'Mentor' : 'Mentors'} Available
            </h2>
            
            <div className="flex items-center gap-4">
              <select className="mentor-sort">
                <option value="relevance">Sort by: Relevance</option>
                <option value="name">Sort by: Name</option>
                <option value="department">Sort by: Department</option>
                <option value="expertise">Sort by: Expertise</option>
              </select>
            </div>
          </div>
          
          {/* Faculty Cards Grid */}
          <FacultyCards mentors={filteredMentors} isLoading={isLoading} searchTerm={debouncedSearchTerm} />
        </div>
      </motion.section>
    </div>
  );
};

export default Mentor;
