import { createPortal } from 'react-dom'
import { IconX } from './Icons'
import ProjectService from '../../service/ProjectService'
import Loader from './Loader'
import { useQuery } from '@tanstack/react-query'

const ProjectSummaryModal = ({ open, onOpenChange, projectId}) => {
    const{data:summary,isLoading}=useQuery({
    queryKey:['projectSummary',projectId],
    queryFn:()=>ProjectService.getSummary(projectId),
    enabled:!!projectId,
    })

  if (!open) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }
  
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-90 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
        >
      <div className="bg-card w-full max-w-md p-6 rounded-lg shadow-lg border border-primary/20 animate-fadeIn"
        onClick={(e => e.stopPropagation())}
      >
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Project Summary</h3>
              <button 
                  onClick={() => onOpenChange(false)}
                  className="text-muted-foreground hover:text-primary transition-colors"
              >
                  <IconX size={18} />
              </button>
          </div>
          {isLoading ? (
            <div className="py-8">
              <Loader  text="Generating summary..." />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none mb-4">
                <p className="whitespace-pre-wrap text-accent-foreground">{summary}</p>
            </div>
          )}
          <div className="flex justify-end">
              <button
                  onClick={() => onOpenChange(false)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                  Close
              </button>
          </div>
      </div>
    </div>,
    document.getElementById('portal-root') 
  )
}

export default ProjectSummaryModal
