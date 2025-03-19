import React from 'react';
import { IconArrowRight, IconArrowUpRight, IconCircleCheck } from "@tabler/icons-react";
import { motion } from 'framer-motion';

const Main = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const trustPoints = [
    { text: "Secure interaction channels", icon: <IconCircleCheck /> },
    { text: "Real-time collaboration", icon: <IconCircleCheck /> },
    { text: "Progress tracking & insights", icon: <IconCircleCheck /> }
  ];

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Enhanced background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-background to-background"></div>
      
      {/* Animated background shapes */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-20 right-0 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute bottom-20 left-10 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-2xl"
      />
      
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="flex flex-col items-center text-center"
          initial="initial"
          animate="animate"
        >
          {/* Enhanced tag line */}
          <motion.div 
            {...fadeInUp}
            className="inline-flex items-center rounded-full border border-primary/20 bg-background/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-muted-foreground mb-8 hover:border-primary/40 transition-colors"
          >
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex h-2 w-2 rounded-full bg-primary mr-2"
            />
            Transforming Project Mentorship
          </motion.div>

          {/* Enhanced main title */}
          <motion.h1 
            {...fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight md:leading-tight mb-8"
          >
            Connect, Collaborate, <br className="hidden md:block" />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Create Excellence
            </span>
          </motion.h1>

          {/* Enhanced subtitle */}
          <motion.p 
            {...fadeInUp}
            className="max-w-xl text-lg md:text-xl text-muted-foreground mb-12"
          >
            A streamlined platform connecting mentors and students for exceptional project development and knowledge transfer.
          </motion.p>

          {/* Enhanced CTA buttons */}
          <motion.div 
            {...fadeInUp}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <button className="btn bg-primary text-white hover:bg-primary/90 font-medium group px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              Get Started
              <IconArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button className="btn bg-background border-2 border-primary/20 hover:border-primary/40 font-medium group px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              Learn More
              <IconArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Enhanced trust points */}
          <motion.div 
            {...fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-3xl"
          >
            {trustPoints.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center gap-3 text-sm font-medium p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-colors"
              >
                <span className="text-primary">{item.icon}</span>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Main;