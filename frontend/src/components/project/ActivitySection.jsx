import React from 'react';
import { motion } from 'motion/react';
import { IconCalendar } from '../ui/Icons';

const ActivitySection = ({ activity, formatDate }) => (
  <div>
    <h2 className="project-section-heading">
      <IconCalendar className="text-primary" size={20} />
      Project Activity
    </h2>
    <div className="project-activity">
      {activity.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="project-activity-item"
        >
          <div className="project-activity-dot"></div>
          <div className="project-card">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium">{item.action}</h3>
              <span className="project-card-meta">{formatDate(item.date)}</span>
            </div>
            <p className="project-muted">by {item.user}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default ActivitySection;
