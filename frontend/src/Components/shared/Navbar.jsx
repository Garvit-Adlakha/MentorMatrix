import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4',
        isScrolled ? 'glass-morphism' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-primary rounded-md rotate-45 animate-pulse"></div>
                <div className="absolute inset-1 bg-white rounded-sm rotate-45"></div>
                <div className="absolute inset-[6px] bg-primary rounded-sm rotate-45"></div>
              </div>
              <span className="font-bold text-xl tracking-tight">Mentor Matrix</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#contact">Contact</NavLink>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="font-medium transition-all hover:scale-105">
                Log In
              </Button>
              <Button size="sm" className="font-medium transition-all hover:scale-105">
                Get Started
              </Button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'fixed inset-0 top-16 z-40 bg-background/80 backdrop-blur-lg md:hidden transition-transform duration-300 ease-in-out',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <nav className="flex flex-col items-center justify-center h-full space-y-8 p-4">
          <MobileNavLink href="#features" onClick={toggleMenu}>Features</MobileNavLink>
          <MobileNavLink href="#about" onClick={toggleMenu}>About</MobileNavLink>
          <MobileNavLink href="#contact" onClick={toggleMenu}>Contact</MobileNavLink>
          <div className="flex flex-col w-full space-y-4 pt-4">
            <Button variant="outline" className="w-full font-medium">
              Log In
            </Button>
            <button className="btn w-full font-medium">
              Get Started
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

const NavLink = ({ href, children, className }) => {
  return (
    <a
      href={href}
      className={cn(
        'relative text-sm font-medium text-foreground transition-colors hover:text-primary before:absolute before:bottom-0 before:left-0 before:right-0 before:h-px before:origin-right before:scale-x-0 before:bg-primary before:transition-transform before:duration-300 hover:before:origin-left hover:before:scale-x-100',
        className
      )}
    >
      {children}
    </a>
  );
};

const MobileNavLink = ({ href, onClick, children }) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className="w-full text-center py-3 text-lg font-medium text-foreground transition-colors hover:text-primary"
    >
      {children}
    </a>
  );
};

export default Navbar;
