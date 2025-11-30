import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import type { UserRole } from '../types';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await register(email, password, name, role);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Redirect based on role
            if (role === 'user') navigate('/');
            else if (role === 'clinic_admin') navigate('/clinic/dashboard');
            else if (role === 'super_admin') navigate('/admin/call-center');
        }
    };

    return (
        <PageLayout>
            <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10 text-gray-800">
                <h2 className="text-2xl font-bold text-center mb-6 text-primary">新規登録</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">お名前</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">メールアドレス</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">パスワード</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">アカウントタイプ</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                        >
                            <option value="user">一般ユーザー</option>
                            <option value="clinic_admin">加盟院管理者</option>
                            <option value="super_admin">運営事務局</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50"
                    >
                        {loading ? '登録中...' : '登録する'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        すでにアカウントをお持ちの方は <Link to="/login" className="text-primary font-bold hover:underline">ログイン</Link>
                    </p>
                </div>
            </div>
        </PageLayout>
    );
};

export default Register;
