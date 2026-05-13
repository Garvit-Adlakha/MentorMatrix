import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSettings, IconMessage, IconArrowRight, IconPlus, IconHome, IconUsers, IconFolder, IconSearch } from '../ui/Icons';
import { useSuspenseQuery } from '@tanstack/react-query';
import ChatService from '../../service/ChatService';

// Enhanced Settings dropdown component with micro-interactions
const SettingsDropdown = () => {
  return (
    <div className="dropdown dropdown-left text-center mb-2 chat-settings">
      <label tabIndex={0} className="btn btn-ghost btn-circle chat-settings-toggle">
        <IconSettings className="w-5 h-5 chat-settings-icon" />
      </label>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-4 chat-settings-menu">
        <li>
          <Link to="/profile" className="chat-settings-link">
            <motion.div whileHover={{ scale: 1.1 }} className="chat-settings-badge">
              <IconUsers className="w-4 h-4" />
            </motion.div>
            <span>Profile</span>
          </Link>
        </li>
        <li>
          <Link to="/dashboard" className="chat-settings-link">
            <motion.div whileHover={{ scale: 1.1 }} className="chat-settings-badge">
              <IconHome className="w-4 h-4" />
            </motion.div>
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/collaborate" className="chat-settings-link">
            <motion.div whileHover={{ scale: 1.1 }} className="chat-settings-badge">
              <IconFolder className="w-4 h-4" />
            </motion.div>
            <span>Collaboration Hub</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

const ProjectsList = () => {
  const navigate = useNavigate();
  const [hoveredChat, setHoveredChat] = useState(null);
  const [search, setSearch] = useState('');
  
  const { data: userChats = [] } = useSuspenseQuery({
    queryKey: ['userChats'],
    queryFn: () => ChatService.getChatList(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const filteredProjects = userChats.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chat-sidebar-list">
      <div className="chat-sidebar-header">
        <h3 className="chat-sidebar-title">Projects</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="chat-sidebar-action"
          title="Create new project"
        >
          <IconPlus className="w-4 h-4" />
        </motion.button>
      </div>
      
      <div className="chat-sidebar-search">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="chat-sidebar-search-input"
        />
        <IconSearch className="chat-sidebar-search-icon" />
      </div>
      
      <AnimatePresence>
        {filteredProjects.length > 0 ? (
          <div className="chat-sidebar-items">
            {filteredProjects.map(chat => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setHoveredChat(chat._id)}
                onMouseLeave={() => setHoveredChat(null)}
              >
                <Link 
                  to={`/chat/${chat._id}`}
                  className={`chat-sidebar-item ${
                    hoveredChat === chat._id 
                      ? 'chat-sidebar-item--active'
                      : ''
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="chat-sidebar-item-icon"
                  >
                    <IconMessage className={hoveredChat === chat._id ? 'text-primary' : 'text-primary/70'} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h4 className="chat-sidebar-item-title">{chat.name}</h4>
                    {chat.lastMessage && (
                      <p className="chat-sidebar-item-subtitle">
                        {chat.lastMessage.sender?.name}: {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="chat-sidebar-empty"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }} 
              className="chat-sidebar-empty-icon"
            >
              <IconMessage className="text-primary/70" />
            </motion.div>
            <p className="chat-sidebar-empty-text">No projects available</p>
            <Link 
              to="/dashboard" 
              className="chat-sidebar-empty-link"
            >
              Create a project <IconArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="chat-sidebar"
    >
      <div className="chat-sidebar-shell">
        <div className="chat-sidebar-inner">
          {/* Logo & Header */}
          <div className="chat-sidebar-brand">
            <h2 className="chat-sidebar-brand-title">
              Mentor Matrix
            </h2>
            <SettingsDropdown />
          </div>
          {/* Projects List */}
          <ProjectsList />
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;