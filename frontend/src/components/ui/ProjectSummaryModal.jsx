import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconDownload, IconClipboard, IconCheck, IconFileDescription, IconSparkles } from './Icons';
import ProjectService from '../../service/ProjectService';
import { FadeIn } from './AnimatedCard';
import { useQuery } from '@tanstack/react-query';
import ReactDOM from 'react-dom';

/**
 * Modal component for displaying AI-generated project summaries
 */
const ProjectSummaryModal = ({ open, onOpenChange, projectId }) => {
  const [copied, setCopied] = useState(false);
  const closeBtnRef = useRef(null);
  const modalRef = useRef(null);

  const { data: summary, isLoading: loading, isError: error } = useQuery({
    queryKey: ['projectSummary', projectId],
    queryFn: () => ProjectService.getSummary(projectId),
  });

  // Focus management for accessibility
  useEffect(() => {
    if (open && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
      // Trap focus inside modal
      if (open && modalRef.current) {
        const focusableEls = modalRef.current.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
      }
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

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

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with improved blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/70 shadow-2xl backdrop-blur-2xl  z-40"
            aria-hidden="true"
            onClick={() => onOpenChange(false)}
          />
          {/* Modal with enhanced animations */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-summary-title"
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[90vw] max-w-3xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-card to-card/95 border border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 focus:outline-none"
            tabIndex={-1}
          >
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            
            {/* Modal header with improved styling */}
            <div className="relative flex items-center justify-between p-5 border-b border-border/20 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <IconFileDescription size={20} className="text-primary" />
                </div>
                <h2 
                  id="project-summary-title" 
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
                >
                  Project Summary
                </h2>
              </div>
              <button
                ref={closeBtnRef}
                className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all transform active:scale-95 focus:ring-2 focus:ring-primary/30 focus:outline-none duration-150"
                onClick={() => onOpenChange(false)}
                aria-label="Close summary modal"
                title="Close"
              >
                <IconX size={18} />
              </button>
            </div>
            
            {/* Modal content with improved loading and error states */}
            <div className="p-6 overflow-y-auto max-h-[60vh] relative thin-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconSparkles size={18} className="text-primary animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-6 text-muted-foreground text-base font-medium">Generating AI summary...</p>
                  <p className="mt-2 text-sm text-muted-foreground/70">This might take a few moments</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-6 rounded-xl border border-red-200 dark:border-red-800/30 flex flex-col items-start gap-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <IconX size={18} className="text-red-500" />
                    Unable to generate summary
                  </h3>
                  <p>We couldn't generate a summary for this project at the moment. Please try again later.</p>
                  <button
                    className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-800/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-200 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <FadeIn className="space-y-6">
                  <div className="relative bg-gradient-to-br from-background/80 to-card/40 p-6 rounded-xl border border-primary/10 backdrop-blur-sm overflow-hidden shadow-sm">
                    {/* Decorative AI badge */}
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <IconSparkles size={12} className="animate-pulse" />
                        <span>AI Generated</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <span>Project Summary</span>
                    </h3>
                    
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">{summary}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-4 rounded-lg text-blue-800 dark:text-blue-300 flex items-start gap-3">
                    <div className="p-1 bg-blue-100 dark:bg-blue-800/30 rounded-full flex-shrink-0 mt-0.5">
                      <IconSparkles size={14} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm">
                        This AI-generated summary is based on the project description. It may not capture all nuances or details of the project.
                      </p>
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>
            
            {/* Modal footer with improved button styling */}
            <div className="border-t border-border/20 p-5 flex flex-wrap justify-end gap-3 bg-gradient-to-r from-transparent to-primary/5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2.5 flex items-center gap-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:outline-none disabled:opacity-50"
                onClick={handleCopyToClipboard}
                disabled={loading || error}
                aria-label="Copy summary to clipboard"
                title="Copy to clipboard"
              >
                {copied ? <IconCheck size={16} /> : <IconClipboard size={16} />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2.5 flex items-center gap-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:outline-none disabled:opacity-50"
                onClick={handleDownload}
                disabled={loading || error}
                aria-label="Download summary as text file"
                title="Download summary"
              >
                <IconDownload size={16} />
                <span>Download</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-sm hover:shadow-md focus:ring-2 focus:ring-primary/30 focus:outline-none"
                onClick={() => onOpenChange(false)}
                aria-label="Close modal"
                title="Close"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.getElementById('portal-root'));
};

export default ProjectSummaryModal;
