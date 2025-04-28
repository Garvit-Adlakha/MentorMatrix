import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
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
import { formatDate as formatDateUtil } from '../../libs/utils';
import { useNavigate } from 'react-router-dom';

// Utility for file size formatting (moved to utils if used elsewhere)
const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown size';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

// Improved file type detection for icon
const getFileIcon = (fileType, name) => {
  if (fileType.includes('image')) {
    return <IconEye size={18} className="text-blue-500" />;
  } else if (fileType.includes('pdf')) {
    return <IconFileText size={18} className="text-red-500" />;
  } else if (fileType.includes('word') || fileType.includes('document') || /docx?$/.test(name)) {
    return <IconFileText size={18} className="text-blue-500" />;
  } else if (fileType.includes('excel') || /xlsx?$/.test(name)) {
    return <IconFileText size={18} className="text-green-600" />;
  } else if (fileType.includes('zip') || /zip|rar|7z$/.test(name)) {
    return <IconFileText size={18} className="text-yellow-600" />;
  } else {
    return <IconFileText size={18} className="text-gray-500" />;
  }
};

const FILE_TYPE_OPTIONS = [
  { value: 'report', label: 'Project Report' },
  { value: 'presentation', label: 'Project PPT' },
  { value: 'project SRS', label: 'Project SRS' },
  { value: 'other', label: 'Others' },
];

const FileSharing = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState('');
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // --- Document type tab state ---
  const [activeDocType, setActiveDocType] = useState('');


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

  // Get all unique types from uploaded documents
  const documentTypes = React.useMemo(() => {
    if (!projectData?.project?.documents) return [];
    const types = projectData.project.documents.map(doc => doc.type || 'other');
    // Keep only unique types, preserve order
    return [...new Set(types)];
  }, [projectData]);

  // Set default active type when documents change
  useEffect(() => {
    if (documentTypes.length > 0) {
      setActiveDocType(documentTypes[0]);
    } else {
      setActiveDocType('');
    }
  }, [documentTypes]);

  // Filter documents by active type
  const filteredDocuments = React.useMemo(() => {
    if (!projectData?.project?.documents) return [];
    return projectData.project.documents.filter(doc => (doc.type || 'other') === activeDocType);
  }, [projectData, activeDocType]);


  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: ({ projectId, file, fileType }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileType); // Send file type in body
      return ProjectService.uploadProjectDocument(projectId, formData);
    },
    onSuccess: () => {
      toast.success('File uploaded successfully');
      queryClient.invalidateQueries(['project', selectedProject]);
      setUploadingFile(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload file');
      console.error('Upload error:', error);
      setUploadingFile(false);
    }
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: ({ projectId, documentId }) => ProjectService.deleteProjectDocument(projectId, documentId),
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
    setSelectedFileType(''); // Reset file type on project change
  };

  // Handle file type change
  const handleFileTypeChange = (e) => {
    setSelectedFileType(e.target.value);
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
    // Check allowed file types (example: images, pdf, docx, xlsx, zip, pptx)
    const allowedTypes = [
      'image/', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip', 'application/x-7z-compressed', 'application/x-rar-compressed',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    if (!allowedTypes.some(type => file.type.startsWith(type) || file.name.match(/\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z)$/i))) {
      toast.error('Unsupported file type');
      return;
    }
    setUploadingFile(true);
    uploadFileMutation.mutate({ projectId: selectedProject, file, fileType: selectedFileType });
  };

  // Accessibility: close image preview with Escape key
  const handlePreviewKey = useCallback((e) => {
    if (e.key === 'Escape') setPreviewImage(null);
  }, []);
  useEffect(() => {
    if (previewImage) {
      window.addEventListener('keydown', handlePreviewKey);
      return () => window.removeEventListener('keydown', handlePreviewKey);
    }
  }, [previewImage, handlePreviewKey]);

  // Handle delete file (open confirm dialog)
  const handleDeleteFile = (fileId) => {
    setFileToDelete(fileId);
    setShowConfirm(true);
  };

  // Confirm delete
  const confirmDeleteFile = () => {
    setDeletingFileId(fileToDelete);
    deleteFileMutation.mutate(
      { projectId: selectedProject, documentId: fileToDelete },
      {
        onSettled: () => {
          setDeletingFileId(null);
          setShowConfirm(false);
          setFileToDelete(null);
        }
      }
    );
  };
  // Cancel delete
  const cancelDeleteFile = () => {
    setShowConfirm(false);
    setFileToDelete(null);
  };

  
  if(projectLoading){
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-black border border-primary/20 rounded-2xl p-10 shadow-2xl max-w-3xl mx-auto mt-12 backdrop-blur-md"
    >
      {/* Go Back Button */}
      <button
        onClick={() => navigate('/collaborate')}
        className="mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow"
      >
        Go Back
      </button>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 items-center justify-center mb-4">
          <h2 className="text-3xl font-extrabold text-primary drop-shadow-sm mb-1 tracking-tight">Project File Sharing</h2>
          <p className="text-[16px] text-primary/80 font-medium">Share, preview, and manage your project documents with your team.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center bg-neutral-800/90 dark:bg-card/90 rounded-xl p-8 shadow-lg border border-primary/10">
          <div className="flex flex-col gap-2 w-full md:w-1/3">
            <label htmlFor="project-select" className="font-medium text-sm mb-1">Select Project</label>
            <select
              id="project-select"
              className="px-3 py-2 rounded-lg border border-border bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 min-w-[180px]"
              value={selectedProject}
              onChange={handleProjectChange}
              disabled={projectsLoading}
              aria-label="Select project"
            >
              <option value="">Choose a project</option>
              {projectsData?.projects?.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/3">
            <label htmlFor="filetype-select" className="font-medium text-sm mb-1">Select File Type</label>
            <select
              id="filetype-select"
              className="px-3 py-2 rounded-lg border bg-neutral-800  border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 min-w-[180px]"
              value={selectedFileType}
              onChange={handleFileTypeChange}
              disabled={!selectedProject}
              aria-label="Select file type"
            >
              <option value="">Choose file type</option>
              {FILE_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/3 items-center justify-center">
            <label className="font-medium text-sm mb-1 opacity-0">Upload</label>
            <button
              onClick={() => {
                if (!selectedProject) {
                  toast.error('Please select a project first');
                  return;
                }
                if (!selectedFileType) {
                  toast.error('Please select a file type');
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={!selectedProject || !selectedFileType || uploadingFile}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-purple-500 text-black rounded-lg shadow hover:from-primary/90 hover:to-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center text-base font-semibold"
            >
              {uploadingFile ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <IconUpload size={18} />
                  <span>Upload File</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={!selectedProject || !selectedFileType || uploadingFile}
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
          <>
            {/* Document type tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {documentTypes.map(type => (
                <button
                  key={type}
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors ${activeDocType === type ? 'bg-primary text-white border-primary' : 'bg-background text-primary border-primary/30 hover:bg-primary/10'}`}
                  onClick={() => setActiveDocType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            {/* Documents of selected type */}
            {filteredDocuments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No documents of this type.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredDocuments.map((document) => (
                  <motion.div
                    key={document._id || document.url}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-all bg-card flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        aria-label={document.format?.includes('image') ? 'Preview image' : undefined}
                        className={document.format?.includes('image') ? 'focus:outline-none' : 'hidden'}
                        onClick={() => setPreviewImage(document.url)}
                        tabIndex={document.format?.includes('image') ? 0 : -1}
                        type="button"
                      >
                        {getFileIcon(document.format || 'application/octet-stream', document.name)}
                      </button>
                      <div>
                        <h3 className="font-medium truncate max-w-md" title={document.name}>{document.name}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>Uploaded on {formatDateUtil(document.uploadedAt)}</span>
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
                        aria-label={`Download ${document.name}`}
                      >
                        <IconDownload size={18} />
                      </a>
                      <button
                        onClick={() => handleDeleteFile(document._id)}
                        className="p-2 bg-red-500 text-red-800 rounded hover:bg-red-200 transition-colors"
                        title="Delete"
                        aria-label={`Delete ${document.name}`}
                        disabled={deletingFileId === document._id}
                      >
                        {deletingFileId === document._id ? (
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
          </>
        )}

        {/* Image preview modal with Escape key support and better alt text */}
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setPreviewImage(null)}>
            <img src={previewImage} alt="Project file preview" className="max-h-[80vh] max-w-[90vw] rounded shadow-lg" />
          </div>
        )} 
        {/* Delete confirmation dialog */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-black dark:bg-card rounded-lg p-6 shadow-xl w-full max-w-xs flex flex-col items-center">
              <p className="mb-4 text-center">Are you sure you want to delete this file?</p>
              <div className="flex gap-4">
                <button
                  onClick={confirmDeleteFile}
                  className="px-4 py-2 bg-red-100 text-neutral-400   rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDeleteFile}
                  className="px-4 py-2 bg-gray-500 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FileSharing;