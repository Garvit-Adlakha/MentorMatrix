import React from 'react';
import { motion } from 'framer-motion';

const TabButton = ({ active, onClick, icon, label }) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ y: 0 }}
    onClick={onClick}
    className={`project-tab ${active ? 'project-tab--active' : ''}`}
  >
    {icon}
    {label}
  </motion.button>
);

const TabNavigation = ({ activeTab, setActiveTab, tabs }) => (
  <div className="project-tabs">
    <div className="project-tabs-row">
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
