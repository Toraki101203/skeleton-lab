import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

/**
 * 新規登録ページ。
 *
 * 【重要な設計判断（2026-07-10 セキュリティ監査）】
 * 以前はここに「アカウントタイプ」の選択欄があり、誰でも「運営事務局(super_admin)」を
 * 選んで登録できてしまった。DB 側のトリガーが、その自己申告をそのまま権限にしていたため、
 * 匿名の第三者が数クリックでプラットフォーム全体の管理者になれる状態だった。
 *
 * 現在は「一般ユーザー」で固定。加盟院管理者・運営事務局への昇格は、
 * 運営が DB 側で手動実施する（docs/security/2026-07-10-緊急修正.sql を参照）。
 */
const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // 権限は必ず 'user'。ここで他の値を渡しても DB 側で無視されるが、
        // 画面からも選ばせない（入口を二重に塞ぐ）。
        const { error } = await register(email, password, name, 'user');

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <>
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
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-primary text-base"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">メールアドレス</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-primary text-base"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">パスワード</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-primary text-base"
                            required
                            minLength={6}
                        />
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
        </>
    );
};

export default Register;
