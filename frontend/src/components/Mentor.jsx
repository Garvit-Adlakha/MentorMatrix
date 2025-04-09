import { motion } from 'motion/react';
import { IconSearch, IconAdjustmentsHorizontal, IconAlertCircle } from '../components/ui/Icons';
import FacultyCards from './FacultyCards';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mentorService from '../service/MentorService';

const Mentor = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(()=>{
    const handler=setTimeout(()=>{
      setDebouncedSearchTerm(searchTerm)
    },600)

    return () => {
      clearTimeout(handler)
    }
  },[searchTerm])

  const {data:mentorsData, isLoading, error, isError} = useQuery({
    queryKey:['mentors', debouncedSearchTerm],
    queryFn:() => mentorService.getAllMentors(debouncedSearchTerm),
    staleTime: 5*60*1000,
    refetchOnWindowFocus: false,
    retry: 1
  });
  
  if(isError){
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <IconAlertCircle size={48} className="text-destructive" />
        <p className="text-xl text-destructive">Error loading mentors</p>
        <p className="text-muted-foreground">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-background/80 ">
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
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
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border  backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </motion.div>
              
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary-foreground transition-colors"
              >
                <IconAdjustmentsHorizontal size={20} />
                <span>Filters</span>
              </motion.button>
            </div>

            {/* Quick Filter Tags */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-2"
            >
              {['Computer Science', 'Data Science', 'Electrical', 'Mechanical', 'Information Technology'].map((tag, index) => (
                <button
                  key={tag}
                  className="px-4 py-2 rounded-full text-sm bg-background/50 hover:bg-primary/10 border border-border backdrop-blur-sm transition-colors"
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Faculty Cards Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="py-12 bg-background"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Available Mentors</h2>
            <div className="flex items-center gap-4">
              <select className="px-4 py-2 rounded-lg border border-border bg-background">
                <option>Sort by: Relevance</option>
                <option>Sort by: Name</option>
                <option>Sort by: Department</option>
              </select>
            </div>
          </div>
          
          {/* Faculty Cards Grid */}
          <FacultyCards mentors={mentorsData?.mentors} isLoading={isLoading} searchTerm={debouncedSearchTerm} />
        </div>
      </motion.section>
    </div>
  );
};

export default Mentor;
