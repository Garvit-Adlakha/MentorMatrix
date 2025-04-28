import React from 'react';
import { motion } from 'framer-motion';
import { IconFileText, IconArrowRight, IconDownload } from './ui/Icons';
import { useNavigate } from 'react-router-dom';

const DocumentsSection = ({ documents, formatDate }) => {

  const navigate=useNavigate()

  const handleUploadDocument = () => {
    // Navigate to the upload document page
    navigate('/collaborate?tab=files');
  }
  return (
  <div>
    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
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
            className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <IconFileText size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium break-words">{doc.name}</p>
              <p className="text-sm text-muted-foreground">
                {doc.format} • Uploaded on {formatDate(doc.uploadedAt)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                <IconDownload size={20} className="text-primary" />
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <IconFileText size={32} className="text-primary" />
        </div>
        <h3 className="text-xl font-medium mb-2">No Documents Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          There are no documents uploaded for this project yet.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUploadDocument}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium inline-flex items-center gap-2"
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
