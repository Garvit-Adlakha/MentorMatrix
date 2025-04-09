import React from 'react';
import { motion } from 'motion/react';

const Loader = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  // Size variants
  const sizeVariants = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  // Container classes based on fullScreen prop
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center">
        {/* Modern pulsating loader */}
        <div className={`${sizeVariants[size]} relative`}>
          {/* Multiple pulsating circles */}
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 rounded-full bg-primary/20"
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{
                scale: [0.1, 1],
                opacity: [0.8, 0]
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: index * 0.6,
                ease: "easeOut"
              }}
            />
          ))}
          
          {/* Center static circle */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full"
            style={{
              width: size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px',
              height: size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px',
            }}
            animate={{
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
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