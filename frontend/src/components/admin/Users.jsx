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
            className="admin-table-row"
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="admin-user">
                    <div className="flex-shrink-0">
                        <div className="admin-user-avatar">
                            <IconUser className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <div className="admin-user-name">{user.name}</div>
                        <div className="admin-user-email">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`admin-pill ${user.role === 'mentor' ? 'admin-pill--mentor' : 'admin-pill--student'}`}>
                    {user.role}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`admin-pill ${
                    user.status === 'active' ? 'admin-pill--active' :
                    user.status === 'pending' ? 'admin-pill--pending' : 'admin-pill--danger'}`}
                >
                    {user.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="admin-actions">
                    <button
                        onClick={() => updateStatus({ userId: user._id, status: 'active' })}
                        disabled={isLoading || user.status === 'active'}
                        className="admin-action admin-action--success"
                        title="Activate User"
                    >
                        <IconUserCheck className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => updateStatus({ userId: user._id, status: 'inactive' })}
                        disabled={isLoading || user.status === 'inactive'}
                        className="admin-action"
                        title="Deactivate User"
                    >
                        <IconUserOff className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => updateStatus({ userId: user._id, status: 'rejected' })}
                        disabled={isLoading || user.status === 'rejected'}
                        className="admin-action admin-action--danger"
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
        <div className="admin-page">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="admin-header"
            >
                <h1 className="admin-title">Users Management</h1>
                <p className="admin-subtitle">Manage and monitor all users in your platform</p>
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
                            <IconSearch className="h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="admin-filter-input"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IconUser className="h-5 w-5" />
                        </div>
                        <select
                            className="admin-filter-input"
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
                            <IconFilter className="h-5 w-5" />
                        </div>
                        <select
                            className="admin-filter-input"
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
                className="admin-card admin-card--table"
            >
                {isLoading && (
                    <div className="flex justify-center items-center min-h-[60vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="admin-table-head">
                                    User
                                </th>
                                <th className="admin-table-head">
                                    Role
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

const UsersWithLayout = AppLayout()(Users);
export default UsersWithLayout; 