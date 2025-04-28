import React from 'react';

const ChatHeader = ({ activeChat, toggleSidebar }) => (
  <div className="p-4 mt-6 border-b border-neutral-700/30 bg-neutral-700/60 backdrop-blur-md flex items-center justify-between">
    <div className="flex items-center">
      <button
        onClick={toggleSidebar}
        aria-label="Open chat sidebar"
        className="md:hidden mr-3 p-2 rounded-md hover:bg-neutral-700/30 transition-colors"
      >
        {/* IconMenu should be imported in parent and passed as prop if needed */}
        <span className="icon-menu" />
      </button>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mr-3 shadow-sm">
          <span className="font-medium text-primary text-lg">
            {activeChat?.name?.substring(0, 2) || 'GC'}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-lg">
            {activeChat?.name || 'Project Chat'}
          </h3>
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      {/* Additional header actions can be added here */}
    </div>
  </div>
);

export default ChatHeader;
