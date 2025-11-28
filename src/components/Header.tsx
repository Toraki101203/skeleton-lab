import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Skull } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 text-white">
            <div className="flex items-center space-x-2">
                <Skull className="w-8 h-8" />
                <div className="leading-tight">
                    <div className="text-[10px] opacity-80">Body Balance & Skeleton</div>
                    <div className="text-xl font-bold tracking-wider">Skeleton Lab.</div>
                </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6 text-sm opacity-80">
                <a href="#" className="hover:opacity-100">コンセプト</a>
                <a href="#" className="hover:opacity-100">特徴</a>
                <a href="#" className="hover:opacity-100">掲載院一覧</a>
                <a href="#" className="hover:opacity-100">よくある質問</a>
            </nav>

            <div className="flex items-center space-x-3">
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
                        <span className="text-sm">{user.name}</span>
                        <button
                            onClick={logout}
                            className="px-4 py-1.5 rounded-full border border-white/40 text-sm hover:bg-white/10"
                        >
                            ログアウト
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
