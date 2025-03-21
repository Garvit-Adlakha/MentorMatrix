import React, { useState } from 'react';
import FacultyCard from './FacultyCard';

export const facultyData = [
  {
    id: 1,
    name: "Dr. Elizabeth Chen",
    department: "Computer Science",
    specialization: "Machine Learning & AI",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    researchInterests: [
      "Deep Learning Algorithms",
      "Natural Language Processing",
      "Computer Vision",
      "Ethical AI Development"
    ],
    proposalFormLink: "https://forms.google.com/your-form-link-here"
  },
  // Add other faculty objects here...
];

const FacultyCards = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaculty = facultyData.filter(faculty => 
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.researchInterests.some(interest => 
      interest.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div>
      <div className="relative max-w-md mx-auto mb-8">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          🔍
        </div>
        <input
          type="text"
          placeholder="Search faculty by name, department, or specialization..."
          className="input input-bordered w-full pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.length > 0 ? (
          filteredFaculty.map(faculty => (
            <FacultyCard key={faculty.id} faculty={faculty} />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No faculty members found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyCards;
