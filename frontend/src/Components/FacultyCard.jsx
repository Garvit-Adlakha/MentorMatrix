import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const FacultyCard = ({ faculty }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`card bg-base-100 shadow-md transition-all duration-300 ${isExpanded ? 'shadow-lg' : 'hover:shadow-lg'}`}>
      <div className="card-body p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          <div className="avatar">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              {faculty.image ? (
                <img src={faculty.image} alt={faculty.name} />
              ) : (
                <div className="flex items-center justify-center h-full text-xl font-semibold">
                  {faculty.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-semibold mb-1">{faculty.name}</h3>
            <p className="text-sm text-gray-500">{faculty.department}</p>
            <p className="text-sm text-primary font-medium">{faculty.specialization}</p>
            
            <button 
              className="btn btn-ghost btn-sm mt-2"
              onClick={toggleExpand}
            >
              {isExpanded ? 'Show less' : 'Learn more'}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 animate-fade-in">
            <h4 className="font-medium">Research Interests</h4>
            <ul className="list-disc list-inside text-sm text-gray-500 space-y-1 pl-2">
              {faculty.researchInterests.map((interest, index) => (
                <li key={index}>{interest}</li>
              ))}
            </ul>
            
            <Link to={faculty.proposalFormLink} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-primary btn-block mt-4">Send Project Proposal</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyCard;
