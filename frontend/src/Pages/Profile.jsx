import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import ProfileEditing from '../components/profile/profileEditing';
import { motion } from 'framer-motion';
import { useSuspenseQuery, useQueryClient, useMutation } from '@tanstack/react-query';
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

  const {data:user, isLoading: isLoadingUser, error: userError} = useSuspenseQuery({
    queryKey: ['user'],
    queryFn:()=> authService.currentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const {data:projects, isLoading: isLoadingProjects, error: projectsError} = useSuspenseQuery({
    queryKey: ['projects'],
    queryFn:()=> ProjectService.getAllProjects(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Handle loading and error states for user and projects
  if (isLoadingUser || isLoadingProjects) {
    return <AppLayout><div>Loading profile data...</div></AppLayout>; // Or a more sophisticated loader
  }

  if (userError) {
    return <AppLayout><div>Error loading user: {userError.message}</div></AppLayout>;
  }

  if (projectsError) {
    return <AppLayout><div>Error loading projects: {projectsError.message}</div></AppLayout>;
  }

  if (!user || !projects) { // Should be handled by Suspense, but good practice
    return <AppLayout><div>No data available.</div></AppLayout>;
  }

  const totalProjects = projects.projects?.length || 0;
  const ActiveProjects = projects.projects?.filter(p => p.status === 'approved').length || 0;
  const completedProjects = projects.projects?.filter(p => p.status === 'completed').length || 0;

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const updateUserMutation = useMutation({
    mutationFn: (updatedData) => authService.updateProfile(updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
    }
  })

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
  console.log(user);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/60 pb-16">
      <div className="container mx-auto px-4">
        <motion.h1 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-3xl md:text-4xl font-bold text-center mb-8"
        >
          My <span className="text-primary bg-clip-text  bg-gradient-to-r from-primary to-primary/70">Profile</span>
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
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {isLoadingUser && updateUserMutation.isPending && (
              <div className="flex justify-center items-center h-full">
                <Loader className="w-10 h-10 animate-spin" />
              </div>
            )}
            {/* Profile Card - Left Side */}
            <div className="md:col-span-1">
              <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-primary/10 backdrop-blur-sm">
                <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 flex flex-col items-center">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/80 shadow-lg mb-4">
                      <img
                        src={user?.avatar?.url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-4 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                  </div>
                  <h2 className="text-xl font-bold mb-1">{user?.name || "User Name"}</h2>
                  <p className="text-sm text-muted-foreground mb-4 capitalize">{user?.role || "User Role"}</p>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm mb-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs">
                      {user?.availability ? 'Available for Projects' : 'Not Available'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Bio</h3>
                    <p className="text-zinc-400">{user?.bio || "No bio available."}</p>
                  </div>
                  
                  {user?.role === 'student' && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {user?.skills && user.skills.length > 0 ? (
                          user.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
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
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Areas of Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {user?.expertise && user.expertise.length > 0 ? (
                          user.expertise.map((exp, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
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
              <div className="bg-card rounded-xl shadow-lg border border-primary/10 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <IconSchool size={20} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                      {user?.role === 'student' ? 'Academic Information' : 'Professional Information'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-ghost p-2 rounded-full hover:bg-primary/10 text-primary transition-colors duration-200"
                    title="Edit Profile"
                  >
                    <IconEdit size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-gradient-to-br from-primary/5 to-transparent p-4 rounded-lg border border-primary/10"
                  >
                    <div className="flex mb-3">
                      <div className="p-2 bg-primary/10 rounded-md mr-3">
                        <IconSchool size={16} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">University</h3>
                        <p className="text-foreground font-medium">{user?.university || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="p-2 bg-primary/10 rounded-md mr-3">
                        <IconUserCircle size={16} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                        <p className="text-foreground font-medium">{user?.department || "N/A"}</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {user?.role === 'student' && (
                    <motion.div 
                      variants={fadeInUp}
                      className="bg-gradient-to-br from-primary/5 to-transparent p-4 rounded-lg border border-primary/10"
                    >
                      <div className="flex mb-3">
                        <div className="p-2 bg-primary/10 rounded-md mr-3">
                          <IconId size={16} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Roll Number</h3>
                          <p className="text-foreground font-medium">{user?.roll_no || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex mb-3">
                        <div className="p-2 bg-primary/10 rounded-md mr-3">
                          <IconCalendar size={16} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Year of Study</h3>
                          <p className="text-foreground font-medium">{user?.yearOfStudy || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="p-2 bg-primary/10 rounded-md mr-3">
                          <IconSparkles size={16} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">CGPA</h3>
                          <p className="text-foreground font-medium">{user?.cgpa || "N/A"}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>    
                
                <motion.div 
                  variants={fadeInUp}
                  className="bg-gradient-to-br max-w-full mt-2 from-primary/5 to-transparent p-4 rounded-sm border border-primary/10"
                >
                  <div className="flex mb-3">
                    <div className="p-2 bg-primary/10 rounded-md mr-3">
                      <IconMail size={16} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                      <p className="text-foreground font-medium">{user?.email || "N/A"}</p>
                    </div>
                  </div>
                </motion.div>
                <div className="mt-8">
                  <div className="flex items-center mb-6 pb-4 border-b border-border">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <IconBriefcase size={20} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Project Statistics</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div 
                      variants={fadeInUp}
                      className="bg-gradient-to-br from-primary/10 to-transparent rounded-lg p-4 text-center border border-primary/10"
                    >
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <IconLayoutCollage size={20} className="text-primary" />
                      </div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Projects</h3>
                      <p className="text-2xl font-bold text-primary">{totalProjects}</p>
                    </motion.div>
                    
                    <motion.div 
                      variants={fadeInUp}
                      className="bg-gradient-to-br from-primary/10 to-transparent rounded-lg p-4 text-center border border-primary/10"
                    >
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <IconClock size={20} className="text-primary" />
                      </div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Active</h3>
                      <p className="text-2xl font-bold text-primary">{ActiveProjects}</p>
                    </motion.div>
                    
                    <motion.div 
                      variants={fadeInUp}
                      className="bg-gradient-to-br from-primary/10 to-transparent rounded-lg p-4 text-center border border-primary/10"
                    >
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <IconCheck size={20} className="text-primary" />
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

const WrappedProfile = AppLayout()(Profile);
export default WrappedProfile;
