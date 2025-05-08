"use client";
import React from "react";
import { motion } from "motion/react";
import { LampContainer } from "./lamp";

export const LampDemo = ({ children }) => {
  return (
    <LampContainer className="min-h-[60vh]">
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        Collaboration Hub
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.5,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-4 text-slate-400 text-center text-lg md:text-xl max-w-lg mb-8"
      >
        Connect and create excellence together
      </motion.p>
      <div className="mt-2 md:mt-8 w-full flex flex-col items-center">{children}</div>
    </LampContainer>
  );
};

export default LampDemo;