import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import ProjectForm from '../components/ProjectForm';
import { useSuspenseQuery } from '@tanstack/react-query';
import ProjectService from '../service/ProjectService';
import authService from '../service/authService';
import ProjectCardModel from '../components/ui/ProjectCardModel';
import CollaborationWidget from '../components/ui/CollaborationWidget';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconSearch,
  IconFolder,
  IconCircleCheck,
  IconCircleX,
  IconCheck,
  IconAlertTriangle,
  IconPlus,
  IconLayoutGrid,
  IconList,
  IconFilter,
  IconFileText,
  IconBell,
  IconCalendar,
  IconUsers,
  IconArrowRight,
} from '../components/ui/Icons';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
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
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-grow container mx-auto px-4 py-6"
    >
      {/* Header Section */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your projects and proposals</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent/50 to-accent/30 hover:from-accent/70 hover:to-accent/50 border border-accent/20 backdrop-blur-sm transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-sm"
            onClick={toggleViewMode}
          >
            {viewMode === 'table' ? (
              <><IconLayoutGrid size={16} /> Card View</>
            ) : (
              <><IconList size={16} /> Table View</>
            )}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm font-medium" 
            onClick={handleNewProposalForm}
          >
            <IconPlus size={16} />
            New Proposal
          </motion.button>
        </div>
      </motion.div>

      {/* Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          {/* Stats Section */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {/* Total Proposals Stat Card */}
            <motion.div 
              whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              className="bg-gradient-to-br from-card to-background/60 backdrop-blur-sm rounded-xl shadow-md relative overflow-hidden border border-primary/10"
            >
              <div className="absolute top-0 left-0 h-full w-1.5 bg-primary/90"></div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Total Proposals</div>
                  <div className="p-2 bg-primary/10 rounded-md">
                    <IconFileText size={16} className="text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold">{totalProposals}</div>
              </div>
            </motion.div>
            
            {/* Approved Stat Card */}
            <motion.div 
              whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              className="bg-gradient-to-br from-card to-background/60 backdrop-blur-sm rounded-xl shadow-md relative overflow-hidden border border-teal-500/10"
            >
              <div className="absolute top-0 left-0 h-full w-1.5 bg-teal-500"></div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Approved</div>
                  <div className="p-2 bg-teal-50 rounded-md">
                    <IconCircleCheck size={16} className="text-teal-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-teal-600">{acceptedProposals}</div>
              </div>
            </motion.div>
            
            {/* Pending Stat Card */}
            <motion.div 
              whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              className="bg-gradient-to-br from-card to-background/60 backdrop-blur-sm rounded-xl shadow-md relative overflow-hidden border border-amber-500/10"
            >
              <div className="absolute top-0 left-0 h-full w-1.5 bg-amber-500"></div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Pending</div>
                  <div className="p-2 bg-amber-50 rounded-md">
                    <IconAlertTriangle size={16} className="text-amber-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-600">{pendingProposals}</div>
              </div>
            </motion.div>
            
            {/* Rejected Stat Card */}
            <motion.div 
              whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              className="bg-gradient-to-br from-card to-background/60 backdrop-blur-sm rounded-xl shadow-md relative overflow-hidden border border-rose-500/10"
            >
              <div className="absolute top-0 left-0 h-full w-1.5 bg-rose-500"></div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Rejected</div>
                  <div className="p-2 bg-rose-50 rounded-md">
                    <IconCircleX size={16} className="text-rose-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-rose-600">{rejectedProposals}</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Search Bar and Filters */}
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

            {/* Filter options */}
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
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                          statusFilter === 'all'
                            ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md'
                            : 'bg-accent/50 text-foreground hover:bg-accent/80'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setStatusFilter('approved')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                          statusFilter === 'approved'
                            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                            : 'bg-teal-500/10 text-teal-500 hover:bg-teal-500/20'
                        }`}
                      >
                        Approved
                      </button>
                      <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                          statusFilter === 'pending'
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                            : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setStatusFilter('rejected')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                          statusFilter === 'rejected'
                            ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md'
                            : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                        }`}
                      >
                        Rejected
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredProposals.length === 0 && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card rounded-xl p-8 text-center shadow-md"
            >
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconFolder size={32} className="text-primary" />
              </div>
              <h3 className="mt-2 text-lg font-medium">No projects found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto break-words">
                {searchTerm || statusFilter !== 'all' 
                  ? "No projects match your search criteria. Try adjusting your filters or search terms." 
                  : "Create a new project to get started with your academic journey."
                }
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 px-5 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm font-medium mx-auto"
                onClick={handleNewProposalForm}
              >
                <IconPlus size={16} />
                Create Project
              </motion.button>
            </motion.div>
          )}

          {/* Table View */}
          <AnimatePresence mode="wait">
            {filteredProposals.length > 0 && viewMode === 'table' && (
              <motion.div 
                key="table-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="overflow-auto rounded-xl shadow-md"
              >
                <table className="w-full">
                  <thead className="bg-accent/70 text-foreground">
                    <tr className="border-b border-border/10">
                      <th className="px-6 py-4 text-sm font-semibold text-left">{userRole === 'student' ? 'Faculty' : 'Student'}</th>
                      <th className="px-6 py-4 text-sm font-semibold text-left">Title</th>
                      <th className="px-6 py-4 text-sm font-semibold text-left">Submission Date</th>
                      <th className="px-6 py-4 text-sm font-semibold text-left">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card">
                    {filteredProposals.map((proposal, index) => (
                      <motion.tr 
                        key={proposal.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        className="hover:bg-accent/10 transition-colors border-b border-border/10 last:border-0"
                      >
                        <td className="px-6 py-4" style={{ maxWidth: '150px' }}>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {userRole === 'student' ? proposal.facultyName.charAt(0) : proposal.studentName.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium text-sm line-clamp-1 break-all">
                              {userRole === 'student' ? proposal.facultyName : proposal.studentName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4" style={{ maxWidth: '220px' }}>
                          <div className="font-medium text-sm line-clamp-1 break-all">{proposal.title}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(proposal.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit
                            ${proposal.status === 'approved' ? 'bg-teal-50 text-teal-700' :
                              proposal.status === 'rejected' ? 'bg-rose-50 text-rose-700' :
                                proposal.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                                  'bg-amber-50 text-amber-700'}`}
                          >
                            {proposal.status === 'approved' && (
                              <IconCircleCheck className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                            {proposal.status === 'rejected' && (
                              <IconCircleX className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                            {proposal.status === 'completed' && (
                              <IconCheck className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                            {proposal.status === 'pending' && (
                              <IconAlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                            <span className="truncate">
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium text-primary"
                            onClick={() => handleViewDetails(proposal.id)}
                          >
                            View Details
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* Card View */}
            {filteredProposals.length > 0 && viewMode === 'card' && (
              <motion.div 
                key="card-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProposals.map((proposal, index) => (
                  <motion.div 
                    key={proposal.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)" }}
                    className="bg-gradient-to-br from-card to-background/60 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden border border-primary/10"
                  >
                    {/* Colored top bar based on status */}
                    <div className={`h-1.5 w-full absolute top-0 left-0 ${
                      proposal.status === 'approved' ? 'bg-teal-500' :
                      proposal.status === 'rejected' ? 'bg-rose-500' :
                      proposal.status === 'completed' ? 'bg-blue-500' :
                      'bg-amber-500'
                    }`}></div>
                    
                    {/* Status badge positioned at top right */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1.5
                        ${proposal.status === 'approved' ? 'bg-teal-50 text-teal-700' :
                          proposal.status === 'rejected' ? 'bg-rose-50 text-rose-700' :
                            proposal.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                              'bg-amber-50 text-amber-700'}`}
                      >
                        {proposal.status === 'approved' && (
                          <IconCircleCheck className="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                        {proposal.status === 'rejected' && (
                          <IconCircleX className="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                        {proposal.status === 'completed' && (
                          <IconCheck className="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                        {proposal.status === 'pending' && (
                          <IconAlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="p-6 pt-8">
                      <h2 className="text-xl font-medium mb-4 break-words line-clamp-2">
                        {proposal.title}
                      </h2>
                      
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <span className="font-medium">
                            {userRole === 'student' ? proposal.facultyName.charAt(0) : proposal.studentName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium break-words line-clamp-1">
                            {userRole === 'student' ? 'Faculty: ' : 'Student: '}
                            {userRole === 'student' ? proposal.facultyName : proposal.studentName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-6 break-words line-clamp-3">{proposal.description}</p>
                      
                      <div className="mt-auto pt-4">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary/90 to-primary/70 text-white shadow-sm hover:shadow-md transition-all duration-300 text-sm font-medium"
                          onClick={() => handleViewDetails(proposal.id)}
                        >
                          View Details
                          <IconArrowRight size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Right Sidebar */}
        <div className="hidden lg:block">
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card rounded-xl shadow-md sticky top-24"
          >
            {/* Upcoming Events Section */}
            <div className="p-6 border-b border-border/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Upcoming</h3>
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                  This Week
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-2 border-primary/70 pl-4 py-2 hover:bg-accent/10 rounded-r-lg transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <IconCalendar size={14} className="text-primary" />
                    <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                  </div>
                  <p className="font-medium text-sm break-words">Project Review Meeting</p>
                </div>
                
                <div className="border-l-2 border-amber-500/70 pl-4 py-2 hover:bg-accent/10 rounded-r-lg transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <IconCalendar size={14} className="text-amber-500" />
                    <p className="text-xs text-muted-foreground">Friday, 2:30 PM</p>
                  </div>
                  <p className="font-medium text-sm break-words">Deadline: Initial Proposal</p>
                </div>
                
                <div className="border-l-2 border-blue-500/70 pl-4 py-2 hover:bg-accent/10 rounded-r-lg transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <IconUsers size={14} className="text-blue-500" />
                    <p className="text-xs text-muted-foreground">Saturday, 1:00 PM</p>
                  </div>
                  <p className="font-medium text-sm break-words">Team Brainstorming Session</p>
                </div>
              </div>
            </div>
            
            {/* Notifications Section */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Notifications</h3>
                <span className="h-5 w-5 flex items-center justify-center rounded-full bg-primary/90 text-white text-xs font-medium">
                  3
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-accent/20 hover:bg-accent/30 p-3 rounded-lg transition-colors cursor-pointer shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-50 rounded-full">
                      <IconCircleCheck size={16} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">Project Approved</p>
                      <p className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">Your project proposal "AI Research" was approved by Prof. Johnson</p>
                      <p className="text-xs text-primary/80 mt-2">2 hours ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-accent/20 hover:bg-accent/30 p-3 rounded-lg transition-colors cursor-pointer shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <IconBell size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">New Comment</p>
                      <p className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">Prof. Johnson commented on your proposal: "Great progress so far! Let's discuss the methodology in our next meeting."</p>
                      <p className="text-xs text-primary/80 mt-2">1 day ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-accent/20 hover:bg-accent/30 p-3 rounded-lg transition-colors cursor-pointer shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-50 rounded-full">
                      <IconAlertTriangle size={16} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">Deadline Approaching</p>
                      <p className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">Project milestone "Implementation Phase" is due in 3 days</p>
                      <p className="text-xs text-primary/80 mt-2">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-5 px-4 py-2.5 rounded-lg bg-card bg-gradient-to-r from-primary/10 to-transparent hover:from-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                View All Notifications
                <IconArrowRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Render modals */}
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
    </motion.main>
  );
};

const DashboardWithLayout = AppLayout()(Dashboard);
export default DashboardWithLayout;