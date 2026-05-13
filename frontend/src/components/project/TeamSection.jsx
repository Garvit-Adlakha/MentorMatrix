import React, { useState } from 'react';
import { motion } from 'motion/react';
import { IconUsers, IconUserCircle, IconMessage, IconArrowRight } from '../ui/Icons';

const TeamSection = ({createdBy, teamMembers, assignedMentor, handleAddTeamMembers }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleOpenDialog = () => {
    setShowDialog(true);
    setEmail('');
    setError('');
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEmail('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Split emails by commas and trim whitespace
    const emails = email.split(',').map(email => email.trim()).filter(email => email !== '');
    
    // Validate all emails
    const invalidEmails = emails.filter(email => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));
    
    if (emails.length === 0) {
      setError('Please enter at least one valid email address.');
      return;
    }
    
    if (invalidEmails.length > 0) {
      setError(`Invalid email format: ${invalidEmails.join(', ')}`);
      return;
    }
    
    // Pass the array of emails to the handler
    handleAddTeamMembers(emails);
    setShowDialog(false);
    setEmail('');
    setError('');
  };

  return (
    <div>
      {teamMembers && teamMembers.length > 0 ? (
        <div>
          <div className="project-section-header">
            <h2 className="project-section-heading">
              <IconUsers className="text-primary" size={20} />
              Team Members
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenDialog}
              className="project-action-btn"
            >
              Add Team Members
              <IconArrowRight size={16} />
            </motion.button>
          </div>
     
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="project-card"
              >
                <div className="project-avatar">
                  <IconUserCircle size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{member?.name}</p>
                  <p className="text-sm text-muted-foreground">{member?.email}</p>
                  {member?.role && (
                    <p className="project-card-meta">{member.role}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="project-empty">
          <div className="project-empty-icon">
            <IconUsers size={32} className="text-primary" />
          </div>
          <h3 className="project-empty-title">No Team Members</h3>
          <p className="project-empty-text">
            This project doesn't have any team members assigned yet.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenDialog}
            className="project-action-btn"
          >
            Add Team Members
            <IconArrowRight size={16} />
          </motion.button>
        </div>
      )}
      {/* Dialog Box UI */}
      {showDialog && (
        <div className="project-dialog">
          <div className="project-dialog-card">
            <button
              className="project-dialog-close"
              onClick={handleCloseDialog}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="project-dialog-title">Add Team Members</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="project-dialog-input"
                placeholder="Enter teammate emails (comma-separated)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <p className="project-dialog-hint">Enter multiple email addresses separated by commas</p>
              {error && <p className="project-dialog-error">{error}</p>}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="project-dialog-btn project-dialog-btn--ghost"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="project-dialog-btn project-dialog-btn--primary"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {assignedMentor && (
        <div className="mt-10">
          <h2 className="project-section-heading">
            <IconUserCircle className="text-primary" size={20} />
            Assigned Mentor
          </h2>
          <div className="project-card project-card--accent">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="project-avatar project-avatar--lg">
                <IconUserCircle size={32} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold">{assignedMentor.name}</p>
                <p className="text-muted-foreground">{assignedMentor.email}</p>
                {assignedMentor.department && (
                  <p className="project-card-meta">{assignedMentor.department}</p>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="project-action-btn project-action-btn--ghost"
              >
                <IconMessage size={16} />
                <span className="font-medium">Contact</span>
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSection;
