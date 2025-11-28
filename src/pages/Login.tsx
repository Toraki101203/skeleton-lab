import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { loginAs } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (role: 'user' | 'clinic_admin' | 'super_admin') => {
        await loginAs(role);
        if (role === 'user') navigate('/');
        else if (role === 'clinic_admin') navigate('/clinic/dashboard');
        else if (role === 'super_admin') navigate('/admin/call-center');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-primary">開発用ログイン</h2>
                <div className="space-y-4">
                    <button
                        onClick={() => handleLogin('user')}
                        className="w-full py-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 font-medium"
                    >
                        ユーザーとしてログイン
                    </button>
                    <button
                        onClick={() => handleLogin('clinic_admin')}
                        className="w-full py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-medium"
                    >
                        加盟院管理者としてログイン
                    </button>
                    <button
                        onClick={() => handleLogin('super_admin')}
                        className="w-full py-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 font-medium"
                    >
                        運営事務局としてログイン
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
