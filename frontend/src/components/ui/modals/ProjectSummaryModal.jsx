import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconX, IconDownload, IconClipboard, IconCheck, IconFileDescription, IconSparkles } from '../../ui/Icons';
import ProjectService from '../../../service/ProjectService';
import { FadeIn } from '../../ui/cards/AnimatedCard';
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
            className="modal-backdrop"
            aria-hidden="true"
            onClick={() => onOpenChange(false)}
          >
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
              className="modal-shell modal-shell--summary"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Decorative elements */}
            <div className="modal-orb modal-orb--top"></div>
            <div className="modal-orb modal-orb--bottom"></div>
            
            {/* Modal header with improved styling */}
            <div className="modal-header">
              <div className="modal-header-group">
                <div className="modal-header-icon">
                  <IconFileDescription size={20} className="text-primary" />
                </div>
                <h2 
                  id="project-summary-title" 
                  className="modal-title"
                >
                  Project Summary
                </h2>
              </div>
              <button
                ref={closeBtnRef}
                className="modal-close"
                onClick={() => onOpenChange(false)}
                aria-label="Close summary modal"
                title="Close"
              >
                <IconX size={18} />
              </button>
            </div>
            
            {/* Modal content with improved loading and error states */}
            <div className="modal-body">
              {loading ? (
                <div className="modal-loading">
                  <div className="modal-spinner">
                    <div className="modal-spinner-ring"></div>
                    <div className="modal-spinner-icon">
                      <IconSparkles size={18} />
                    </div>
                  </div>
                  <p className="modal-loading-title">Generating AI summary...</p>
                  <p className="modal-loading-subtitle">This might take a few moments</p>
                </div>
              ) : error ? (
                <div className="modal-error">
                  <h3 className="modal-error-title">
                    <IconX size={18} />
                    Unable to generate summary
                  </h3>
                  <p>We couldn't generate a summary for this project at the moment. Please try again later.</p>
                  <button
                    className="modal-btn modal-btn--ghost"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <FadeIn className="space-y-6">
                  <div className="modal-panel">
                    <div className="modal-badge">
                      <IconSparkles size={12} />
                      <span>AI Generated</span>
                    </div>
                    <h3 className="modal-panel-title">Project Summary</h3>
                    <div className="modal-panel-body">
                      <p className="modal-panel-text">{summary}</p>
                    </div>
                  </div>
                  
                  <div className="modal-note">
                    <div className="modal-note-icon">
                      <IconSparkles size={14} />
                    </div>
                    <div>
                      <p>
                        This AI-generated summary is based on the project description. It may not capture all nuances or details of the project.
                      </p>
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>
            
            {/* Modal footer with improved button styling */}
            <div className="modal-footer">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="modal-btn modal-btn--ghost"
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
                className="modal-btn modal-btn--ghost"
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

  return ReactDOM.createPortal(modalContent, document.getElementById('portal-root'));
};

export default ProjectSummaryModal;
