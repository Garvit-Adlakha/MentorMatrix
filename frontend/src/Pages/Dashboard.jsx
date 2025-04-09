import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import ProjectForm from '../components/ProjectForm';
import { useQuery } from '@tanstack/react-query';
import ProjectService from '../service/ProjectService';
import authService from '../service/authService';
import { IconAlertCircle } from '../components/ui/Icons';
import Loader from '../components/ui/Loader';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [showNewProposalForm, setShowNewProposalForm] = useState(false);

  // Get the current user data from React Query cache
  const { data: userData } = useQuery({
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
  const { data: projectsData, isLoading, error, refetch } = useQuery({
    queryKey: ['projects', userRole, searchTerm],
    queryFn: () => ProjectService.getAllProjects(searchTerm, userRole),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 1,
    enabled: !!userRole, // Only run query when userRole is available
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

  const toggleRole = () => {
    setUserRole(userRole === 'student' ? 'faculty' : 'student');
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'card' : 'table');
  };

  const filteredProposals = searchTerm 
    ? projects.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : projects;

  // Calculate statistics
  const totalProposals = projects.length;
  const acceptedProposals = projects.filter(p => p.status === 'approved').length;
  const pendingProposals = projects.filter(p => p.status === 'pending').length;
  const rejectedProposals = projects.filter(p => p.status === 'rejected').length;

  const handleViewDetails = (proposalId) => {
    // Navigate to proposal details
    navigate(`/proposal/${proposalId}`);
  };

  const handleNewProposalForm = () => {
    setShowNewProposalForm(!showNewProposalForm);
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button className="btn btn-outline btn-sm" onClick={toggleViewMode}>
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </button>
          <button className="btn btn-outline btn-sm" onClick={toggleRole}>
            {userRole === 'student' ? 'Switch to Faculty' : 'Switch to Student'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleNewProposalForm}>
            New Proposal
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Total Proposals</div>
          <div className="stat-value">{totalProposals}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Approved</div>
          <div className="stat-value text-success">{acceptedProposals}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Pending</div>
          <div className="stat-value text-warning">{pendingProposals}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Rejected</div>
          <div className="stat-value text-error">{rejectedProposals}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="search" 
            className="input input-bordered w-full pl-10" 
            placeholder="Search proposals by title, faculty, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader />
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-5 rounded-lg flex items-center gap-2 mb-6">
          <IconAlertCircle size={20} />
          <p>{error.message || "Error loading projects. Please try again."}</p>
          <button 
            className="ml-auto btn btn-sm btn-outline" 
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredProposals.length === 0 && (
        <div className="bg-base-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "No projects match your search criteria." : "Create a new project to get started."}
          </p>
          <button
            className="btn btn-primary mt-4"
            onClick={handleNewProposalForm}
          >
            Create Project
          </button>
        </div>
      )}

      {/* Table View */}
      {!isLoading && !error && filteredProposals.length > 0 && viewMode === 'table' && (
        <div className="overflow-auto rounded-lg shadow">
          <table className="table w-full">
            <thead className="bg-base-300">
              <tr>
                <th className="px-4 py-3">{userRole === 'student' ? 'Faculty' : 'Student'}</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Submission Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.map(proposal => (
                <tr key={proposal.id} className="hover:bg-base-200 border-b transition duration-200">
                  <td className="px-4 py-3">{userRole === 'student' ? proposal.facultyName : proposal.studentName}</td>
                  <td className="px-4 py-3 font-medium">{proposal.title}</td>
                  <td className="px-4 py-3">{new Date(proposal.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                      ${proposal.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                        proposal.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      className="btn btn-sm btn-ghost" 
                      onClick={() => handleViewDetails(proposal.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Card View */}
      {!isLoading && !error && filteredProposals.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map(proposal => (
            <div key={proposal.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="card-body">
                <h2 className="card-title">
                  {proposal.title}
                  <span className={`badge 
                    ${proposal.status === 'accepted' ? 'badge-success' : 
                      proposal.status === 'rejected' ? 'badge-error' : 
                      'badge-warning'}`}
                  >
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </span>
                </h2>
                <p className="text-sm mb-2">
                  <span className="font-semibold">{userRole === 'student' ? 'Faculty: ' : 'Student: '}</span>
                  {userRole === 'student' ? proposal.facultyName : proposal.studentName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Submitted: </span>
                  {new Date(proposal.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm line-clamp-2">{proposal.description}</p>
                <div className="card-actions justify-end mt-4">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleViewDetails(proposal.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Form Modal - Rendered at the root level so it appears above everything */}
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
    </main>
  );
};

export default AppLayout()(Dashboard);