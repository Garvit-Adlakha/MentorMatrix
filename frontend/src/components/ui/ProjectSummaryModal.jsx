import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconDownload, IconClipboard, IconCheck } from './Icons';
import ProjectService from '../../service/ProjectService';
import { FadeIn } from './AnimatedCard';

/**
 * Modal component for displaying AI-generated project summaries
 */
const ProjectSummaryModal = ({ open, onOpenChange, projectId }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && projectId) {
      setLoading(true);
      setError(null);
      
      ProjectService.getSummary(projectId)
        .then((data) => {
          setSummary(data.summary || 'No summary available');
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching summary:', err);
          setError('Failed to generate summary. Please try again later.');
          setLoading(false);
        });
    }
  }, [open, projectId]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(summary)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error('Failed to copy: ', err));
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `project-summary-${projectId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => onOpenChange(false)}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl max-h-[85vh] overflow-hidden bg-card border border-border/50 rounded-xl shadow-xl"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30 bg-muted/30">
              <h2 className="text-xl font-semibold">Project Summary</h2>
              <button 
                className="p-2 rounded-full hover:bg-muted transition-colors"
                onClick={() => onOpenChange(false)}
              >
                <IconX size={18} />
              </button>
            </div>
            
            {/* Modal content */}
            <div className="p-6 overflow-y-auto max-h-[60vh] relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Generating summary...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200">
                  <p className="font-medium mb-2">Error</p>
                  <p>{error}</p>
                </div>
              ) : (
                <FadeIn className="space-y-4">
                  <div className="bg-muted/30 p-6 rounded-lg border border-border/30">
                    <h3 className="text-lg font-medium mb-3">AI-Generated Project Summary</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{summary}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-4 rounded-lg text-blue-800 dark:text-blue-300">
                    <p className="text-sm">
                      This is an AI-generated summary of the project. It may not capture all nuances or details of the project.
                    </p>
                  </div>
                </FadeIn>
              )}
            </div>
            
            {/* Modal footer */}
            <div className="border-t border-border/30 p-4 flex justify-end gap-3 bg-muted/20">
              <button
                className="px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                onClick={handleCopyToClipboard}
                disabled={loading}
              >
                {copied ? <IconCheck size={16} /> : <IconClipboard size={16} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              
              <button
                className="px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                onClick={handleDownload}
                disabled={loading}
              >
                <IconDownload size={16} />
                Download
              </button>
              
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                onClick={() => onOpenChange(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectSummaryModal;
