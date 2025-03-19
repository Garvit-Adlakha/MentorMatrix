/*import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#' },
        { label: 'Testimonials', href: '#' },
        { label: 'Roadmap', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About us', href: '#about' },
        { label: 'Careers', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Press', href: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#' },
        { label: 'Help center', href: '#' },
        { label: 'Privacy policy', href: '#' },
        { label: 'Terms of service', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-base-200 py-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold">Mentor Matrix</span>
            </Link>
            <p className="text-gray-500 max-w-sm">
              Transforming academic mentorship through secure collaboration and real-time project management.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-medium text-gray-800 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-gray-500 hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {currentYear} Mentor Matrix. All rights reserved.</p>

          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-primary">
              <i className="fab fa-twitter text-xl"></i>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary">
              <i className="fab fa-github text-xl"></i>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary">
              <i className="fab fa-linkedin text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
*/

import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-base-200 py-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold">Mentor Matrix</span>
            </Link>
            <p className="text-gray-500 max-w-sm">
              Transforming academic mentorship through secure collaboration and real-time project management.
            </p>
          </div>

          {[
            {
              title: 'Product',
              links: ['Features', 'Pricing', 'Testimonials', 'Roadmap'],
            },
            {
              title: 'Company',
              links: ['About us', 'Careers', 'Blog', 'Press'],
            },
            {
              title: 'Resources',
              links: ['Documentation', 'Help center', 'Privacy policy', 'Terms of service'],
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="font-medium text-gray-800 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((label) => (
                  <li key={label}>
                    <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider"></div>

        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-gray-500 text-center w-full">© 2025 Mentor Matrix. All rights reserved.</p>

          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-primary">
              <i className="fab fa-twitter text-xl"></i>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary">
              <i className="fab fa-github text-xl"></i>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary">
              <i className="fab fa-linkedin text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
