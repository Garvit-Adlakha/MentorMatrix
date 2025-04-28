import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import DashboardHeader from '../features/dashboard/DashboardHeader';
import DashboardSidebar from '../features/dashboard/DashboardSidebar';
import ProjectCards from '../features/dashboard/ProjectCards';
import ProjectTable from '../features/dashboard/ProjectTable';
import ProjectForm from '../components/ProjectForm';
import SearchAndFilter from '../features/dashboard/SearchAndFilter';
import StatsCards from '../features/dashboard/StatsCards';
import EmptyState from '../features/dashboard/EmptyState';
import ProjectService from '../service/ProjectService';
import authService from '../service/authService';

const Dashboard = () => {
  const [viewMode, setViewMode] = React.useState('card');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [showFilters, setShowFilters] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);

  const navigate = useNavigate();

  const {data:user}=useQuery({
    queryKey: ['user'],
    queryFn:()=>authService.currentUser(),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 1,

  })


  const { data: projectsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: ProjectService.getAllProjects,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Format projects for display (handle different API response structures)
  const projects = React.useMemo(() => {
    if (!projectsData) return [];

    // Handle different API response formats
    const projectsList = projectsData.projects || [];

    return projectsList.map(project => ({
      id: project._id,
      studentId: project.createdBy?._id,
      facultyId: project.assignedMentor?._id,
      studentName: project.createdBy?.name || 'Unknown Student',
      facultyName: project.assignedMentor?.name || 'Unassigned',
      title: project.title,
      description: typeof project.description === 'object'
        ? project.description.abstract || 'No description'
        : project.description || 'No description',
      status: project.status || 'pending',
      createdAt: project.createdAt,
    }));
  }, [projectsData]);


  const totalProposals= projects.length;
  const acceptedProposals = projects.filter(p => p.status === 'approved').length;
  const pendingProposals = projects.filter(p => p.status === 'pending').length;
  const rejectedProposals = projects.filter(p => p.status === 'rejected').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;





  const toggleViewMode = () => {
    setViewMode(prev => prev === 'card' ? 'table' : 'card');
  };

  const handleNewProposalForm = () => {
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    refetch();
    setFormOpen(false);
  };




  const handleViewDetails = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // Filter projects based on search term and status
  const filteredProjects = React.useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const userRole = user?.role || 'student';
  
  return (
    <div className="container mx-auto px-4 py-8 ">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-9 space-y-6"
        >
          {/* Dashboard Header */}
          <DashboardHeader 
            userRole={userRole}
            viewMode={viewMode} 
            toggleViewMode={toggleViewMode} 
            handleNewProposalForm={handleNewProposalForm} 
          />
          
          {/* Search & Filter */}
          <SearchAndFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
          
          {/* Stats Cards */}
          <StatsCards
              userRole={userRole}
              totalProposals={totalProposals}
              acceptedProposals={acceptedProposals}
              pendingProposals={pendingProposals}
              rejectedProposals={rejectedProposals}
          />
          
          {/* Projects Section */}
          <div className=" backdrop-blur-xl  rounded-xl p-6 shadow-xl inset-0 ">
            <h2 className="text-xl font-semibold mb-4 text-foreground text-center">Projects</h2>
            
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center py-12"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 border-primary rounded-full animate-spin mb-3"></div>
                    <p className="text-muted-foreground">Loading projects...</p>
                  </div>
                </motion.div>
              ) : isError ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-destructive/10 text-destructive rounded-lg p-4 text-center"
                >
                  <p>Failed to load projects. Please try again later.</p>
                </motion.div>
              ) : filteredProjects.length === 0 ? (
                <EmptyState 
                  message={
                    projects.length === 0 
                      ? "You haven't created any projects yet." 
                      : "No projects match the selected filters."
                  }
                  action={projects.length === 0 ? handleNewProposalForm : null}
                  actionText={projects.length === 0 ? "Create your first project" : null}
                />
              ) : (
                viewMode === 'card' ? (
                  <ProjectCards 
                    proposals={filteredProjects} 
                    userRole={userRole}
                    handleViewDetails={handleViewDetails} 
                  />
                ) : (
                  <ProjectTable 
                    proposals={filteredProjects} 
                    userRole={userRole}
                    handleViewDetails={handleViewDetails} 
                  />
                )
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <DashboardSidebar />
        </div>
      </div>
      
      {/* Project Form Modal */}
      <ProjectForm 
        open={formOpen} 
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default AppLayout()(Dashboard);