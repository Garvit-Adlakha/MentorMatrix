import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSettings, IconMessage, IconArrowRight, IconPlus, IconHome, IconUsers, IconFolder, IconSearch } from '../ui/Icons';
import { useSuspenseQuery } from '@tanstack/react-query';
import ChatService from '../../service/ChatService';

// Enhanced Settings dropdown component with micro-interactions
const SettingsDropdown = () => {
  return (
    <div className="dropdown dropdown-left text-center mb-2">
      <label tabIndex={0} className="btn btn-ghost btn-circle hover:bg-primary/20 transition-all duration-300">
        <IconSettings className="w-5 h-5 text-muted-foreground hover:text-primary transition-transform duration-300 hover:rotate-90" />
      </label>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-4 shadow-xl bg-neutral-800/95 backdrop-blur-sm border border-neutral-700/30 rounded-xl w-52 mt-1">
        <li>
          <Link to="/profile" className="flex items-center gap-2 py-2 px-3 hover:bg-primary/10 rounded-lg transition-all duration-200 hover:text-primary">
            <motion.div whileHover={{ scale: 1.1 }} className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <IconUsers className="w-4 h-4" />
            </motion.div>
            <span>Profile</span>
          </Link>
        </li>
        <li>
          <Link to="/dashboard" className="flex items-center gap-2 py-2 px-3 hover:bg-primary/10 rounded-lg transition-all duration-200 hover:text-primary">
            <motion.div whileHover={{ scale: 1.1 }} className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <IconHome className="w-4 h-4" />
            </motion.div>
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/collaborate" className="flex items-center gap-2 py-2 px-3 hover:bg-primary/10 rounded-lg transition-all duration-200 hover:text-primary">
            <motion.div whileHover={{ scale: 1.1 }} className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
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
    <div className="px-3 py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-700/30">
        <h3 className="font-semibold text-lg text-foreground">Projects</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          title="Create new project"
        >
          <IconPlus className="w-4 h-4" />
        </motion.button>
      </div>
      
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full px-4 py-2 rounded-lg bg-black/30 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
      </div>
      
      <AnimatePresence>
        {filteredProjects.length > 0 ? (
          <div className="space-y-2">
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
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all border border-transparent ${
                    hoveredChat === chat._id 
                      ? 'bg-primary/15 border-primary/30 scale-[1.02]'
                      : 'hover:bg-neutral-700/30'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"
                  >
                    <IconMessage className={`w-5 h-5 ${hoveredChat === chat._id ? 'text-primary' : 'text-primary/70'}`} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{chat.name}</h4>
                    {chat.lastMessage && (
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
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
            className="text-center py-6 bg-neutral-800/50 rounded-lg border border-dashed border-neutral-700/40"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }} 
              className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <IconMessage className="w-6 h-6 text-primary/70" />
            </motion.div>
            <p className="text-sm text-muted-foreground mb-3">No projects available</p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-1 text-primary text-sm bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-md transition-all"
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
      className="h-full max-h-[98vh]"
    >
      <div className="h-full bg-neutral-800/80 backdrop-blur-sm rounded-xl border border-neutral-700/30 shadow-lg overflow-hidden">
        <div className="p-4 w-full h-full bg-transparent text-foreground flex flex-col">
          {/* Logo & Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-700/30">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
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