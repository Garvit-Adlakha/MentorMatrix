import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconDownload, IconClipboard, IconCheck, IconFileDescription, IconSparkles } from './Icons';
import ProjectService from '../../service/ProjectService';
import { FadeIn } from './AnimatedCard';
import { useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import ProjectReviewDetails from './ProjectReviewDetails';

/**
 * Modal component for displaying AI-generated project reviews
 */
const ProjectReviewModal = ({ open, onOpenChange, projectId }) => {
  const [copied, setCopied] = useState(false);
  const closeBtnRef = useRef(null);
  const modalRef = useRef(null);

  const { data: reviewData, isLoading: loading, isError: error } = useQuery({
    queryKey: ['projectReview', projectId],
    queryFn: async () => {
      const res = await ProjectService.getProjectReview(projectId);
      return res;
    },
    enabled: !!projectId && open,
  });

  const reviewText = reviewData?.review || '';

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
    navigator.clipboard.writeText(reviewText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error('Failed to copy: ', err));
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([reviewText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `project-review-${projectId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!open) return null;

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/70 shadow-2xl backdrop-blur-2xl z-50"
            aria-hidden="true"
            onClick={() => onOpenChange(false)}
          />
          {/* Modal */}
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
            aria-labelledby="project-review-title"
            className="fixed z-[100] top-[10%] left-1/2 transform -translate-x-1/2 w-[95vw] sm:w-[90vw] max-w-4xl max-h-[80vh] overflow-hidden bg-gradient-to-br from-card to-card/95 border border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 focus:outline-none"
            tabIndex={-1}
          >
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border/20 bg-gradient-to-r from-card to-card/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <IconFileDescription size={20} className="text-primary" />
                </div>
                <h2 
                  id="project-review-title" 
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
                >
                  Project Review
                </h2>
              </div>
              <button
                ref={closeBtnRef}
                className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all transform active:scale-95 focus:ring-2 focus:ring-primary/30 focus:outline-none duration-150"
                onClick={() => onOpenChange(false)}
                aria-label="Close review modal"
                title="Close"
              >
                <IconX size={18} />
              </button>
            </div>
            
            {/* Modal content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-130px)] relative thin-scrollbar scroll-smooth">
              <FadeIn className="space-y-6">
                <ProjectReviewDetails 
                  reviewText={reviewText} 
                  loading={loading} 
                  error={error} 
                />
                
                {!loading && !error && reviewText && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-4 rounded-lg text-blue-800 dark:text-blue-300 flex items-start gap-3 shadow-sm"
                  >
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-800/30 rounded-full flex-shrink-0 mt-0.5">
                      <IconSparkles size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-0.5">AI-Generated Review</p>
                      <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
                        This review is based on the project details. It may not capture all nuances or details of the project.
                      </p>
                    </div>
                  </motion.div>
                )}
              </FadeIn>
            </div>
            
            {/* Modal footer */}
            <div className="sticky bottom-0 z-10 border-t border-border/20 p-4 flex flex-wrap justify-end gap-3 bg-gradient-to-r from-card to-card/95 backdrop-blur-md">
              {!loading && !error && reviewText && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2.5 flex items-center gap-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    onClick={handleCopyToClipboard}
                    aria-label="Copy review to clipboard"
                    title="Copy to clipboard"
                  >
                    {copied ? <IconCheck size={16} className="text-green-500" /> : <IconClipboard size={16} />}
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2.5 flex items-center gap-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    onClick={handleDownload}
                    aria-label="Download review as text file"
                    title="Download review"
                  >
                    <IconDownload size={16} />
                    <span>Download</span>
                  </motion.button>
                </>
              )}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-sm hover:shadow-md focus:ring-2 focus:ring-primary/30 focus:outline-none"
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
  
  // Use createPortal to render modal into portal-root
  return createPortal(modalContent, document.getElementById('portal-root') || document.body);
};

export default ProjectReviewModal;
