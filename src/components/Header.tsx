import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Skull, Menu, X } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <>
            <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 text-white">
                <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity relative z-50">
                    <Skull className="w-8 h-8" />
                    <div className="leading-tight">
                        <div className="text-[10px] opacity-80">Body Balance & Skeleton</div>
                        <div className="text-xl font-bold tracking-wider">Skeleton Lab.</div>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6 text-sm opacity-80">
                    <Link to="/concept" className="hover:opacity-100">コンセプト</Link>
                    <Link to="/features" className="hover:opacity-100">特徴</Link>
                    <Link to="/search" className="hover:opacity-100">掲載院一覧</Link>
                    <Link to="/faq" className="hover:opacity-100">よくある質問</Link>
                </nav>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center space-x-3">
                    {!user ? (
                        <>
                            <Link
                                to="/register"
                                className="px-4 py-1.5 rounded-full border border-white/40 text-sm hover:bg-white/10 transition-colors"
                            >
                                新規登録
                            </Link>
                            <Link
                                to="/login"
                                className="px-4 py-1.5 rounded-full bg-white text-primary text-sm font-bold hover:bg-gray-100 transition-colors"
                            >
                                ログイン
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center space-x-4">
                            {user.role === 'super_admin' && (
                                <Link to="/admin/call-center" className="text-sm hover:underline font-bold text-accent whitespace-nowrap">
                                    管理パネル
                                </Link>
                            )}
                            {user.role === 'clinic_admin' && (
                                <Link to="/clinic/dashboard" className="text-sm hover:underline whitespace-nowrap">
                                    管理画面
                                </Link>
                            )}
                            <span className="text-sm whitespace-nowrap">{user.name}</span>
                            <button
                                onClick={logout}
                                className="px-4 py-1.5 rounded-full border border-white/40 text-sm hover:bg-white/10 whitespace-nowrap"
                            >
                                ログアウト
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Hamburger Button */}
                <button
                    className="md:hidden p-2 text-white relative z-50 focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header >

            {/* Mobile Menu Overlay */}
            {
                isMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-primary/95 backdrop-blur-xl flex flex-col justify-center items-center p-6 animate-in fade-in duration-200">
                        <nav className="flex flex-col space-y-8 text-center text-white text-xl font-bold">
                            <Link to="/concept" onClick={closeMenu} className="hover:scale-105 transition-transform">コンセプト</Link>
                            <Link to="/features" onClick={closeMenu} className="hover:scale-105 transition-transform">特徴</Link>
                            <Link to="/search" onClick={closeMenu} className="hover:scale-105 transition-transform">掲載院一覧</Link>
                            <Link to="/faq" onClick={closeMenu} className="hover:scale-105 transition-transform">よくある質問</Link>

                            <div className="h-px bg-white/20 w-32 mx-auto my-4" />

                            {!user ? (
                                <div className="flex flex-col space-y-4">
                                    <Link
                                        to="/login"
                                        onClick={closeMenu}
                                        className="px-8 py-3 rounded-full bg-white text-primary font-bold shadow-lg active:scale-95 transition-all"
                                    >
                                        ログイン
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={closeMenu}
                                        className="text-white/80 text-sm hover:text-white"
                                    >
                                        アカウントをお持ちでない方はこちら
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-4 items-center">
                                    <span className="text-sm opacity-80">ログイン中: {user.name}</span>
                                    {user.role === 'super_admin' && (
                                        <Link to="/admin/call-center" onClick={closeMenu} className="text-accent">管理パネル</Link>
                                    )}
                                    {user.role === 'clinic_admin' && (
                                        <Link to="/clinic/dashboard" onClick={closeMenu}>管理画面へ</Link>
                                    )}
                                    <button
                                        onClick={() => { logout(); closeMenu(); }}
                                        className="px-6 py-2 rounded-full border border-white/40 text-sm hover:bg-white/10"
                                    >
                                        ログアウト
                                    </button>
                                </div>
                            )}
                        </nav>
                    </div>
                )
            }
        </>
    );
};

export default Header;
