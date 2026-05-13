import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'motion/react';
import { 
    IconFilter,
    IconChevronLeft,
    IconChevronRight,
    IconUserCheck,
    IconUserX,
    IconSchool,
    IconClock
} from '../ui/Icons';
import AppLayout from '../layouts/AppLayout';

const MentorRequestRow = ({ mentor, onStatusChange }) => {
    const { mutate: updateStatus, isLoading } = useMutation({
        mutationFn: ({ userId, status }) => adminService.updateUserStatus(userId, status),
        onSuccess: () => {
            onStatusChange();
        }
    });

    return (
        <motion.tr
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="admin-table-row"
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="admin-user">
                    <div className="flex-shrink-0">
                        <div className="admin-user-avatar admin-user-avatar--mentor">
                            <IconSchool className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <div className="admin-user-name">{mentor.name}</div>
                        <div className="admin-user-email">{mentor.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="admin-mentor-meta">
                    <div className="admin-mentor-expertise">{mentor.expertise}</div>
                    <div className="admin-mentor-exp">
                        <IconClock className="w-4 h-4" />
                        {mentor.experience} years
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`admin-pill ${
                    mentor.status === 'pending' ? 'admin-pill--pending' :
                    mentor.status === 'active' ? 'admin-pill--active' : 'admin-pill--danger'}`}
                >
                    {mentor.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="admin-actions">
                    <button
                        onClick={() => updateStatus({ userId: mentor._id, status: 'active' })}
                        disabled={isLoading || mentor.status === 'active'}
                        className="admin-action admin-action--success"
                        title="Approve Mentor"
                    >
                        <IconUserCheck className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => updateStatus({ userId: mentor._id, status: 'rejected' })}
                        disabled={isLoading || mentor.status === 'rejected'}
                        className="admin-action admin-action--danger"
                        title="Reject Mentor"
                    >
                        <IconUserX className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
};

MentorRequestRow.propTypes = {
    mentor: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        expertise: PropTypes.string.isRequired,
        experience: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired
    }).isRequired,
    onStatusChange: PropTypes.func.isRequired
};

const MentorRequests = () => {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('pending');

    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery({
        queryKey: ['mentorRequests', page, status],
        queryFn: () => adminService.getMentorRequests({ page, status })
    });

    

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p className="text-red-400">Error loading mentor requests</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="admin-header"
            >
                <h1 className="admin-title">Mentor Requests</h1>
                <p className="admin-subtitle">Review and manage mentor verification requests</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="admin-card"
            >
                <div className="admin-filters">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IconFilter className="h-5 w-5" />
                        </div>
                        <select
                            className="admin-filter-input admin-filter-input--compact"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="pending">Pending Requests</option>
                            <option value="active">Approved Mentors</option>
                            <option value="rejected">Rejected Requests</option>
                            <option value="inactive">Inactive Mentors</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="admin-card admin-card--table"
            >
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="admin-table-head">
                                    Mentor
                                </th>
                                <th className="admin-table-head">
                                    Expertise
                                </th>
                                <th className="admin-table-head">
                                    Status
                                </th>
                                <th className="admin-table-head admin-table-head--right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {data?.mentors.map(mentor => (
                                    <MentorRequestRow
                                        key={mentor._id}
                                        mentor={mentor}
                                        onStatusChange={() => queryClient.invalidateQueries(['mentorRequests'])}
                                    />
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="admin-pagination"
            >
                <div className="admin-pagination-text">
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data?.pagination.total)} of {data?.pagination.total} results
                </div>
                <div className="admin-pagination-actions">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="admin-pagination-btn"
                    >
                        <IconChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= data?.pagination.pages}
                        className="admin-pagination-btn"
                    >
                        <IconChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const MentorRequestsWithLayout = AppLayout()(MentorRequests);
export default MentorRequestsWithLayout; 