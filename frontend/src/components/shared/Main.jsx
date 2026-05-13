import React from 'react';
import { IconArrowRight, IconArrowUpRight, IconCircleCheck } from "@tabler/icons-react";
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

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

  const navigate=useNavigate()
  const clickHandler=()=>{
    navigate('/mentor')
  }

  return (
    <section className="landing-hero">
      <div className="landing-bg">
        <div className="landing-orb landing-orb--one" />
        <div className="landing-orb landing-orb--two" />
        <div className="landing-orb landing-orb--three" />
        <div className="landing-grid" />
      </div>

      <div className="landing-container">
        <motion.div
          className="landing-stack"
          initial="initial"
          animate="animate"
        >
          <motion.div
            {...fadeInUp}
            className="landing-pill"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="landing-pill-dot"
            />
            Transforming Project Mentorship
          </motion.div>

          <motion.h1
            {...fadeInUp}
            className="landing-title"
          >
            Connect, Collaborate,<br />
            <span className="landing-title-accent">Create Excellence</span>
          </motion.h1>

          <motion.p
            {...fadeInUp}
            className="landing-subtitle"
          >
            A streamlined platform connecting mentors and students for exceptional project development and knowledge transfer.
          </motion.p>

          <motion.div
            {...fadeInUp}
            className="landing-cta"
          >
            <button
              className="landing-btn landing-btn--primary"
              onClick={clickHandler}
            >
              Get Started
              <IconArrowRight className="landing-btn-icon" />
            </button>
            <button className="landing-btn landing-btn--ghost">
              Learn More
              <IconArrowUpRight className="landing-btn-icon" />
            </button>
          </motion.div>

          <motion.div
            {...fadeInUp}
            className="landing-trust"
          >
            {trustPoints.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="landing-trust-card"
              >
                <span className="landing-trust-icon">{item.icon}</span>
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