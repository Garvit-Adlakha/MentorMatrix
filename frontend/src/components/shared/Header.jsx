import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./Navbar";
import { 
  IconMenu2,
  IconX, 
  IconChevronDown, 
  IconUser,
  IconLogout
} from "../ui/Icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import authService from "../../service/authService";
import toast from "react-hot-toast";

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

  const QueryClient=useQueryClient()

  const logoutMutation=useMutation({
    mutationFn:()=>authService.logout(),
    onSuccess:()=>{
      setProfileOpen(false);
      setNavOpen(false);
      toast.success("Logged out successfully");
      QueryClient.removeQueries(['user']);
      navigate("/login");
    },
    onError:(error)=>{
      toast.error(error.response.data.message || "Logout failed. Please try again.");
    }
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
      logoutMutation.mutateAsync()
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
      className={`app-header ${
        scrolled
          ? "app-header--scrolled"
          : ""
      } ${user?.role === 'admin' ? 'app-header--admin' : ''}`}
    >
      <div className="app-header-inner">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="app-logo"
        >
          <div className="group relative cursor-default select-none">
            <div className="flex items-center">
              {/* <img
                src="/logo-2.png"
                alt="MentorMatrix Logo"
                className="h-16 w-auto mr-3 transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              /> */}
              <span className={`app-logo-text ${
                user?.role === 'admin' 
                  ? 'app-logo-text--admin'
                  : ''
              }`}>
                Mentor Matrix {user?.role === 'admin' && <span className="text-sm font-normal">Admin</span>}
              </span>
              <motion.div
                className="app-logo-underline"
                initial={{ width: "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Navigation Section */}
        <div className="app-header-nav">
          <nav className="app-header-nav-desktop">
            <Navbar navOpen={false} />
          </nav>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="app-nav-toggle"
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
          className="app-header-actions"
        >
          {!user ? (
            <Link
              to="/login"
              className="app-login"
            >
              <IconUser size={18} />
              <span>Login</span>
            </Link>
          ) : (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.07, boxShadow: '0 4px 24px 0 rgba(80,80,180,0.10)' }}
                whileTap={{ scale: 0.97 }}
                className="app-user-button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                tabIndex={0}
              >
                <div className="app-user-avatar">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name);
                      }}
                    />
                  ) : (
                    <span className="app-user-initials">
                      {getInitials(user.name)}
                    </span>
                  )}
                </div>
                <span className="app-user-name">{user.name}</span>
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
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="app-user-menu"
                    onMouseLeave={() => setProfileOpen(false)}
                    tabIndex={-1}
                  >
                    <div className="relative">
                      <div className="app-user-menu-arrow"></div>
                    </div>
                    <div className="app-user-menu-header">
                      <div className="app-user-menu-avatar">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name);
                            }}
                          />
                        ) : (
                          <span className="app-user-initials">
                            {getInitials(user.name)}
                          </span>
                        )}
                      </div>
                      <h4 className="app-user-menu-name">{user.name}</h4>
                      <p className="app-user-menu-email">{user.email}</p>
                    </div>
                    <div className="app-user-menu-actions">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="app-user-logout"
                        onClick={logoutHandler}
                        tabIndex={0}
                      >
                        <IconLogout size={18} />
                        Logout
                      </motion.button>
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
            className="app-mobile-menu"
          >
            <div className="app-mobile-menu-inner">
              <Navbar navOpen={navOpen} />
              <div className="app-mobile-actions">
                {!user ? (
                  <Link
                    to="/login"
                    className="app-login app-login--mobile"
                    onClick={() => setNavOpen(false)}
                  >
                    <IconUser size={18} />
                    <span>Login</span>
                  </Link>
                ) : (
                  <div className="app-mobile-user">
                    <div className="app-mobile-user-card">
                      <div className="app-mobile-user-avatar">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="app-user-initials">
                            {getInitials(user.name)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="app-mobile-user-name">{user.name}</h4>
                        <p className="app-mobile-user-email">{user.email}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="app-user-logout app-user-logout--mobile"
                      onClick={() => {
                        logoutHandler();
                        setNavOpen(false);
                      }}
                      tabIndex={0}
                    >
                      <IconLogout size={18} />
                      Logout
                    </motion.button>
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
