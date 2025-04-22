import { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import authService from "../../service/authService";

export const Navbar = ({ navOpen }) => {
  const lastActiveLink = useRef(null);
  const activeBox = useRef(null);
  const navRef = useRef(null);
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();
  
  const { data: user } = useSuspenseQuery({
    queryKey: ["user"],
    queryFn: () => authService.currentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
  });
  
  // Define navigation items based on authentication status
  const getNavItems = () => {
    const items = [
      { label: "Home", link: "/", className: "nav-link", id: "home" },
      { label: "Mentor", link: "/mentor", className: "nav-link", id: "mentor" },
    ];
    
    // Add authenticated-only routes
    if (user) {
      items.push(
        { label: "Dashboard", link: "/dashboard", className: "nav-link", id: "dashboard" },
        { label: "Collaborate", link: "/collaborate", className: "nav-link", id: "collaborate" },
        { label: "Profile", link: "/profile", className: "nav-link", id: "profile" }
      );
    }
    
    return items;
  };

  const navItems = getNavItems();

  // Initialize the active box position with proper containment
  const initActiveBox = () => {
    if (lastActiveLink.current && activeBox.current && !navOpen) {
      // Get the nav container's position for relative calculations
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = lastActiveLink.current.getBoundingClientRect();
      
      // Calculate position relative to the nav container
      const top = linkRect.top - navRect.top;
      const left = linkRect.left - navRect.left;
      
      // Apply the calculated positions with a small padding
      activeBox.current.style.top = `${top - 2}px`;
      activeBox.current.style.left = `${left - 2}px`;
      activeBox.current.style.width = `${linkRect.width + 4}px`;
      activeBox.current.style.height = `${linkRect.height + 4}px`;
      activeBox.current.style.opacity = '1';
    } else if (activeBox.current && navOpen) {
      // Hide the active box in mobile view
      activeBox.current.style.opacity = '0';
    }
  };

  // Handle link click
  const handleLinkClick = (event, id) => {
    if (lastActiveLink.current) {
      lastActiveLink.current.classList.remove("active");
    }
    
    // Use currentTarget instead of target to ensure we get the Link element
    event.currentTarget.classList.add("active");
    lastActiveLink.current = event.currentTarget;
    setActiveSection(id);
    
    // Small delay to allow for any animations/state changes
    setTimeout(initActiveBox, 50);
  };
  // Update active section based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Direct path matching to ensure accuracy
    if (currentPath === "/") {
      setActiveSection("home");
    } else if (currentPath === "/mentor") {
      setActiveSection("mentor");
    } else if (currentPath === "/dashboard") {
      setActiveSection("dashboard");
    } else if (currentPath.startsWith("/chat")) {
      setActiveSection("chat");
    } else if (currentPath === "/profile") {
      setActiveSection("profile");
    }
  }, [location.pathname]);

  // Update the active link and box when the active section changes
  useEffect(() => {
    const linkSelector = activeSection.startsWith('#') 
      ? `a[href="${activeSection}"]` 
      : `a[href="/${activeSection === 'home' ? '' : activeSection}"]`;
      
    const activeLink = document.querySelector(linkSelector);
    
    if (activeLink) {
      if (lastActiveLink.current) {
        lastActiveLink.current.classList.remove("active");
      }
      activeLink.classList.add("active");
      lastActiveLink.current = activeLink;
      
      // Small delay to ensure DOM is updated
      setTimeout(initActiveBox, 50);
    }
  }, [activeSection]);

  // Initialize the active box on mount and when navOpen changes
  useEffect(() => {
    // Find the initial active link based on current path
    const initialLink = document.querySelector(`a[href="${location.pathname}"]`) || 
                        document.querySelector('a[href="/"]');
                         
    if (initialLink) {
      initialLink.classList.add("active");
      lastActiveLink.current = initialLink;
      
      // Small delay to ensure DOM is updated
      setTimeout(initActiveBox, 50);
    }
  }, [location.pathname, navOpen]);

  // Update active box position when window is resized
  useEffect(() => {
    const handleResize = () => {
      initActiveBox();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <nav 
      ref={navRef} 
      className={`navbar relative ${
        navOpen 
          ? "active flex flex-col items-center space-y-4 py-4 " 
          : "flex items-center space-x-4"
      }`}
    >
      {navItems.map(({ label, link, className, id }, key) => (
        <Link
          to={link}
          key={key}
          className={`${className} px-4 py-2 rounded-lg transition-all duration-300 hover:bg-accent/10 
            ${navOpen ? 'w-full text-center' : ''} 
            ${activeSection === id ? 'text-primary font-medium' : 'text-foreground/80'}`}
          onClick={(e) => handleLinkClick(e, id)}
        >
          {label}
        </Link>
      ))}
      <div 
        className="active-box absolute bg-accent/20 rounded-lg transition-all duration-300 z-0" 
        ref={activeBox} 
        style={{ opacity: navOpen ? 0 : 1 }}
      />
    </nav>
  );
};

Navbar.propTypes = {
  navOpen: PropTypes.bool.isRequired,
};

export default Navbar;