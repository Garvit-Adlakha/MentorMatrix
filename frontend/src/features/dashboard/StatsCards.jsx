import React from 'react';
import { motion } from 'motion/react';
import { 
  IconFileText, 
  IconCircleCheck, 
  IconAlertTriangle, 
  IconCircleX 
} from '../../components/ui/Icons';

const StatCard = ({ 
  title, 
  count, 
  color = 'primary', 
  icon 
}) => {
  const colorClasses = {
    primary: {
      bar: 'bg-primary/90',
      text: 'text-primary',
      border: 'border-primary/10',
      iconBg: 'bg-primary/10'
    },
    teal: {
      bar: 'bg-teal-500',
      text: 'text-teal-600',
      border: 'border-teal-500/10',
      iconBg: 'bg-teal-50'
    },
    amber: {
      bar: 'bg-amber-500',
      text: 'text-amber-600',
      border: 'border-amber-500/10',
      iconBg: 'bg-amber-50'
    },
    rose: {
      bar: 'bg-rose-500',
      text: 'text-rose-600',
      border: 'border-rose-500/10',
      iconBg: 'bg-rose-50'
    }
  };

  const classes = colorClasses[color] || colorClasses.primary;

  return (
    <motion.div 
      whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
      className={`bg-gradient-to-br from-card to-background/60 backdrop-blur-sm rounded-xl shadow-md relative overflow-hidden ${classes.border}`}
    >
      <div className={`absolute top-0 left-0 h-full w-1.5 ${classes.bar}`}></div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <div className={`p-2 ${classes.iconBg} rounded-md`}>
            {icon}
          </div>
        </div>
        <div className={`text-3xl font-bold ${classes.text}`}>{count}</div>
      </div>
    </motion.div>
  );
};

const StatsCards = ({ 
  userRole,
  totalProposals, 
  acceptedProposals, 
  pendingProposals, 
  rejectedProposals 
}) => {
  // Determine which cards to show based on userRole
  const isStudent = userRole === 'student';

  // Build cards array dynamically
  const cards = [
    {
      key: 'total',
      title: 'Total Proposals',
      count: totalProposals,
      color: 'primary',
      icon: <IconFileText size={16} className="text-primary" />,
    },
    {
      key: 'approved',
      title: 'Approved',
      count: acceptedProposals,
      color: 'teal',
      icon: <IconCircleCheck size={16} className="text-teal-600" />,
    },
    isStudent && {
      key: 'pending',
      title: 'Pending',
      count: pendingProposals,
      color: 'amber',
      icon: <IconAlertTriangle size={16} className="text-amber-600" />,
    },
    {
      key: 'rejected',
      title: 'Rejected',
      count: rejectedProposals,
      color: 'rose',
      icon: <IconCircleX size={16} className="text-rose-600" />,
    },
  ].filter(Boolean); // Remove false entries

  // Adjust grid columns based on number of cards
  const gridCols = cards.length === 4 ? 'md:grid-cols-4' : cards.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-4 mb-8`}
    >
      {cards.map((card) => (
        <StatCard
          key={card.key}
          title={card.title}
          count={card.count}
          color={card.color}
          icon={card.icon}
        />
      ))}
    </motion.div>
  );
};

export default React.memo(StatsCards);