import { Link } from 'react-router-dom';
import { Settings, Users, LayoutDashboard } from 'lucide-react';

const ClinicDashboard = () => {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Clinic Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/clinic/profile" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary mb-4">
                        <Settings className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Profile & Hours</h2>
                    <p className="text-gray-500 text-sm">Manage clinic details, business hours, and photos.</p>
                </Link>

                <Link to="/clinic/staff" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-accent mb-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Staff Management</h2>
                    <p className="text-gray-500 text-sm">Add or remove staff members and manage roles.</p>
                </Link>

                <Link to="/clinic/solutions" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-attention mb-4">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Solution Builder</h2>
                    <p className="text-gray-500 text-sm">Create custom solution pages and menus.</p>
                </Link>
            </div>
        </div>
    );
};

export default ClinicDashboard;
