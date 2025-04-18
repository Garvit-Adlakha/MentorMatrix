import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const Footer = () => {
  return (
    <footer className="bg-card/50 backdrop-blur-sm border-t border-border/30 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Mentor Matrix</span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Transforming academic mentorship through secure collaboration and real-time project management between students and faculty.
            </p>
            
            <div className="flex space-x-4 mt-6">
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://github.com/Garvit-Adlakha/MentorMatrix" 
                className="h-10 w-10 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </motion.a>
              
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }}
                href="mailto:support@mentormatrix.edu" 
                className="h-10 w-10 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </motion.a>
            </div>
          </div>

          {[
            {
              title: "Platform",
              links: [
                { label: "Find Mentors", href: "/mentors" },
                { label: "Project Management", href: "/dashboard" },
                { label: "Real-time Collaboration", href: "/collaboration" },
                { label: "Schedule Meetings", href: "/meetings" }
              ]
            },
            {
              title: "Resources",
              links: [
                { label: "Documentation", href: "/docs" },
                { label: "API Reference", href: "/api-docs" },
                { label: "Help Center", href: "/help" },
                { label: "Project Examples", href: "/examples" }
              ]
            },
            {
              title: "Legal",
              links: [
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Academic Integrity", href: "/academic-integrity" },
                { label: "Accessibility", href: "/accessibility" }
              ]
            },
          ].map((section, idx) => (
            <div key={section.title}>
              <h3 className="font-medium text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <motion.li 
                    key={link.label}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <a 
                      href={link.href} 
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 Mentor Matrix. All rights reserved. Academic mentorship platform connecting students with faculty experts.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
