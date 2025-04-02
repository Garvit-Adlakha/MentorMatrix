import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import ProjectForm from '../components/ProjectForm';

// Mock student data
const studentData = {
  id: 1,
  name: "Alex Johnson",
  email: "alex.johnson@university.edu",
  major: "Computer Science",
  batch: "2021-2025",
  rollNumber: "CS21-045",
  profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  bio: "Passionate about software development and machine learning. Looking to collaborate on innovative projects that solve real-world problems."
};

const Profile = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
    
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left sidebar - Student details */}
          <div className="md:col-span-1">
            <div className="card bg-base-100 shadow-xl p-6">
              <figure>
                <img src={studentData.profileImage} alt={studentData.name} className="rounded-full w-24 h-24" />
              </figure>
              <div className="card-body items-center text-center">
                <h2 className="card-title">{studentData.name}</h2>
                <div className="badge badge-outline">Student</div>
                <p>{studentData.email}</p>
                <p>{studentData.major}</p>
                <p>Roll: {studentData.rollNumber}</p>
                <p>Batch: {studentData.batch}</p>
                <div className="card-actions mt-4 flex flex-col w-full">
                  <button className="btn btn-primary w-full" onClick={() => setIsFormOpen(true)}>Create Project Proposal</button>
                  <button className="btn btn-outline w-full" onClick={() => navigate('/faculty')}>Find Mentor</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio section */}
            <div className="card bg-base-100 shadow-xl p-6">
              <div className="card-body">
                <h2 className="card-title">About Me</h2>
                <p>{studentData.bio}</p>
              </div>
            </div>
            
            {/* Recent Proposals section */}
            <div className="card bg-base-100 shadow-xl p-6">
              <div className="card-body text-center">
                <h2 className="card-title">Recent Project Proposals</h2>
                <p>You haven't submitted any project proposals yet.</p>
                <button className="btn btn-link" onClick={() => setIsFormOpen(true)}>Create your first proposal</button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <ProjectForm open={isFormOpen} onOpenChange={setIsFormOpen} />
     
    </div>
  );
};

export default AppLayout()(Profile);
