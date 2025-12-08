import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building, LogOut, Menu, X, Home, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const isActive = (path: string) => {
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'ダッシュボード', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/admin/bookings', label: '予約・取引管理', icon: <Calendar className="w-5 h-5" /> },
        { path: '/admin/users', label: 'ユーザー管理', icon: <Users className="w-5 h-5" /> },
        { path: '/admin/clinics', label: 'クリニック管理', icon: <Building className="w-5 h-5" /> },
        { path: '/admin/audit-logs', label: '操作ログ', icon: <Shield className="w-5 h-5" /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:translate-x-0
                `}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <span className="text-xl font-bold tracking-wider">運営管理パネル</span>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/70 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1">
                        {/* Site Top Link */}
                        <Link
                            to="/"
                            className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white mb-2"
                        >
                            <Home className="w-5 h-5" />
                            <span className="ml-3">サイトトップ</span>
                        </Link>

                        <div className="h-px bg-white/10 mx-3 my-2" />

                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                    ${isActive(item.path)
                                        ? 'bg-white text-primary shadow-lg'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'}
                                `}
                            >
                                {item.icon}
                                <span className="ml-3">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-white/10 bg-black/10">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-bold truncate">{user?.email}</p>
                                <p className="text-xs text-white/70">システム管理者</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center justify-center px-4 py-2 bg-black/20 hover:bg-red-500/80 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            ログアウト
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                            {navItems.find(item => isActive(item.path))?.label || '運営管理パネル'}
                        </h1>
                    </div>
                    {/* Right side actions */}
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                            ログイン中: <span className="font-bold text-gray-700">{user?.name || user?.email}</span>
                        </div>
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="bg-white border-b border-gray-200 p-4 md:hidden flex justify-between items-center">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-gray-800">運営管理パネル</span>
                    <div className="w-6"></div> {/* Spacer */}
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
