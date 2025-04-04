import { Navbar } from "./Navbar";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Link } from "react-router-dom";

const Header = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full h-20 flex items-center z-40 transition-all duration-500  ${
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-lg"
          : "bg-gradient-to-b from-background to-background/50"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-shrink-0"
        >
          <a href="/" className="group flex items-center space-x-2">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="https://i0.wp.com/sacredformation.com/wp-content/uploads/2024/01/6.png?resize=300%2C300&ssl=1"
                width={90}
                height={90}
                alt="MentorMatrix Logo"
                className="transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
              />
              <motion.div
                className="absolute -bottom-1 left-0 h-1 bg-primary"
                initial={{ width: "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </a>
        </motion.div>

        {/* Navigation Section */}
        <div className="flex-1 flex justify-center">
          <nav className="hidden md:flex space-x-10">
            <Navbar navOpen={navOpen} />
          </nav>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 rounded-lg hover:bg-accent/50 transition-colors"
            onClick={() => setNavOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={navOpen}
          >
            <AnimatePresence mode="wait">
              {navOpen ? (
                <motion.div
                  key="icon-x"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconX size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="icon-menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconMenu2 size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/login"
            className="btn btn-outline bg-gradient-to-r from-primary to-primary/70 hover:bg-slate-800 text-white px-6 py-2 rounded-lg max-md:hidden 
            transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            Login
          </Link>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
