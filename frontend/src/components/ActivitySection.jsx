import React from 'react';
import { motion } from 'framer-motion';
import { IconCalendar } from './ui/Icons';

const ActivitySection = ({ activity, formatDate }) => (
  <div>
    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
      <IconCalendar className="text-primary" size={20} />
      Project Activity
    </h2>
    <div className="relative border-l-2 border-primary/30 ml-3 pl-6 py-2">
      {activity.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="mb-8 relative"
        >
          <div className="absolute -left-10 w-4 h-4 rounded-full bg-primary"></div>
          <div className="bg-accent/10 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium">{item.action}</h3>
              <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
            </div>
            <p className="text-sm text-muted-foreground">by {item.user}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default ActivitySection;
