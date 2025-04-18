import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProjectService from '../../../service/ProjectService';
import { IconMessage, IconUsers, IconClock } from '../../ui/Icons';

const ProjectChatList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch user's projects
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectService.getAllProjects(),
    refetchOnWindowFocus: false,
  });

  // Filter projects based on search term
  const filteredProjects = data?.projects?.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    project.description?.abstract?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle click on project
  const handleProjectClick = (projectId) => {
    navigate(`/chat/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
          <p>Error loading projects: {error.message}</p>
        </div>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data?.projects || data.projects.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconMessage size={32} className="text-primary" />
        </div>
        <p className="text-lg font-medium mb-2">No Projects Found</p>
        <p className="text-muted-foreground mb-4">
          You don't have any active projects yet
        </p>
        <Link 
          to="/dashboard"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-block"
        >
          Create A Project
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card border border-border/50 rounded-xl p-6 shadow-sm"
    >
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 pl-10"
          />
          <div className="absolute left-3 top-3 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No projects match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProjects.map((project) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleProjectClick(project._id)}
              className="border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-all bg-card cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{project.title}</h3>
                  {project.description?.abstract && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {project.description.abstract}
                    </p>
                  )}
                </div>
                <div className="bg-accent/40 h-10 w-10 rounded-full flex items-center justify-center">
                  <IconMessage size={18} className="text-primary" />
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <IconUsers size={14} />
                  <span>
                    {project.teamMembers?.length || 1} member{project.teamMembers?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <IconClock size={14} />
                  <span>Created on {formatDate(project.createdAt)}</span>
                </div>
              </div>

              {project.unreadCount > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="bg-primary/90 text-white text-xs px-2 py-0.5 rounded-full">
                    {project.unreadCount} new
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ProjectChatList;