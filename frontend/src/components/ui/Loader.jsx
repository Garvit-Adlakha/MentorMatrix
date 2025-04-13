import React from 'react';
import { motion } from 'framer-motion'; // Note: fixed the import
import { createPortal } from 'react-dom';

const Loader = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  // Size variants
  const sizeVariants = {
    sm: { dot: 'w-2 h-2', spacing: 'gap-1.5' },
    md: { dot: 'w-3 h-3', spacing: 'gap-2' },
    lg: { dot: 'w-4 h-4', spacing: 'gap-3' },
  };

  // Container classes based on fullScreen prop
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center';

  // Animation variants
  const bounceTransition = {
    duration: 0.7,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut'
  };

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center 90">
        {/* Three dots loader */}
        <div className={`flex ${sizeVariants[size].spacing}`}>
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={`${sizeVariants[size].dot} rounded-full bg-primary`}
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                ...bounceTransition,
                delay: index * 0.15,
              }}
            />
          ))}
        </div>
        
        {/* Text (if provided) */}
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 text-sm md:text-base text-muted-foreground font-medium"
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default Loader;
