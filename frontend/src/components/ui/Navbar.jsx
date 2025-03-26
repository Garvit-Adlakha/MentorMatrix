import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import PropTypes from 'prop-types';

const navVariants = {
  hidden: { opacity: 0, y: -100 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const linkVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export const FloatingNav = ({
  navItems = [],
  className = ""
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current !== "number") return;
    
    const direction = current - scrollYProgress.getPrevious();
    const isAtTop = scrollYProgress.get() < 0.05;
    
    setVisible(!isAtTop && direction < 0);
  });

  return (
    <AnimatePresence mode="wait">
      <motion.nav
        role="navigation"
        aria-label="Main navigation"
        variants={navVariants}
        initial="hidden"
        animate={visible ? "visible" : "hidden"}
        className={cn(
          "fixed top-10 inset-x-0 mx-auto z-50",
          "max-w-fit flex items-center justify-center space-x-4",
          "rounded-full border border-transparent dark:border-white/20",
          "bg-white/80 dark:bg-black/80 backdrop-blur-md",
          "shadow-lg shadow-black/5 dark:shadow-white/5",
          "py-2 px-6",
          className
        )}
      >
        {navItems.map((navItem, idx) => (
          <motion.div
            key={`nav-item-${idx}`}
            variants={linkVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              href={navItem.link}
              className={cn(
                "relative flex items-center space-x-2",
                "text-neutral-600 dark:text-neutral-300",
                "hover:text-neutral-900 dark:hover:text-white",
                "transition-colors duration-200"
              )}
              aria-label={navItem.name}
            >
              <span className="block sm:hidden" aria-hidden="true">
                {navItem.icon}
              </span>
              <span className="hidden sm:block text-sm font-medium">
                {navItem.name}
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
            </Link>
          </motion.div>
        ))}
        
        <NavButton>
          <span>Login</span>
        </NavButton>
      </motion.nav>
    </AnimatePresence>
  );
};

const NavButton = ({ children }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={cn(
      "relative px-4 py-2 rounded-full",
      "text-sm font-medium",
      "bg-primary text-primary-foreground",
      "hover:bg-primary/90",
      "transition-colors duration-200",
      "focus:outline-none focus:ring-2 focus:ring-primary/50",
      "disabled:opacity-50 disabled:pointer-events-none"
    )}
  >
    {children}
    <motion.span
      className="absolute inset-x-0 mx-auto -bottom-px h-px bg-gradient-to-r from-transparent via-primary-foreground/50 to-transparent"
      initial={{ scaleX: 0 }}
      whileHover={{ scaleX: 1 }}
      transition={{ duration: 0.2 }}
    />
  </motion.button>
);

NavButton.propTypes = {
  children: PropTypes.node.isRequired,
};

FloatingNav.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
    })
  ),
  className: PropTypes.string,
};