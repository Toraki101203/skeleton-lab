import { useState, useEffect } from 'react';
import { Users, Building, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAdminDashboardStats, getAnalyticsData } from '../../services/db';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalClinics: 0,
        pendingClinics: 0,
    });
    const [analytics, setAnalytics] = useState({
        dailyBookings: [] as any[],
        userGrowth: [] as any[],
        popularClinics: [] as any[]
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsData, analyticsData] = await Promise.all([
                    getAdminDashboardStats(),
                    getAnalyticsData()
                ]);
                setStats(statsData);
                setAnalytics(analyticsData);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: '総ユーザー数', value: stats.totalUsers, icon: <Users />, color: 'bg-blue-50 text-blue-600', link: '/admin/users' },
        { title: '掲載クリニック', value: stats.totalClinics, icon: <Building />, color: 'bg-green-50 text-green-600', link: '/admin/clinics' },
        { title: '承認待ち', value: stats.pendingClinics, icon: <AlertCircle />, color: 'bg-yellow-50 text-yellow-600', link: '/admin/clinics?status=pending' },
    ];

    if (isLoading) {
        return <div className="flex h-full items-center justify-center text-gray-400">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <Link to={stat.link} key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer block">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-500">{stat.title}</div>
                    </Link>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Trend */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                        予約数推移 (直近30日)
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.dailyBookings}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="count" stroke="#869ABE" strokeWidth={3} dot={{ r: 4, fill: '#869ABE' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Growth */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-primary" />
                        ユーザー登録推移 (累積)
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.userGrowth}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00A95F" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#00A95F" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#00A95F" fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Popular Clinics & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Popular Clinics */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Building className="w-5 h-5 mr-2 text-primary" />
                        人気クリニック (予約数順)
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.popularClinics} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" allowDecimals={false} />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="bookings" fill="#F39800" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">最近のアクティビティ</h2>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                                <div className="p-2 bg-gray-100 rounded-full text-gray-500 shrink-0">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800 font-medium">新規予約が入りました</p>
                                    <p className="text-xs text-gray-400">10分前</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
