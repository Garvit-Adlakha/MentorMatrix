import React, { useState } from 'react';
import { IconPaperclip, IconCamera, IconSend, IconMoodSmile, IconX, IconLoader2 } from '../../components/ui/Icons';

const MessageInput = ({
  newMessage,
  setNewMessage,
  messageInputRef,
  handleTyping,
  sendMessage,
  attachment,
  setAttachment,
  handleAttachment,
  socketConnected,
  mutation
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    messageInputRef.current?.focus();
  };

  return (
    <div className="border-t border-neutral-700/30 p-3 bg-neutral-800/80 backdrop-blur-md">
      {attachment && (
        <div className="flex items-center justify-between bg-neutral-700/30 p-2 rounded-lg mb-3">
          <span className="text-sm truncate">{attachment.name}</span>
          <button 
            onClick={() => setAttachment(null)}
            aria-label="Remove attachment"
            className="ml-2 text-neutral-400 hover:text-white flex items-center justify-center"
          >
            <IconX size={16} />
          </button>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            ref={messageInputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            onInput={handleTyping}
            placeholder="Type a message..."
            className="flex-1 w-full px-4 py-3 bg-neutral-700/30 border border-neutral-700/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
          />
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-label="Emoji picker"
          >
            <IconMoodSmile size={18} />
          </button>
        </div>
        
        <label className="p-3 bg-neutral-700/50 text-neutral-300 rounded-lg hover:bg-neutral-700/80 cursor-pointer flex items-center justify-center transition-colors">
          <input 
            type="file" 
            onChange={handleAttachment} 
            className="hidden" 
          />
          <IconPaperclip size={18} />
        </label>
        
        <label className="p-3 bg-neutral-700/50 text-neutral-300 rounded-lg hover:bg-neutral-700/80 cursor-pointer flex items-center justify-center transition-colors">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAttachment}
            className="hidden" 
          />
          <IconCamera size={18} />
        </label>
        
        <button
          onClick={sendMessage}
          aria-label="Send message"
         
          className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {mutation.isLoading ? (
            <IconLoader2 size={18} className="animate-spin" aria-label="Sending..." />
          ) : (
            <IconSend size={18} />
          )}
        </button>
      </div>
      
      {/* Here you would implement or integrate an actual emoji picker component */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg p-2 z-10">
          {/* This is just a placeholder. You should integrate a proper emoji picker library */}
          <div className="grid grid-cols-8 gap-1">
            {['😀', '😂', '😍', '🤔', '😎', '👍', '❤️', '🔥'].map(emoji => (
              <button 
                key={emoji} 
                onClick={() => handleEmojiClick(emoji)}
                className="p-1 hover:bg-neutral-700 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
