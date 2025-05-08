import React from 'react';
import { motion } from 'framer-motion';

const TabButton = ({ active, onClick, icon, label }) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ y: 0 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm rounded-t-lg border-b-2 whitespace-nowrap \
      ${active ? 
        'text-primary border-primary' : 
        'text-muted-foreground border-transparent hover:border-primary/30 hover:text-foreground'
      }`}
  >
    {icon}
    {label}
  </motion.button>
);

const TabNavigation = ({ activeTab, setActiveTab, tabs }) => (
  <div className="mb-6 border-b border-border/30">
    <div className="flex overflow-x-auto space-x-6 pb-2 scrollbar-hide">
      {tabs.map(tab => (
        <TabButton
          key={tab.key}
          active={activeTab === tab.key}
          onClick={() => setActiveTab(tab.key)}
          icon={tab.icon}
          label={tab.label}
        />
      ))}
    </div>
  </div>
);

export default TabNavigation;
