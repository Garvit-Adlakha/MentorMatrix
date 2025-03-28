import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';

const mockProposals = [
  {
    id: 1,
    studentId: 101,
    facultyId: 201,
    studentName: 'John Doe',
    facultyName: 'Dr. Jane Smith',
    title: 'Machine Learning for Healthcare',
    description: 'A project focused on applying ML techniques to healthcare data for improved diagnostics.',
    status: 'pending',
    createdAt: '2023-10-15T10:30:00Z',
  },
  {
    id: 2,
    studentId: 101,
    facultyId: 202,
    studentName: 'John Doe',
    facultyName: 'Dr. Robert Johnson',
    title: 'Blockchain for Supply Chain',
    description: 'Implementing blockchain technology to improve supply chain transparency.',
    status: 'accepted',
    createdAt: '2023-10-10T14:45:00Z',
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('student');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleRole = () => {
    setUserRole(userRole === 'student' ? 'faculty' : 'student');
  };

  const filteredProposals = mockProposals.filter(proposal =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.facultyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button className="btn btn-outline" onClick={toggleRole}>
            {userRole === 'student' ? 'Switch to Faculty' : 'Switch to Student'}
          </button>
        </div>

        <div className="overflow-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>{userRole === 'student' ? 'Faculty' : 'Student'}</th>
                <th>Title</th>
                <th>Submission Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.length > 0 ? (
                filteredProposals.map(proposal => (
                  <tr key={proposal.id}>
                    <td>{userRole === 'student' ? proposal.facultyName : proposal.studentName}</td>
                    <td>{proposal.title}</td>
                    <td>{new Date(proposal.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${proposal.status === 'accepted' ? 'badge-success' : proposal.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">No proposals found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
  );
};

export default AppLayout()(Dashboard);