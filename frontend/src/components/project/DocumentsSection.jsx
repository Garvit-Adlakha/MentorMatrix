import React from 'react';
import { motion } from 'motion/react';
import { IconFileText, IconArrowRight, IconDownload } from '../ui/Icons';
import { useNavigate } from 'react-router-dom';

const DocumentsSection = ({ documents, formatDate }) => {

  const navigate=useNavigate()

  const handleUploadDocument = () => {
    // Navigate to the upload document page
    navigate('/collaborate?tab=files');
  }
  return (
  <div>
    <h2 className="project-section-heading">
      <IconFileText className="text-primary" size={20} />
      Project Documents
    </h2>
    {documents && documents.length > 0 ? (
      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc, index) => (
          <motion.a
            key={index}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="project-card"
          >
            <div className="project-avatar">
              <IconFileText size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium break-words">{doc.name}</p>
              <p className="text-sm text-muted-foreground">
                {doc.format} • Uploaded on {formatDate(doc.uploadedAt)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="project-icon-btn">
                <IconDownload size={20} className="text-primary" />
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    ) : (
      <div className="project-empty">
        <div className="project-empty-icon">
          <IconFileText size={32} className="text-primary" />
        </div>
        <h3 className="project-empty-title">No Documents Yet</h3>
        <p className="project-empty-text">
          There are no documents uploaded for this project yet.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUploadDocument}
          className="project-action-btn"
        >
          Upload Document
          <IconArrowRight size={16} />
        </motion.button>
      </div>
    )}
  </div>
)}
;

export default DocumentsSection;
