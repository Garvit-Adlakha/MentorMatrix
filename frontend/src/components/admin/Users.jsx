import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'motion/react';
import { 
    IconSearch,
    IconFilter,
    IconChevronLeft,
    IconChevronRight,
    IconUserCheck,
    IconUserX,
    IconUserOff,
    IconUser
} from '../ui/Icons';
import AppLayout from '../layouts/AppLayout';

const UserRow = ({ user, onStatusChange }) => {
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
                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <IconUser className="h-6 w-6 text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === 'mentor' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                    {user.role}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.status === 'active' ? 'bg-green-900/50 text-green-300' : 
                    user.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-red-900/50 text-red-300'}`}>
                    {user.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => updateStatus({ userId: user._id, status: 'active' })}
                        disabled={isLoading || user.status === 'active'}
                        className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                        title="Activate User"
                    >
                        <IconUserCheck className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => updateStatus({ userId: user._id, status: 'inactive' })}
                        disabled={isLoading || user.status === 'inactive'}
                        className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Deactivate User"
                    >
                        <IconUserOff className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => updateStatus({ userId: user._id, status: 'rejected' })}
                        disabled={isLoading || user.status === 'rejected'}
                        className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                        title="Reject User"
                    >
                        <IconUserX className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
};

UserRow.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired
    }).isRequired,
    onStatusChange: PropTypes.func.isRequired
};

// Add useDebounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
};

const Users = () => {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        role: '',
        status: '',
        search: ''
    });

    // Add debounced search
    const debouncedSearch = useDebounce(filters.search, 500);

    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery({
        queryKey: ['users', page, { ...filters, search: debouncedSearch }],
        queryFn: () => adminService.getAllUsers({ page, ...filters, search: debouncedSearch })
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        if (name === 'search') {
            // Don't reset page for search to provide better UX
            return;
        }
        setPage(1);
    };

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p className="text-red-400">Error loading users data</p>
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
                <h1 className="text-3xl font-bold text-white">Users Management</h1>
                <p className="text-gray-400 mt-2">Manage and monitor all users in your platform</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IconSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-10 w-full rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IconUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            className="pl-10 w-full rounded-lg bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            name="role"
                            value={filters.role}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Roles</option>
                            <option value="student">Student</option>
                            <option value="mentor">Mentor</option>
                        </select>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IconFilter className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            className="pl-10 w-full rounded-lg bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
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
                {isLoading && (
                    <div className="flex justify-center items-center min-h-[60vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Role
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
                                {data?.users.map(user => (
                                    <UserRow
                                        key={user._id}
                                        user={user}
                                        onStatusChange={() => queryClient.invalidateQueries(['users'])}
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

const UsersWithLayout = AppLayout()(Users);
export default UsersWithLayout; 