import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import ProjectForm from '../components/ProjectForm';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import authService from '../service/authService';
import Loader from '../components/ui/Loader';
import ProjectService from '../service/ProjectService';



const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const {data:user,isLoading}=useQuery({
    queryKey: ['user'],
    queryFn:()=> authService.currentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const{data:projects,isLoading:projectLoading}=useQuery({
    queryKey: ['projects',user?.user?.role],
    queryFn:()=> ProjectService.getAllProjects(user?.user?.role),
    enabled: !!user?.user?.role,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  if(projectLoading){
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/60">
        <Loader />
      </div>
    );
  }


  const totalProjects= projects.projects.length;
  const ActiveProjects = projects.projects.filter(p => p.status === 'approved').length;
  const pendingProposals = projects.projects.filter(p => p.status === 'pending').length;
  const rejectedProposals = projects.projects.filter(p => p.status === 'rejected').length;
  const completedProjects = projects.projects.filter(p => p.status === 'completed').length;

  const studentData=user?.user

  console.log(studentData);
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveClick = (updatedData) => {
    // Save the updated data to the backend
    console.log('Updated Data:', updatedData);
    setIsEditing(false);
    navigate('/projects');
  };



  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if(isLoading){
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/60">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/60 pt-6 pb-16">
      <div className="container mx-auto px-4">
        <motion.h1 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-3xl md:text-4xl font-bold text-center mb-8"
        >
          My <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Profile</span>
        </motion.h1>
        
        {isEditing ? (
          <ProjectForm
            initialData={studentData}
            onSave={handleSaveClick}
            onCancel={handleCancelClick}
          />
        ) : (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {/* Profile Card - Left Side */}
            <div className="md:col-span-1">
              <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-primary/10 backdrop-blur-sm">
                <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 flex flex-col items-center">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/80 shadow-lg mb-4">
                      <img
                        src={studentData?.avatar || "https://i.pravatar.cc/300"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-4 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                  </div>
                  <h2 className="text-xl font-bold mb-1">{studentData?.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{studentData.role}</p>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm mb-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs">
                      {studentData?.availability ? 'Available for Projects' : 'Not Available'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 ">Bio</h3>
                    <p className="text-zinc-400">{studentData.bio}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {studentData.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleEditClick}
                    className="w-full btn bg-primary text-white hover:bg-primary/90 font-medium group px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
            
            {/* Details Card - Right Side */}
            <div className="md:col-span-2">
              <div className="bg-card rounded-xl shadow-lg border border-primary/10 backdrop-blur-sm p-6">
                <div className="flex items-center mb-6 pb-4 border-b border-border">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Academic Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-gradient-to-br from-primary/5 to-transparent p-4 rounded-lg border border-primary/10"
                  >
                    <div className="flex mb-3">
                      <div className="p-2 bg-primary/10 rounded-md mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">University</h3>
                        <p className="text-foreground font-medium">{studentData.university}</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="p-2 bg-primary/10 rounded-md mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                        <p className="text-foreground font-medium">{studentData.department}</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-gradient-to-br from-primary/5 to-transparent p-4 rounded-lg border border-primary/10"
                  >
                    <div className="flex mb-3">
                      <div className="p-2 bg-primary/10 rounded-md mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-1.997-1.884zM2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Roll Number</h3>
                        <p className="text-foreground font-medium">{studentData.roll_no}</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="p-2 bg-primary/10 rounded-md mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1-.257-.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">SAP ID</h3>
                        <p className="text-foreground font-medium">{studentData.sap_id}</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-gradient-to-br from-primary/5 to-transparent p-4 rounded-lg border border-primary/10"
                  >
                    <div className="flex mb-3">
                      <div className="p-2 bg-primary/10 rounded-md mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Year of Study</h3>
                        <p className="text-foreground font-medium">{studentData.yearOfStudy}</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-gradient-to-br from-primary/5 to-transparent p-4 rounded-lg border border-primary/10"
                  >
                    <div className="flex mb-3">
                      <div className="p-2 bg-primary/10 rounded-md mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                        <p className="text-foreground font-medium">{studentData.email}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="mt-8">
                  <div className="flex items-center mb-6 pb-4 border-b border-border">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Project Statistics</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div 
                      variants={fadeInUp}
                      className="bg-gradient-to-br from-primary/10 to-transparent rounded-lg p-4 text-center border border-primary/10"
                    >
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Projects</h3>
                      <p className="text-2xl font-bold text-primary">{totalProjects}</p>
                    </motion.div>
                    
                    <motion.div 
                      variants={fadeInUp}
                      className="bg-gradient-to-br from-primary/10 to-transparent rounded-lg p-4 text-center border border-primary/10"
                    >
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Active</h3>
                      <p className="text-2xl font-bold text-primary">{ActiveProjects}</p>
                    </motion.div>
                    
                    <motion.div 
                      variants={fadeInUp}
                      className="bg-gradient-to-br from-primary/10 to-transparent rounded-lg p-4 text-center border border-primary/10"
                    >
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Completed</h3>
                      <p className="text-2xl font-bold text-primary">{completedProjects}</p>
                    </motion.div>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="btn bg-gradient-to-r from-primary to-primary/80 text-white hover:opacity-90 font-medium group px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center shadow-md"
                    >
                      View All Projects
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default AppLayout()(Profile);
