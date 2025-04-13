import React, { useState } from 'react';
import ProjectCardModel from './ProjectCardModel';
import { useQuery } from '@tanstack/react-query';
import ProjectService from '../../service/ProjectService';

const ProjectCardExample = ({ projectId }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Optional: Fetch project data for the preview card
  const { data: projectPreview, isLoading } = useQuery({
    queryKey: ['project-preview', projectId],
    queryFn: () => ProjectService.getProjectById(projectId),
    enabled: !!projectId,
    select: (data) => data.data
  });

  return (
    <div className="flex flex-col items-center">
      <div 
        className="bg-card p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer w-full max-w-md"
        onClick={() => setIsOpen(true)}
      >
        {isLoading ? (
          <div className="animate-pulse p-4">
            <div className="h-5 bg-primary/20 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-primary/10 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-primary/10 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-primary/10 rounded w-1/3"></div>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-2">
              {projectPreview?.title || 'Project Details'}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {projectPreview?.description?.abstract || 'Click to view project details'}
            </p>
            <div className="mt-4 flex justify-end">
              <button 
                className="px-4 py-1 bg-primary text-primary-foreground rounded-md text-sm"
              >
                View Details
              </button>
            </div>
          </>
        )}
      </div>

      {/* The ProjectCardModel modal */}
      <ProjectCardModel 
        open={isOpen} 
        onOpenChange={setIsOpen} 
        projectId={projectId}
        onSuccess={() => console.log('Modal closed successfully')}
      />
    </div>
  );
};

export default ProjectCardExample;