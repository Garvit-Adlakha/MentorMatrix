import { Navbar } from "./Navbar";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import authService from "../../service/authService";

const Header = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const queryClient=useQueryClient();
  const {data:user}=useQuery({
    queryKey: ["user"],
    queryFn: () => authService.currentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
  })

  const logoutMutation=useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: (data) => {
      console.log("Logout successful:", data);

      queryClient.invalidateQueries(['user'])
      queryClient.removeQueries(['user'])
      queryClient.invalidateQueries(['projects'])
      // Redirect to home page or show a success message
      navigate("/");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Handle error (e.g., show a notification)
    },
  })

  const logoutHandler = (e) => {
    e.preventDefault();
    logoutMutation.mutate();
  }


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
          <a className="group flex items-center space-x-2">
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
        <div className=" justify-center">
          <nav className="hidden md:flex">
            <Navbar navOpen={false} />
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

        {/* Login/Logout Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!user ? (
            <Link
              to="/login"
              className="btn btn-outline bg-gradient-to-r from-primary to-primary/70 hover:bg-slate-800 text-white px-6 py-2 rounded-lg max-md:hidden 
              transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              Login
            </Link>
          ) : (
            <button
              className="btn btn-outline bg-gradient-to-r from-primary to-primary/70 hover:bg-slate-800 text-white px-6 py-2 rounded-lg max-md:hidden 
              transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              onClick={logoutHandler}
              aria-label="Logout"
            >
              Logout
            </button>
          )}
        </motion.div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute top-20 left-0 w-full bg-background/95 backdrop-blur-md shadow-lg rounded-b-lg overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <Navbar navOpen={navOpen} />
              <div className="mt-4 flex justify-center">
                {!user ? (
                  <Link
                    to="/login"
                    className="btn btn-outline bg-gradient-to-r from-primary to-primary/70 hover:bg-slate-800 text-white px-6 py-2 rounded-lg 
                    transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 w-full text-center"
                  >
                    Login
                  </Link>
                ) : (
                  <div className="w-full flex flex-col space-y-2">
                    <Link
                      to="/profile"
                      className="btn btn-outline bg-gradient-to-r from-secondary to-secondary/70 hover:bg-slate-800 text-white px-6 py-2 rounded-lg 
                      transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 w-full text-center"
                    >
                      Profile
                    </Link>
                    <button
                      className="btn btn-outline bg-gradient-to-r from-primary to-primary/70 hover:bg-slate-800 text-white px-6 py-2 rounded-lg 
                      transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 w-full"
                      onClick={logoutHandler}
                      aria-label="Logout"
                    >
                      Logout
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
