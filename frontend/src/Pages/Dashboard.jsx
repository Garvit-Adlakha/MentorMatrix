import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import ProjectForm from '../components/ProjectForm';
import { useSuspenseQuery } from '@tanstack/react-query';
import ProjectService from '../service/ProjectService';
import authService from '../service/authService';
import ProjectCardModel from '../components/ui/ProjectCardModel';
import CollaborationWidget from '../components/ui/CollaborationWidget';
import {
  IconSearch,
  IconFolder,
  IconCircleCheck,
  IconCircleX,
  IconCheck,
  IconAlertTriangle,
} from '../components/ui/Icons';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [showNewProposalForm, setShowNewProposalForm] = useState(false);
  const [projectModal, setProjectModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

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

  const handleViewDetails = (projectId) => {
    // Set the selected project ID and open the modal
    console.log("project id fron handle view details",projectId)
    setSelectedProjectId(projectId);
    setProjectModal(true);
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
          <button className="btn btn-primary btn-sm" onClick={handleNewProposalForm}>
            New Proposal
          </button>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="stat bg-base-200 rounded-lg shadow">
              <div className="stat-title break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Total Proposals</div>
              <div className="stat-value break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{totalProposals}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg shadow">
              <div className="stat-title break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Approved</div>
              <div className="stat-value text-success break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{acceptedProposals}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg shadow">
              <div className="stat-title break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Pending</div>
              <div className="stat-value text-warning break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{pendingProposals}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg shadow">
              <div className="stat-title break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Rejected</div>
              <div className="stat-value text-error break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{rejectedProposals}</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <IconSearch size={16} className="text-gray-500" />
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

          {/* Empty State */}
          {filteredProposals.length === 0 && (
            <div className="bg-base-200 rounded-lg p-8 text-center">
              <IconFolder size={48} className="mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>No projects found</h3>
              <p className="mt-1 text-sm text-gray-500 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
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
          {filteredProposals.length > 0 && viewMode === 'table' && (
            <div className="overflow-auto rounded-lg shadow">
              <table className="table w-full">
                <thead className="bg-base-300">
                  <tr>
                    <th className="px-4 py-3 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{userRole === 'student' ? 'Faculty' : 'Student'}</th>
                    <th className="px-4 py-3 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Title</th>
                    <th className="px-4 py-3 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Submission Date</th>
                    <th className="px-4 py-3 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Status</th>
                    <th className="px-4 py-3 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProposals.map(proposal => (
                    <tr key={proposal.id} className="hover:bg-base-200 border-b transition duration-200">
                      <td className="px-4 py-3 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '150px' }}>{userRole === 'student' ? proposal.facultyName : proposal.studentName}</td>
                      <td className="px-4 py-3 font-medium break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '200px' }}>{proposal.title}</td>
                      <td className="px-4 py-3 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{new Date(proposal.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5
                          ${proposal.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-300' :
                            proposal.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300' :
                              proposal.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                'bg-yellow-100 text-yellow-800 border border-yellow-300'}`}
                              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {proposal.status === 'approved' && (
                            <IconCircleCheck className="w-3.5 h-3.5 mr-1" />
                          )}
                          {proposal.status === 'rejected' && (
                            <IconCircleX className="w-3.5 h-3.5 mr-1" />
                          )}
                          {proposal.status === 'completed' && (
                            <IconCheck className="w-3.5 h-3.5 mr-1" />
                          )}
                          {proposal.status === 'pending' && (
                            <IconAlertTriangle className="w-3.5 h-3.5 mr-1" />
                          )}
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
          {filteredProposals.length > 0 && viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProposals.map(proposal => (
                <div key={proposal.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-200 relative">
                  {/* Status badge positioned at top right */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center
                      ${proposal.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-300' :
                        proposal.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300' :
                          proposal.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            'bg-yellow-100 text-yellow-800 border border-yellow-300'}`}
                    >
                      {proposal.status === 'approved' && (
                        <IconCircleCheck className="w-3.5 h-3.5 mr-1" />
                      )}
                      {proposal.status === 'rejected' && (
                        <IconCircleX className="w-3.5 h-3.5 mr-1" />
                      )}
                      {proposal.status === 'completed' && (
                        <IconCheck className="w-3.5 h-3.5 mr-1" />
                      )}
                      {proposal.status === 'pending' && (
                        <IconAlertTriangle className="w-3.5 h-3.5 mr-1" />
                      )}
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                  </div>
                  <div className="card-body">
                    <h2 className="card-title break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {proposal.title}
                    </h2>
                    <p className="text-sm mb-2 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      <span className="font-semibold">{userRole === 'student' ? 'Faculty: ' : 'Student: '}</span>
                      {userRole === 'student' ? proposal.facultyName : proposal.studentName}
                    </p>
                    <p className="text-sm text-gray-600 mb-2 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      <span className="font-semibold">Submitted: </span>
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm line-clamp-2 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{proposal.description}</p>
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
        </div>
        
        {/* Sidebar with collaboration widget */}
        <div className="lg:col-span-1 space-y-6">
          <CollaborationWidget />
          
          {/* Additional sidebar content can be added here */}
        </div>
      </div>

      {
        // Project Modal - Rendered conditionally based on state
        projectModal && (
          <ProjectCardModel 
            open={projectModal}
            onOpenChange={setProjectModal}
            projectId={selectedProjectId}
            onSuccess={() => {
              // Refresh data after modal submission
              refetch();
            }}
          />
        )
      }
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

const DashboardWithLayout = AppLayout()(Dashboard);
export default DashboardWithLayout;