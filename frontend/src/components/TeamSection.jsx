import React from 'react';
import { motion } from 'framer-motion';
import { IconUsers, IconUserCircle, IconMessage, IconArrowRight } from './ui/Icons';

const TeamSection = ({ teamMembers, assignedMentor }) => (
  <div>
    {teamMembers && teamMembers.length > 0 ? (
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <IconUsers className="text-primary" size={20} />
          Team Members
        </h2>
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
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium inline-flex items-center gap-2"
        >
          Add Team Members
          <IconArrowRight size={16} />
        </motion.button>
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

export default TeamSection;
