import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { IconSettings, IconMessage, IconArrowRight, IconPlus } from '../ui/Icons';
import { useSuspenseQuery } from '@tanstack/react-query';
import ProjectService from '../../service/ProjectService';

// Enhanced Settings dropdown component
const SettingsDropdown = () => {
  return (
    <div className="dropdown dropdown-left text-center mb-2">
      <label tabIndex={0} className="btn btn-ghost btn-circle hover:bg-primary/20 transition-all duration-300">
        <IconSettings className="w-5 h-5 text-muted-foreground hover:text-primary transition-transform duration-300 hover:rotate-90" />
      </label>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-3 shadow-lg bg-zinc-400/80  rounded-xl w-52 mt-1">
        <li><Link to="/profile" className="hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all duration-200 rounded-lg mb-1 flex items-center gap-2">Profile</Link></li>
        <li><Link to="/dashboard" className="hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg mb-1 flex items-center gap-2">Dashboard</Link></li>
        <li><Link to="/collaborate" className="hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg mb-1 flex items-center gap-2">Collaboration Hub</Link></li>
      </ul>
    </div>
  )
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusClasses = {
    approved: "bg-green-100 text-green-800 border border-green-300",
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    rejected: "bg-red-100 text-red-800 border border-red-300",
    completed: "bg-blue-100 text-blue-800 border border-blue-300"
  };
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${statusClasses[status] || statusClasses.pending}`}>
      {status === 'approved' ? 'Active' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ProjectsList = () => {
  const { data: projectsData } = useSuspenseQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectService.getAllProjects(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const projects = projectsData?.projects || [];
  console.log(projects);
const filetedProjects= projects.filter(project => project.status === 'approved' || project.status === 'completed');

  return (
    <div className="px-3 py-4 space-y-3 overflow-y-auto max-h-[95vh] no-scrollbar">
      <div className="flex items-center justify-between  pb-2">
        <h3 className="font-medium text-lg text-foreground">Projects</h3>
      </div>
      
      {filetedProjects.length > 0 ? (
        filetedProjects.map(project => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link 
              to={`/chat/${project._id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <IconMessage className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{project.title}</h4>
                <div className="mt-1">
                  <StatusBadge status={project.status} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-6 bg-background/50 rounded-lg border border-dashed border-border/40">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
            <IconMessage className="w-6 h-6 text-primary/70" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">No projects available</p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-1 text-primary text-sm bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-md transition-colors"
          >
            Create a project <IconArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  return (
    <div className="drawer lg:drawer-open max-h-[95vh] overflow-hidden mt-2">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        {/* Page content here */}
        <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">
          Open drawer
        </label>
      </div>
      <div className="drawer-side bg-neutral-800/80 rounded-3xl">
        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
        <div className="p-4 w-80 h-full bg-card text-foreground flex flex-col">
          {/* Logo & Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/30">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Mentor Matrix</h2>
            <SettingsDropdown />
          </div>
          {/* Projects List */}
          <ProjectsList />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;