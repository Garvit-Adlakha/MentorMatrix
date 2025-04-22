import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import { 
  IconMenu2,
  IconX, 
  IconChevronDown, 
  IconUser,
  IconLogout,
  IconSettings,
  IconDashboard,
  IconMessageCircle 
} from "../ui/Icons";
import {  useQuery } from "@tanstack/react-query";
import authService from "../../service/authService";

const Header = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

    const {data:user,isLoading:userLoading}=useQuery({
    queryKey: ['user'],
    queryFn: () => authService.currentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    })


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  if(userLoading){
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  


  const logoutHandler = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/80 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center"
        >
          <a href="/" className="group relative">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="MentorMatrix Logo"
                className="h-10 w-auto mr-3 transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MentorMatrix
              </span>
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                initial={{ width: "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </a>
        </motion.div>

        {/* Navigation Section */}
        <div className="justify-center">
          <nav className="hidden md:flex">
            <Navbar navOpen={false} />
          </nav>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
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

        {/* Login/Logout Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {!user ? (
            <Link
              to="/login"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <IconUser size={18} />
              <span className="font-medium">Login</span>
            </Link>
          ) : (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all duration-300"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name);
                      }}
                    />
                  ) : (
                    <span className="font-medium text-primary">
                      {getInitials(user.name)}
                    </span>
                  )}
                </div>
                <span className="font-medium">{user.name}</span>
                <motion.div
                  animate={{ rotate: profileOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <IconChevronDown size={16} />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 origin-top-right bg-card shadow-lg rounded-xl overflow-hidden border border-border/50 z-50"
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <div className="p-4 border-b border-border/20">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name);
                              }}
                            />
                          ) : (
                            <span className="font-medium text-primary text-lg">
                              {getInitials(user.name)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-medium text-foreground truncate">
                            {user.name}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <IconDashboard size={18} className="text-primary" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/collaborate"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <IconMessageCircle size={18} className="text-primary" />
                        <span className="font-medium">Collaboration Hub</span>
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <IconUser size={18} className="text-primary" />
                        <span className="font-medium">My Profile</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <IconSettings size={18} className="text-primary" />
                        <span className="font-medium">Settings</span>
                      </Link>
                    </div>

                    <div className="p-2 border-t border-border/20">
                      <button
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                        onClick={logoutHandler}
                      >
                        <IconLogout size={18} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute top-20 left-0 w-full bg-card/95 backdrop-blur-md shadow-lg border-t border-border/20 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <Navbar navOpen={navOpen} />
              <div className="mt-4 flex flex-col gap-2">
                {!user ? (
                  <Link
                    to="/login"
                    className="btn bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg 
                    flex items-center justify-center gap-2 w-full transition-all duration-300"
                    onClick={() => setNavOpen(false)}
                  >
                    <IconUser size={18} />
                    <span className="font-medium">Login</span>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <div className="p-4 bg-primary/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="font-medium text-primary text-lg">
                              {getInitials(user.name)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors w-full"
                      onClick={() => setNavOpen(false)}
                    >
                      <IconDashboard size={18} className="text-primary" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors w-full"
                      onClick={() => setNavOpen(false)}
                    >
                      <IconUser size={18} className="text-primary" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors w-full"
                      onClick={() => {
                        logoutHandler();
                        setNavOpen(false);
                      }}
                    >
                      <IconLogout size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
