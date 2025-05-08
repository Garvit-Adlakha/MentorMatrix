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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/80 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      } ${user?.role === 'admin' ? 'bg-primary/5 border-b border-primary/10' : ''}`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center"
        >
          <div className="group relative cursor-default select-none">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="MentorMatrix Logo"
                className="h-10 w-auto mr-3 transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className={`text-xl font-bold ${
                user?.role === 'admin' 
                  ? 'text-primary' 
                  : 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'
              }`}>
                MentorMatrix {user?.role === 'admin' && <span className="text-sm font-normal">Admin</span>}
              </span>
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                initial={{ width: "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
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
                whileHover={{ scale: 1.07, boxShadow: '0 4px 24px 0 rgba(80,80,180,0.10)' }}
                whileTap={{ scale: 0.97 }}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 border border-primary/20 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                tabIndex={0}
              >
                <div className="h-9 w-9 rounded-full ring-2 ring-primary/30 bg-primary/20 flex items-center justify-center overflow-hidden shadow-md">
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
                    <span className="font-medium text-primary">
                      {getInitials(user.name)}
                    </span>
                  )}
                </div>
                <span className="font-medium text-foreground/90 max-w-[100px] truncate">{user.name}</span>
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
                    className="absolute right-0 mt-3 w-64 origin-top-right bg-gradient-to-br from-background/95 to-card/90 shadow-2xl rounded-2xl overflow-hidden border border-primary/20 z-50 backdrop-blur-xl"
                    onMouseLeave={() => setProfileOpen(false)}
                    tabIndex={-1}
                  >
                    <div className="relative">
                      <div className="absolute -top-2 right-8 w-4 h-4 bg-background rotate-45 border-t border-l border-primary/20 z-10"></div>
                    </div>
                    <div className="p-5 border-b border-border/20 bg-primary/5 flex flex-col items-center gap-2">
                      <div className="h-14 w-14 rounded-full ring-2 ring-primary/30 bg-primary/20 flex items-center justify-center overflow-hidden shadow-md mb-1">
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
                          <span className="font-medium text-primary text-lg">
                            {getInitials(user.name)}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-foreground truncate w-full text-center">{user.name}</h4>
                      <p className="text-xs text-muted-foreground truncate w-full text-center">{user.email}</p>
                    </div>
                    <div className="p-3">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex w-full items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-destructive/10 to-destructive/20 hover:from-destructive/20 hover:to-destructive/30 text-destructive font-semibold transition-colors justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-destructive/30"
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
            className="md:hidden absolute top-20 left-0 w-full bg-card/95 backdrop-blur-md shadow-lg border-t border-border/20 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <Navbar navOpen={navOpen} />
              <div className="mt-4 flex flex-col gap-2">
                {!user ? (
                  <Link
                    to="/login"
                    className="btn bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 w-full transition-all duration-300"
                    onClick={() => setNavOpen(false)}
                  >
                    <IconUser size={18} />
                    <span className="font-medium">Login</span>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl flex items-center gap-3 shadow-sm">
                      <div className="h-12 w-12 rounded-full ring-2 ring-primary/30 bg-primary/20 flex items-center justify-center overflow-hidden shadow-md">
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
                        <h4 className="font-medium text-foreground/90">{user.name}</h4>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-destructive/10 to-destructive/20 hover:from-destructive/20 hover:to-destructive/30 text-destructive font-semibold transition-colors w-full justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-destructive/30"
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
