import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedCard component - Provides consistent animations for cards across the application
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content inside the card
 * @param {string} props.className - Additional class names
 * @param {Function} props.onClick - onClick handler
 * @param {Object} props.variants - Custom animation variants
 * @param {number} props.delay - Animation delay
 * @param {string} props.as - Element type to render (default: div)
 * @param {Object} props.rest - Additional props
 */
const AnimatedCard = ({ 
  children, 
  className = '', 
  onClick, 
  variants,
  delay = 0,
  as = 'div',
  ...rest 
}) => {
  const defaultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        delay, 
        ease: "easeOut" 
      } 
    },
    hover: { 
      y: -5, 
      scale: 1.02, 
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 } 
    },
    tap: { 
      scale: 0.98, 
      transition: { duration: 0.1 } 
    }
  };

  const Component = motion[as] || motion.div;

  return (
    <Component
      initial="hidden"
      animate="visible"
      whileHover={onClick ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      variants={variants || defaultVariants}
      onClick={onClick}
      className={`bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};

/**
 * AnimatedContainer - A wrapper for groups of animated elements with staggered children
 */
export const AnimatedContainer = ({ 
  children, 
  className = '', 
  staggerChildren = 0.05,
  ...rest 
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren: 0.1,
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedItem - For use within AnimatedContainer for staggered animations
 */
export const AnimatedItem = ({ 
  children, 
  className = '', 
  ...rest 
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/**
 * FadeIn - Simple fade-in animation for content
 */
export const FadeIn = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  distance = 20,
  duration = 0.5,
  ...rest 
}) => {
  const getInitial = () => {
    switch(direction) {
      case 'up': return { opacity: 0, y: distance };
      case 'down': return { opacity: 0, y: -distance };
      case 'left': return { opacity: 0, x: distance };
      case 'right': return { opacity: 0, x: -distance };
      default: return { opacity: 0 };
    }
  };
  
  const getAnimate = () => {
    switch(direction) {
      case 'up': 
      case 'down': 
        return { opacity: 1, y: 0 };
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 };
      default: 
        return { opacity: 1 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      animate={getAnimate()}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut"
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;