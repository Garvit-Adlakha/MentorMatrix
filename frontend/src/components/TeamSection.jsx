import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IconUsers, IconUserCircle, IconMessage, IconArrowRight } from './ui/Icons';

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
          <div className='flex items-center justify-between mb-6'>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <IconUsers className="text-primary" size={20} />
              Team Members
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenDialog}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium inline-flex items-center gap-2"
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
                className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconUserCircle size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{member?.name}</p>
                  <p className="text-sm text-muted-foreground">{member?.email}</p>
                  {member?.role && (
                    <p className="text-xs text-primary mt-1">{member.role}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <IconUsers size={32} className="text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Team Members</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            This project doesn't have any team members assigned yet.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenDialog}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium inline-flex items-center gap-2"
          >
            Add Team Members
            <IconArrowRight size={16} />
          </motion.button>
        </div>
      )}
      {/* Dialog Box UI */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#18181b] rounded-xl shadow-lg p-8 w-full max-w-md relative border border-[#27272a]">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
              onClick={handleCloseDialog}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4 text-white">Add Team Members</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="w-full border border-[#27272a] bg-[#232326] text-white rounded-lg px-4 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400"
                placeholder="Enter teammate emails (comma-separated)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-gray-400 mb-3">Enter multiple email addresses separated by commas</p>
              {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-[#27272a] hover:bg-[#323236] text-gray-200"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
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
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <IconUserCircle className="text-primary" size={20} />
            Assigned Mentor
          </h2>
          <div className="bg-gradient-to-br from-primary/10 to-transparent p-5 rounded-xl border border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <IconUserCircle size={32} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold">{assignedMentor.name}</p>
                <p className="text-muted-foreground">{assignedMentor.email}</p>
                {assignedMentor.department && (
                  <p className="text-sm text-primary/80 mt-1">{assignedMentor.department}</p>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2"
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
