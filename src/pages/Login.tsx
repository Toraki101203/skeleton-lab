import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await login(email, password);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Navigation is handled by AuthContext listener usually, but we can force redirect here too
            // or wait for the user state to update.
            // For simplicity, let's just redirect to home for now, or check role if we had it.
            // Since we don't know role immediately without fetching profile, let's go home.
            navigate('/');
        }
    };

    // Keep mock login for fallback/testing if needed, or remove it.
    // User asked for "Demo accounts", so maybe we can pre-fill the form or keep the buttons as "Quick Demo (Mock)"
    // BUT, mock login doesn't work with Supabase RLS. So we should probably remove it or make it clear.
    // Let's replace it with the real form.

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-primary">ログイン</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700">メールアドレス</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700">パスワード</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'ログイン中...' : 'ログイン'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        アカウントをお持ちでない方は <Link to="/register" className="text-primary font-bold hover:underline">新規登録</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
