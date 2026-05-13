import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconX, IconDownload, IconClipboard, IconCheck, IconFileDescription, IconSparkles } from '../../ui/Icons';
import ProjectService from '../../../service/ProjectService';
import { FadeIn } from '../../ui/cards/AnimatedCard';
import { useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import ProjectReviewDetails from '../../ui/ProjectReviewDetails';

/**
 * Modal component for displaying AI-generated project reviews
 */
const ProjectReviewModal = ({ open, onOpenChange, projectId }) => {
  const [copied, setCopied] = useState(false);
  const closeBtnRef = useRef(null);
  const modalRef = useRef(null);

  const { data: reviewData, isLoading: loading, isError: error } = useQuery({
    queryKey: ['projectReview', projectId],
    queryFn: ()=> ProjectService.getProjectReview(projectId),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
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
            className="modal-backdrop"
            aria-hidden="true"
            onClick={() => onOpenChange(false)}
          >
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
            className="modal-shell modal-shell--review"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative elements */}
            <div className="modal-orb modal-orb--top"></div>
            <div className="modal-orb modal-orb--bottom"></div>
            
            {/* Modal header */}
            <div className="modal-header modal-header--sticky">
              <div className="modal-header-group">
                <div className="modal-header-icon">
                  <IconFileDescription size={20} className="text-primary" />
                </div>
                <h2 
                  id="project-review-title" 
                  className="modal-title"
                >
                  Project Review
                </h2>
              </div>
              <button
                ref={closeBtnRef}
                className="modal-close"
                onClick={() => onOpenChange(false)}
                aria-label="Close review modal"
                title="Close"
              >
                <IconX size={18} />
              </button>
            </div>
            
            {/* Modal content */}
            <div className="modal-body modal-body--review">
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
                    className="modal-note"
                  >
                    <div className="modal-note-icon">
                      <IconSparkles size={16} />
                    </div>
                    <div>
                      <p className="modal-note-title">AI-Generated Review</p>
                      <p className="modal-note-text">
                        This review is based on the project details. It may not capture all nuances or details of the project.
                      </p>
                    </div>
                  </motion.div>
                )}
              </FadeIn>
            </div>
            
            {/* Modal footer */}
            <div className="modal-footer modal-footer--sticky">
              {!loading && !error && reviewText && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="modal-btn modal-btn--ghost"
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
                    className="modal-btn modal-btn--ghost"
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
                className="modal-btn modal-btn--solid"
                onClick={() => onOpenChange(false)}
                aria-label="Close modal"
                title="Close"
              >
                Close
              </motion.button>
            </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
  
  // Use createPortal to render modal into portal-root
  return createPortal(modalContent, document.getElementById('portal-root') || document.body);
};

export default ProjectReviewModal;
