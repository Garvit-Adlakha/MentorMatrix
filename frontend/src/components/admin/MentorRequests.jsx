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
            className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-purple-900/50 flex items-center justify-center">
                            <IconSchool className="h-6 w-6 text-purple-300" />
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">{mentor.name}</div>
                        <div className="text-sm text-gray-400">{mentor.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                    <div className="text-sm font-medium text-white">{mentor.expertise}</div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <IconClock className="w-4 h-4 mr-1" />
                        {mentor.experience} years
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${mentor.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300' : 
                    mentor.status === 'active' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                    {mentor.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => updateStatus({ userId: mentor._id, status: 'active' })}
                        disabled={isLoading || mentor.status === 'active'}
                        className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                        title="Approve Mentor"
                    >
                        <IconUserCheck className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => updateStatus({ userId: mentor._id, status: 'rejected' })}
                        disabled={isLoading || mentor.status === 'rejected'}
                        className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
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
        <div className="p-6 bg-[background] min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-white">Mentor Requests</h1>
                <p className="text-gray-400 mt-2">Review and manage mentor verification requests</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
            >
                <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IconFilter className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            className="pl-10 p-2 w-fit rounded-lg bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
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
                className="bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Mentor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Expertise
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
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
                className="mt-4 flex justify-between items-center bg-gray-800 rounded-lg shadow-lg p-4"
            >
                <div className="text-sm text-gray-400">
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data?.pagination.total)} of {data?.pagination.total} results
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-gray-400"
                    >
                        <IconChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= data?.pagination.pages}
                        className="p-2 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-gray-400"
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