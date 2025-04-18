import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import ProjectService from '../../service/ProjectService';
import {
  IconUpload,
  IconFileText,
  IconTrash,
  IconDownload,
  IconEye
} from './Icons';

const FileSharing = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch user's projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectService.getAllProjects(),
    refetchOnWindowFocus: false,
  });

  // Fetch project files when a project is selected
  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ['project', selectedProject],
    queryFn: () => ProjectService.getProjectById(selectedProject),
    enabled: !!selectedProject,
    refetchOnWindowFocus: false,
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: ({ projectId, file }) => {
      const formData = new FormData();
      formData.append('document', file);
      return ProjectService.uploadProjectDocument(projectId, formData);
    },
    onSuccess: () => {
      toast.success('File uploaded successfully');
      queryClient.invalidateQueries(['project', selectedProject]);
      setUploadingFile(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload file');
      setUploadingFile(false);
    }
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: ({ projectId, fileId }) => ProjectService.deleteProjectDocument(projectId, fileId),
    onSuccess: () => {
      toast.success('File deleted successfully');
      queryClient.invalidateQueries(['project', selectedProject]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete file');
    }
  });

  // Handle project change
  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setUploadingFile(true);
    uploadFileMutation.mutate({ projectId: selectedProject, file });
  };

  // Handle delete file
  const handleDeleteFile = (fileId) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFileMutation.mutate({ projectId: selectedProject, fileId });
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get file icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType.includes('image')) {
      return <IconEye size={18} className="text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <IconFileText size={18} className="text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <IconFileText size={18} className="text-blue-500" />;
    } else {
      return <IconFileText size={18} className="text-gray-500" />;
    }
  };

  // Get file size in human readable format
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card border border-border/50 rounded-xl p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Project Files</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            className="px-3 py-2 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 min-w-[200px]"
            value={selectedProject}
            onChange={handleProjectChange}
            disabled={projectsLoading}
          >
            <option value="">Select a project</option>
            {projectsData?.projects?.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedProject || uploadingFile}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
          >
            {uploadingFile ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <IconUpload size={16} />
                <span>Upload File</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={!selectedProject || uploadingFile}
            />
          </button>
        </div>
      </div>

      {projectLoading ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project files...</p>
        </div>
      ) : !selectedProject ? (
        <div className="py-8 text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconFileText size={32} className="text-primary" />
          </div>
          <p className="text-lg font-medium mb-2">No project selected</p>
          <p className="text-muted-foreground mb-4">
            Select a project to view and manage its files
          </p>
        </div>
      ) : projectData?.project?.documents?.length === 0 ? (
        <div className="py-8 text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconFileText size={32} className="text-primary" />
          </div>
          <p className="text-lg font-medium mb-2">No files yet</p>
          <p className="text-muted-foreground mb-4">
            Upload files to share with your team
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projectData?.project?.documents?.map((document) => (
            <motion.div
              key={document._id || document.url}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-all bg-card flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(document.format || 'application/octet-stream')}
                <div>
                  <h3 className="font-medium truncate max-w-md">{document.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Uploaded on {formatDate(document.uploadedAt)}</span>
                    <span>{document.size ? formatFileSize(document.size) : 'Unknown size'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-accent/50 text-foreground rounded hover:bg-accent transition-colors"
                  title="Download"
                >
                  <IconDownload size={18} />
                </a>
                <button
                  onClick={() => handleDeleteFile(document._id)}
                  className="p-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                  title="Delete"
                  disabled={deleteFileMutation.isPending}
                >
                  {deleteFileMutation.isPending ? (
                    <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-red-800 rounded-full"></div>
                  ) : (
                    <IconTrash size={18} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FileSharing;