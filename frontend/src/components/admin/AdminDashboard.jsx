import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import PropTypes from 'prop-types';
import { motion } from 'motion/react';
import { 
    IconUsers, 
    IconSchool, 
    IconCircleCheck, 
    IconClock, 
    IconCircleX,
    IconArrowUp,
    IconArrowDown,
    IconTrendingUp
} from '../ui/Icons';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import AppLayout from '../layouts/AppLayout';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`admin-stat admin-stat--${color}`}
    >
        <div className="flex items-center justify-between">
            <div>
                <h3 className="admin-stat-title">{title}</h3>
                <div className="admin-stat-value">
                    <p>{value}</p>
                    {trend && (
                        <div className={`admin-stat-trend ${trend === 'up' ? 'admin-stat-trend--up' : 'admin-stat-trend--down'}`}>
                            {trend === 'up' ? <IconArrowUp className="w-4 h-4" /> : <IconArrowDown className="w-4 h-4" />}
                            <span>{trendValue}%</span>
                        </div>
                    )}
                </div>
            </div>
            <div className={`admin-stat-icon admin-stat-icon--${color}`}>
                <Icon className="w-8 h-8" />
            </div>
        </div>
    </motion.div>
);

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    icon: PropTypes.elementType.isRequired,
    color: PropTypes.string.isRequired,
    trend: PropTypes.oneOf(['up', 'down']),
    trendValue: PropTypes.number
};

const AdminDashboard = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: adminService.getDashboardStats
    });

    // Sample data for charts - replace with real data from API
    const userGrowthData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Students',
                data: [65, 78, 90, 85, 95, 110],
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.4
            },
            {
                label: 'Mentors',
                data: [28, 35, 40, 45, 50, 55],
                borderColor: 'rgb(16, 185, 129)',
                tension: 0.4
            }
        ]
    };

    const mentorStatusData = {
        labels: ['Active', 'Pending', 'Rejected'],
        datasets: [
            {
                data: [data?.stats?.activeMentors || 0, data?.stats?.pendingMentors || 0, data?.stats?.rejectedMentors || 0],
                backgroundColor: [
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)'
                ]
            }
        ]
    };

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
                <p className="text-red-400">Error loading dashboard data</p>
            </div>
        );
    }

    const stats = data?.stats || {};

    return (
        <div className="admin-page">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="admin-header"
            >
                <h1 className="admin-title">Admin Dashboard</h1>
            </motion.div>

            <div className="admin-grid">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={IconUsers}
                    color="blue"
                    trend="up"
                    trendValue={12}
                />
                <StatCard
                    title="Total Mentors"
                    value={stats.totalMentors}
                    icon={IconSchool}
                    color="green"
                    trend="up"
                    trendValue={8}
                />
                <StatCard
                    title="Active Mentors"
                    value={stats.activeMentors}
                    icon={IconCircleCheck}
                    color="green"
                    trend="up"
                    trendValue={5}
                />
                <StatCard
                    title="Pending Mentors"
                    value={stats.pendingMentors}
                    icon={IconClock}
                    color="yellow"
                    trend="down"
                    trendValue={3}
                />
                <StatCard
                    title="Rejected Mentors"
                    value={stats.rejectedMentors}
                    icon={IconCircleX}
                    color="red"
                    trend="down"
                    trendValue={2}
                />
            </div>

            <div className="admin-grid admin-grid--charts">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="admin-card"
                >
                    <div className="admin-card-header">
                        <h2 className="admin-card-title">User Growth</h2>
                        <IconTrendingUp className="admin-card-icon" />
                    </div>
                    <Line 
                        data={userGrowthData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                    labels: {
                                        color: '#fff'
                                    }
                                },
                                title: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    },
                                    ticks: {
                                        color: '#fff'
                                    }
                                },
                                x: {
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    },
                                    ticks: {
                                        color: '#fff'
                                    }
                                }
                            }
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="admin-card"
                >
                    <div className="admin-card-header">
                        <h2 className="admin-card-title">Mentor Status Distribution</h2>
                        <IconUsers className="admin-card-icon" />
                    </div>
                    <div className="h-64">
                        <Doughnut 
                            data={mentorStatusData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            color: '#fff'
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Wrap the component with AppLayout
const AdminDashboardWithLayout = AppLayout()(AdminDashboard);
export default AdminDashboardWithLayout;