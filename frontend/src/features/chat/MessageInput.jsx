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
    <div className="chat-input">
      {attachment && (
        <div className="chat-attachment">
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
            className="chat-input-field"
          />
          <button 
            className="chat-emoji-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-label="Emoji picker"
          >
            <IconMoodSmile size={18} />
          </button>
        </div>
        <label className="chat-attach-btn">
          <input 
            type="file" 
            onChange={handleAttachment} 
            className="hidden" 
          />
          <IconPaperclip size={18} />
        </label>
        <label className="chat-attach-btn">
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
          className="chat-send-btn"
        >
          {mutation.isLoading ? (
            <IconLoader2 size={18} className="animate-spin" aria-label="Sending..." />
          ) : (
            <IconSend size={18} />
          )}
        </button>
      </div>
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="chat-emoji-panel">
          <div className="grid grid-cols-8 gap-1">
            {['😀', '😂', '😍', '🤔', '😎', '👍', '❤️', '🔥'].map(emoji => (
              <button 
                key={emoji} 
                onClick={() => handleEmojiClick(emoji)}
                className="p-1 hover:bg-neutral-700 rounded transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowEmojiPicker(false)}
            className="mt-2 text-xs text-neutral-400 hover:text-white"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
