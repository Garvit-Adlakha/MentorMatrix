import { motion } from 'framer-motion';
import { IconSearch, IconAdjustmentsHorizontal, IconFilter } from './ui/Icons';
import FacultyCards from './FacultyCards';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mentorService from '../service/MentorService';

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
    <div className="min-h-screen mt-4">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative pb-16"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Find Your Perfect Project Mentor
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Connect with experienced faculty members who can guide you through your academic journey
            </p>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <motion.div 
                className="relative flex-1 max-w-xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, department, or research interest..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </motion.div>
              
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors backdrop-blur-sm border border-primary/20 shadow-sm"
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
              <div className="bg-card/40 backdrop-blur-sm p-5 rounded-xl border border-border/50 mb-8 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by Department:</h3>
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
        className="py-8 bg-gradient-to-b from-background to-background/80"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">
              {filteredMentors?.length || 0} {filteredMentors?.length === 1 ? 'Mentor' : 'Mentors'} Available
            </h2>
            
            <div className="flex items-center gap-4">
              <select className="px-4 py-2 rounded-lg border border-border bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
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
