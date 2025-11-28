import { useState } from 'react';
import { Plus, Trash2, User } from 'lucide-react';

interface Staff {
    id: string;
    name: string;
    role: string;
    specialties: string[];
}

const MOCK_STAFF: Staff[] = [
    { id: 's1', name: 'Dr. Smith', role: 'Director', specialties: ['Osteopathy', 'Sports Injury'] },
    { id: 's2', name: 'Jane Doe', role: 'Therapist', specialties: ['Massage', 'Acupuncture'] },
];

const StaffManager = () => {
    const [staffList, setStaffList] = useState<Staff[]>(MOCK_STAFF);
    const [isAdding, setIsAdding] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', role: '', specialties: '' });

    const handleAddStaff = () => {
        if (!newStaff.name) return;
        const staff: Staff = {
            id: `s${Date.now()}`,
            name: newStaff.name,
            role: newStaff.role,
            specialties: newStaff.specialties.split(',').map(s => s.trim()).filter(Boolean)
        };
        setStaffList([...staffList, staff]);
        setNewStaff({ name: '', role: '', specialties: '' });
        setIsAdding(false);
    };

    const handleDeleteStaff = (id: string) => {
        setStaffList(staffList.filter(s => s.id !== id));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Staff Management</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff
                </button>
            </div>

            {isAdding && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
                    <h3 className="font-bold text-gray-700 mb-3">New Staff Member</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Name"
                            value={newStaff.name}
                            onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                            className="border rounded p-2"
                        />
                        <input
                            type="text"
                            placeholder="Role (e.g. Director)"
                            value={newStaff.role}
                            onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                            className="border rounded p-2"
                        />
                        <input
                            type="text"
                            placeholder="Specialties (comma separated)"
                            value={newStaff.specialties}
                            onChange={e => setNewStaff({ ...newStaff, specialties: e.target.value })}
                            className="border rounded p-2"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-gray-500 hover:bg-gray-200 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddStaff}
                            className="px-4 py-2 bg-accent text-white rounded hover:bg-opacity-90"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {staffList.map(staff => (
                    <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-4">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{staff.name}</h3>
                                <p className="text-sm text-gray-500">{staff.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex flex-wrap gap-1 mr-4 justify-end max-w-[200px]">
                                {staff.specialties.map((spec, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                            <button
                                onClick={() => handleDeleteStaff(staff.id)}
                                className="text-red-400 hover:text-red-600 p-2"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StaffManager;
