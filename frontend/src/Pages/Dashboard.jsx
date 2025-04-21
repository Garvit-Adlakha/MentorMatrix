import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import ProjectForm from '../components/ProjectForm';
import { useSuspenseQuery } from '@tanstack/react-query';
import ProjectService from '../service/ProjectService';
import authService from '../service/authService';
import ProjectCardModel from '../components/ui/ProjectCardModel';
import { AnimatePresence } from 'framer-motion';

// Import our new modular components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsCards from '../components/dashboard/StatsCards';
import SearchAndFilter from '../components/dashboard/SearchAndFilter';
import EmptyState from '../components/dashboard/EmptyState';
import ProjectTable from '../components/dashboard/ProjectTable';
import ProjectCards from '../components/dashboard/ProjectCards';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [showNewProposalForm, setShowNewProposalForm] = useState(false);
  const [projectModal, setProjectModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Get the current user data from React Query cache
  const { data: userData } = useSuspenseQuery({
    queryKey: ['user'],
    queryFn: () => authService.currentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const [userRole, setUserRole] = useState(userData?.user?.role || 'student');

  // Update userRole when userData changes
  useEffect(() => {
    if (userData?.user?.role) {
      setUserRole(userData.user.role);
    }
  }, [userData]);

  // Fetch projects based on user role
  const { data: projectsData, refetch } = useSuspenseQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectService.getAllProjects(),
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

  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'card' : 'table');
  };

  // Apply filters and search
  const filteredProposals = projects
    .filter(project => {
      if (statusFilter === 'all') return true;
      return project.status === statusFilter;
    })
    .filter(project =>
      searchTerm
        ? project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

  // Calculate statistics
  const totalProposals = projects.length;
  const acceptedProposals = projects.filter(p => p.status === 'approved').length;
  const pendingProposals = projects.filter(p => p.status === 'pending').length;
  const rejectedProposals = projects.filter(p => p.status === 'rejected').length;

  const handleViewDetails = (projectId) => {
    // Set the selected project ID and open the modal
    setSelectedProjectId(projectId);
    setProjectModal(true);
  };

  const handleNewProposalForm = () => {
    setShowNewProposalForm(!showNewProposalForm);
  };

  return (
    <div className="flex-grow container mx-auto px-4 py-6">
      {/* Header Section */}
      <DashboardHeader 
        viewMode={viewMode} 
        toggleViewMode={toggleViewMode} 
        handleNewProposalForm={handleNewProposalForm} 
      />

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          {/* Stats Section */}
          <StatsCards 
            totalProposals={totalProposals}
            acceptedProposals={acceptedProposals}
            pendingProposals={pendingProposals}
            rejectedProposals={rejectedProposals}
          />

          {/* Search and Filters */}
          <SearchAndFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          {/* Empty State */}
          {filteredProposals.length === 0 && (
            <EmptyState 
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              handleNewProposalForm={handleNewProposalForm}
            />
          )}

          {/* Project List - Table or Card View */}
          <AnimatePresence mode="wait">
            {filteredProposals.length > 0 && viewMode === 'table' && (
              <ProjectTable 
                proposals={filteredProposals}
                userRole={userRole}
                handleViewDetails={handleViewDetails}
              />
            )}

            {filteredProposals.length > 0 && viewMode === 'card' && (
              <ProjectCards 
                proposals={filteredProposals}
                userRole={userRole}
                handleViewDetails={handleViewDetails}
              />
            )}
          </AnimatePresence>
        </div>
        
        {/* Right Sidebar */}
        <DashboardSidebar />
      </div>

      {/* Modals */}
      {projectModal && (
        <ProjectCardModel 
          open={projectModal}
          onOpenChange={setProjectModal}
          projectId={selectedProjectId}
          onSuccess={() => {
            // Refresh data after modal submission
            refetch();
          }}
        />
      )}

      {showNewProposalForm && (
        <ProjectForm
          open={showNewProposalForm}
          onOpenChange={setShowNewProposalForm}
          onSuccess={() => {
            // Refresh data after form submission
            refetch();
          }}
        />
      )}
    </div>
  );
};

const DashboardWithLayout = AppLayout()(Dashboard);
export default DashboardWithLayout;