import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import ProfileEditing from '../components/profile/profileEditing';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import authService from '../service/authService';
import ProjectService from '../service/ProjectService';
import {
  IconEdit,
  IconSchool,
  IconUserCircle,
  IconId,
  IconCalendar,
  IconMail,
  IconBriefcase,
  IconLayoutCollage,
  IconClock,
  IconCheck,
  IconArrowRight,
  IconSparkles
} from '../components/ui/Icons';
import { toast } from 'react-hot-toast';
import Loader from '../components/ui/Loader';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: (updatedData) => authService.updateProfile(updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
    }
  })

  const {data:user, isLoading: isLoadingUser, error: userError} = useQuery({
    queryKey: ['user'],
    queryFn:()=> authService.currentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const {data:projects, isLoading: isLoadingProjects, error: projectsError} = useQuery({
    queryKey: ['projects'],
    queryFn:()=> ProjectService.getAllProjects(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Handle loading and error states for user and projects
  if (isLoadingUser || isLoadingProjects) {
    return (
      <div className="profile-page">
        <div className="container mx-auto px-4 profile-container py-10">
          <Loader text="Getting your profile ready..." />
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="profile-page">
        <div className="container mx-auto px-4 profile-container py-10">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-500 mb-2">Unable to Load Profile</h3>
            <p className="text-muted-foreground">{userError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="profile-page">
        <div className="container mx-auto px-4 profile-container py-10">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-500 mb-2">Unable to Load Projects</h3>
            <p className="text-muted-foreground">{projectsError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !projects) { // Should be handled by Suspense, but good practice
    return (
      <div className="profile-page">
        <div className="container mx-auto px-4 profile-container py-10">
          <div>No data available.</div>
        </div>
      </div>
    );
  }

  const totalProjects = projects.projects?.length || 0;
  const ActiveProjects = projects.projects?.filter(p => p.status === 'approved').length || 0;
  const completedProjects = projects.projects?.filter(p => p.status === 'completed').length || 0;

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveClick = async (updatedData) => {
    try {
      // The updatedData from ProfileEditing contains form fields and potentially avatarFile
      const { avatar, ...userData } = updatedData;

      // Create a FormData object to handle file uploads
      const formDataToSubmit = new FormData();

      // Append user data fields
      for (const key in userData) {
        if (userData[key] !== undefined && userData[key] !== null) {
          // Handle skills and expertise arrays properly
          if ((key === 'skills' || key === 'expertise') && Array.isArray(userData[key])) {
            userData[key].forEach(item => formDataToSubmit.append(`${key}[]`, item));
          } else {
            formDataToSubmit.append(key, userData[key]);
          }
        }
      }

      // Append avatar file if it exists
      if (avatar) {
        formDataToSubmit.append('avatar', avatar);
      }

      await updateUserMutation.mutateAsync(formDataToSubmit);
      
      // Refetch user data to update the UI
      await queryClient.invalidateQueries(['user']);

      setIsEditing(false);
      toast.success("Profile updated successfully!");

    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile. Please try again.");
      // Optionally, keep the form open or handle specific errors
    }
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="profile-page ">
      <div className="container mx-auto px-4 profile-container">
        <motion.h1 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="profile-title"
        >
          My <span className="profile-title-accent">Profile</span>
        </motion.h1>
        
        {isEditing ? (
          <ProfileEditing
            initialData={user}
            onSave={handleSaveClick}
            onCancel={handleCancelClick}
          />
        ) : (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {isLoadingUser && updateUserMutation.isPending && (
              <div className="flex justify-center items-center h-full">
                <Loader className="w-10 h-10 animate-spin" />
              </div>
            )}
            {/* Profile Card - Left Side */}
            <div className="md:col-span-1">
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="relative">
                    <div className="profile-avatar">
                      <img
                        src={user?.avatar?.url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="profile-status-dot"></div>
                  </div>
                  <h2 className="text-xl font-bold mb-1">{user?.name || "User Name"}</h2>
                  <p className="text-sm text-muted-foreground mb-4 capitalize">{user?.role || "User Role"}</p>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm mb-2">
                    <span className="profile-chip">
                      {user?.availability ? 'Available for Projects' : 'Not Available'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="profile-section-title">Bio</h3>
                    <p className="profile-muted">{user?.bio || "No bio available."}</p>
                  </div>
                  
                  {user?.role === 'student' && (
                    <div className="mb-6">
                      <h3 className="profile-section-title">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {user?.skills && user.skills.length > 0 ? (
                          user.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="profile-chip-alt"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No skills listed.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {user?.role === 'mentor' && (
                    <div className="mb-6">
                      <h3 className="profile-section-title">Areas of Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {user?.expertise && user.expertise.length > 0 ? (
                          user.expertise.map((exp, index) => (
                            <span 
                              key={index} 
                              className="profile-chip-alt"
                            >
                              {exp}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No expertise listed.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Details Card - Right Side */}
            <div className="md:col-span-2">
              <div className="profile-card profile-card--padded">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                  <div className="flex items-center">
                    <div className="profile-icon-chip">
                      <IconSchool size={20} className="text-primary" />
                    </div>
                    <h2 className="profile-section-heading">
                      {user?.role === 'student' ? 'Academic Information' : 'Professional Information'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="profile-icon-button"
                    title="Edit Profile"
                  >
                    <IconEdit size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    variants={fadeInUp}
                    className="profile-info-card"
                  >
                    <div className="flex mb-3">
                      <div className="profile-icon-chip">
                        <IconSchool size={16} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="profile-label">University</h3>
                        <p className="profile-value">{user?.university || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="profile-icon-chip">
                        <IconUserCircle size={16} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="profile-label">Department</h3>
                        <p className="profile-value">{user?.department || "N/A"}</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {user?.role === 'student' && (
                    <motion.div 
                      variants={fadeInUp}
                      className="profile-info-card"
                    >
                      <div className="flex mb-3">
                        <div className="profile-icon-chip">
                          <IconId size={16} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="profile-label">Roll Number</h3>
                          <p className="profile-value">{user?.roll_no || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex mb-3">
                        <div className="profile-icon-chip">
                          <IconCalendar size={16} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="profile-label">Year of Study</h3>
                          <p className="profile-value">{user?.yearOfStudy || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="profile-icon-chip">
                          <IconSparkles size={16} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="profile-label">CGPA</h3>
                          <p className="profile-value">{user?.cgpa || "N/A"}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>    
                
                <motion.div 
                  variants={fadeInUp}
                  className="profile-info-card profile-info-card--full"
                >
                  <div className="flex mb-3">
                    <div className="profile-icon-chip">
                      <IconMail size={16} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="profile-label">Email</h3>
                      <p className="profile-value">{user?.email || "N/A"}</p>
                    </div>
                  </div>
                </motion.div>
                <div className="mt-6">
                  <div className="flex items-center mb-4 pb-3 border-b border-border">
                    <div className="profile-icon-chip">
                      <IconBriefcase size={20} className="text-primary" />
                    </div>
                    <h2 className="profile-section-heading">Project Statistics</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div 
                      variants={fadeInUp}
                      className="profile-stat-card"
                    >
                      <div className="profile-stat-icon">
                        <IconLayoutCollage size={20} className="text-primary" />
                      </div>
                      <h3 className="profile-stat-label">Total Projects</h3>
                      <p className="profile-stat-value">{totalProjects}</p>
                    </motion.div>
                    
                    <motion.div 
                      variants={fadeInUp}
                      className="profile-stat-card"
                    >
                      <div className="profile-stat-icon">
                        <IconClock size={20} className="text-primary" />
                      </div>
                      <h3 className="profile-stat-label">Active</h3>
                      <p className="profile-stat-value">{ActiveProjects}</p>
                    </motion.div>
                    
                    <motion.div 
                      variants={fadeInUp}
                      className="profile-stat-card"
                    >
                      <div className="profile-stat-icon">
                        <IconCheck size={20} className="text-primary" />
                      </div>
                      <h3 className="profile-stat-label">Completed</h3>
                      <p className="profile-stat-value">{completedProjects}</p>
                    </motion.div>
                  </div>
                  
                  <div className="mt-5 flex justify-center">
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="profile-action-btn"
                    >
                      View All Projects
                      <IconArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
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

Profile.layoutClassName = "landing-theme";

const WrappedProfile = AppLayout()(Profile);
export default WrappedProfile;
