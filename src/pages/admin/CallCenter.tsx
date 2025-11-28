import { useState } from 'react';
import { Search, Phone, Calendar, User, Save } from 'lucide-react';
import ScheduleViewer from '../../components/admin/ScheduleViewer';
import type { UserProfile } from '../../types';

// Mock Users
const MOCK_USERS: UserProfile[] = [
    { uid: 'u1', role: 'user', name: 'Taro Yamada', email: 'taro@example.com', phone: '090-1111-2222' },
    { uid: 'u2', role: 'user', name: 'Hanako Suzuki', email: 'hanako@example.com', phone: '090-3333-4444' },
];

const CallCenter = () => {
    const [query, setQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'log' | 'booking'>('log');
    const [logNote, setLogNote] = useState('');

    // Booking State
    const [selectedClinic, setSelectedClinic] = useState('c1');
    const [bookingDate, setBookingDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null);

    const filteredUsers = MOCK_USERS.filter(u =>
        u.name.includes(query) || u.phone?.includes(query)
    );

    const handleBooking = () => {
        if (!selectedSlot) return;
        alert(`Booking Confirmed for ${selectedUser?.name} at ${selectedSlot.start.toLocaleTimeString()}`);
        // Reset
        setSelectedSlot(null);
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Left Panel: User Search & List */}
            <div className="w-1/3 bg-white border-r flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-700 mb-3">User Search</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredUsers.map(user => (
                        <div
                            key={user.uid}
                            onClick={() => setSelectedUser(user)}
                            className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors ${selectedUser?.uid === user.uid ? 'bg-blue-50 border-l-4 border-l-primary' : ''
                                }`}
                        >
                            <div className="font-bold text-gray-800">{user.name}</div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                                <Phone className="w-3 h-3 mr-1" /> {user.phone}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{user.email}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Operations */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedUser ? (
                    <>
                        {/* User Header */}
                        <div className="bg-white p-4 border-b shadow-sm flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mr-3">
                                    {selectedUser.name[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedUser.name}</h2>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <span>ID: {selectedUser.uid}</span>
                                        <span>•</span>
                                        <select
                                            value={selectedUser.role}
                                            onChange={(e) => {
                                                const newRole = e.target.value as any;
                                                setSelectedUser({ ...selectedUser, role: newRole });
                                                alert(`Role changed to ${newRole}`);
                                            }}
                                            className="border-none bg-gray-100 rounded px-2 py-0.5 text-xs font-medium cursor-pointer hover:bg-gray-200"
                                        >
                                            <option value="user">User</option>
                                            <option value="clinic_admin">Clinic Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setActiveTab('log')}
                                    className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'log' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    Support Log
                                </button>
                                <button
                                    onClick={() => setActiveTab('booking')}
                                    className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'booking' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    Proxy Booking
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            {activeTab === 'log' ? (
                                <div className="bg-white rounded-xl shadow p-6">
                                    <h3 className="text-lg font-bold mb-4">Support Log</h3>
                                    <textarea
                                        value={logNote}
                                        onChange={(e) => setLogNote(e.target.value)}
                                        placeholder="Enter support notes..."
                                        className="w-full h-32 border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-primary"
                                    />
                                    <button className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90">
                                        <Save className="w-4 h-4 mr-2" /> Save Log
                                    </button>

                                    <div className="mt-8">
                                        <h4 className="font-bold text-gray-700 mb-2">History</h4>
                                        <div className="border-l-2 border-gray-200 pl-4 space-y-4">
                                            <div className="text-sm">
                                                <span className="text-gray-400">2023-10-01 10:00</span>
                                                <p className="text-gray-800">Inquired about pricing.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center">
                                        <Calendar className="w-5 h-5 mr-2 text-accent" />
                                        Proxy Booking
                                    </h3>

                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic</label>
                                            <select
                                                value={selectedClinic}
                                                onChange={(e) => setSelectedClinic(e.target.value)}
                                                className="w-full border rounded p-2"
                                            >
                                                <option value="c1">Skeleton Clinic Tokyo</option>
                                                <option value="c2">Osaka Spine Center</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={bookingDate.toISOString().split('T')[0]}
                                                onChange={(e) => setBookingDate(new Date(e.target.value))}
                                                className="w-full border rounded p-2"
                                            />
                                        </div>
                                    </div>

                                    <ScheduleViewer
                                        clinicId={selectedClinic}
                                        date={bookingDate}
                                        onSelectSlot={(start, end) => setSelectedSlot({ start, end })}
                                    />

                                    {selectedSlot && (
                                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-green-800">Selected Slot</div>
                                                <div className="text-green-700">
                                                    {selectedSlot.start.toLocaleTimeString()} - {selectedSlot.end.toLocaleTimeString()}
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleBooking}
                                                className="px-6 py-2 bg-accent text-white rounded font-bold shadow hover:bg-opacity-90"
                                            >
                                                Confirm Booking
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <User className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg">Select a user from the list to start support.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallCenter;
