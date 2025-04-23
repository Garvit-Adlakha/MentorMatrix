import { cn } from "../../libs/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export const HoverEffect = ({
  items,
  className,
}) => {
  let [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10 gap-4",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          href={item?.link}
          key={item?.id || idx}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          data-idx={idx}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <ProjectCard item={item} />
        </a>
      ))}
    </div>
  );
};

export const ProjectCard = ({
  item,
  className,
}) => {
  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60';
      case 'rejected':
        return 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60';
      default:
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60';
    }
  };

  // Get status dot color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500';
      case 'rejected':
        return 'bg-rose-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-amber-500';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    if (status === 'approved') return 'Active';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-white/[0.08] dark:border-white/[0.12] group-hover:border-slate-600 relative z-20 shadow-md backdrop-blur-sm transition-all duration-300 ",
        className
      )}
    >
      <div className="relative z-50 flex flex-col h-full">
        <div className="p-4 flex-1">
          {/* Card header with status */}
          {item.status && (
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(item.status)} animate-pulse`}></span>
                <span className={`text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1 font-medium shadow-sm ${getStatusBadgeClasses(item.status)}`}>
                  {getStatusText(item.status)}
                </span>
              </div>
            </div>
          )}
          
          {/* Card title */}
          <CardTitle className="text-lg">{item.title}</CardTitle>
          
          {/* Meta information (student/faculty name, date) */}
          {(item.studentName || item.facultyName || item.createdAt) && (
            <div className="flex flex-col gap-1.5 my-4 text-gray-400 opacity-70">
              {item.studentName && (
                <p className="text-sm font-medium break-words line-clamp-1 hover:line-clamp-none transition-all">
                  Student: <span className="text-gray-300">{item.studentName}</span>
                </p>
              )}
              
              {item.facultyName && (
                <p className="text-sm font-medium break-words line-clamp-1 hover:line-clamp-none transition-all">
                  Mentor: <span className="text-gray-300">{item.facultyName || 'Unassigned'}</span>
                </p>
              )}
              
              {item.createdAt && (
                <div className="flex items-center gap-1.5 mt-1 text-xs">
                  <CalendarIcon size={14} className="opacity-70" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Card description */}
          <CardDescription className="text-zinc-400  transition-all">{item.description}</CardDescription>
        </div>
        
        {/* Call to action button */}
        <div className="p-4 pt-0 mt-auto">
          <div className="pt-4 border-t border-zinc-800/50">
            <button 
              className="w-full px-4 py-2.5 rounded-lg bg-black/10 hover:bg-black/80 text-primary border border-primary/30 transition-all duration-200 text-sm font-medium inline-flex items-center justify-center gap-2 group hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1"
              aria-label={`View details for project: ${item.title}`}
              tabIndex={0}
            >
              View Details
              <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}) => {
  return (
    <h4 className={cn("text-zinc-100 font-bold tracking-wide text-xl mt-2", className)}>
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}) => {
  return (
    <p
      className={cn(
        "mt-4 text-zinc-400 tracking-wide leading-relaxed text-sm line-clamp-3",
        className
      )}
    >
      {children}
    </p>
  );
};

// Simple icons for the card
const CalendarIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icon-tabler-calendar">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z"></path>
    <path d="M16 3v4"></path>
    <path d="M8 3v4"></path>
    <path d="M4 11h16"></path>
    <path d="M11 15h1"></path>
    <path d="M12 15v3"></path>
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`icon icon-tabler icon-tabler-arrow-right ${className}`}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M5 12l14 0"></path>
    <path d="M13 18l6 -6"></path>
    <path d="M13 6l6 6"></path>
  </svg>
);