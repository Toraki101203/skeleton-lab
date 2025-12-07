import { useState, useEffect } from 'react';
import { Search, Phone, Calendar, User, Save, Clock, Mail, Shield, Plus, UserPlus, Building } from 'lucide-react';
import ScheduleViewer from '../../components/admin/ScheduleViewer';
import PageLayout from '../../components/PageLayout';
import type { UserProfile } from '../../types';
import { PREFECTURES, getCities } from '../../data/locations';
import { supabase } from '../../lib/supabase';
import { getAllClinics } from '../../services/db';

const CallCenter = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [query, setQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [activeTab, setActiveTab] = useState<'log' | 'booking'>('log');
    const [logNote, setLogNote] = useState('');

    // Support Logs State
    const [supportLogs, setSupportLogs] = useState<{ id: string, created_at: string, content: string }[]>([]);

    // New User Form State
    const [newUser, setNewUser] = useState({ name: '', email: '', phone: '' });

    // Booking State
    const [selectedPrefecture, setSelectedPrefecture] = useState('tokyo');
    const [selectedCity, setSelectedCity] = useState('131032'); // Minato-ku
    const [selectedClinic, setSelectedClinic] = useState('');
    const [bookingDate, setBookingDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null);
    const [clinics, setClinics] = useState<any[]>([]);

    // Fetch Users
    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching users:', error);
            } else {
                // Map Supabase 'id' to 'uid' for UserProfile type compatibility
                const mappedUsers = (data || []).map((u: any) => ({
                    ...u,
                    uid: u.id
                }));
                setUsers(mappedUsers as UserProfile[]);
            }
        };
        fetchUsers();
    }, []);

    // Fetch Clinics
    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const data = await getAllClinics();
                setClinics(data);
            } catch (error) {
                console.error('Error fetching clinics:', error);
            }
        };
        fetchClinics();
    }, []);

    // Fetch Support Logs when User Selected
    useEffect(() => {
        if (!selectedUser) {
            setSupportLogs([]);
            return;
        }

        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from('support_logs')
                .select('*')
                .eq('user_id', selectedUser.uid)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching logs:', error);
            } else {
                setSupportLogs(data || []);
            }
        };
        fetchLogs();
    }, [selectedUser]);


    const filteredUsers = users.filter(u =>
        (u.name && u.name.includes(query)) || (u.phone && u.phone.includes(query))
    );

    // Filter Clinics based on location
    const availableCities = getCities(selectedPrefecture);
    const selectedCityName = availableCities.find(c => c.id === selectedCity)?.name || '';

    const availableClinics = clinics.filter(c => {
        if (!c.location || !c.location.address) return false;
        return c.location.address.includes(selectedCityName);
    });

    // Get selected clinic details
    const currentClinic = clinics.find(c => c.id === selectedClinic);

    const handleSaveLog = async () => {
        if (!logNote.trim() || !selectedUser) return;

        try {
            const { data, error } = await supabase
                .from('support_logs')
                .insert([
                    {
                        user_id: selectedUser.uid,
                        content: logNote,
                    }
                ])
                .select();

            if (error) throw error;

            if (data) {
                setSupportLogs([data[0], ...supportLogs]);
                setLogNote('');
                alert('対応記録を保存しました');
            }
        } catch (error) {
            console.error('Error saving log:', error);
            alert('保存に失敗しました');
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.phone) {
            alert('名前と電話番号は必須です');
            return;
        }

        alert('注意: 管理画面からの完全なユーザー作成にはバックエンド機能が必要です。\n現在はデモとして表示のみ更新します。');

        const createdUser: any = {
            id: `temp_${Date.now()}`,
            uid: `temp_${Date.now()}`,
            role: 'user',
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            created_at: new Date().toISOString()
        };

        setUsers([createdUser, ...users]);
        setSelectedUser(createdUser);
        setIsCreatingUser(false);
        setNewUser({ name: '', email: '', phone: '' });

        if (logNote) {
            setSupportLogs([{
                id: `l_${Date.now()}`,
                created_at: new Date().toLocaleString(),
                content: logNote
            }, ...supportLogs]);
            setLogNote('');
        }
    };

    const handleBooking = () => {
        if (!selectedSlot) return;
        alert(`${selectedUser?.name} 様の予約を確定しました。\n日時: ${selectedSlot.start.toLocaleString()}`);
        setSelectedSlot(null);
    };

    return (
        <PageLayout>
            <div className="flex h-[calc(100vh-200px)] gap-6">
                {/* Left Panel: User Search & List */}
                <div className="w-1/3 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col border border-gray-100">
                    {/* Dashboard Stats Header */}
                    <div className="bg-gray-800 text-white p-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider mb-3 opacity-70">システム稼働状況</h2>
                        <div className="flex gap-4">
                            <div className="flex-1 bg-white/10 rounded-lg p-3">
                                <div className="flex items-center text-xs opacity-80 mb-1">
                                    <User className="w-3 h-3 mr-1" /> 総ユーザー数
                                </div>
                                <div className="text-2xl font-bold">{users.length}</div>
                            </div>
                            <div className="flex-1 bg-white/10 rounded-lg p-3">
                                <div className="flex items-center text-xs opacity-80 mb-1">
                                    <Building className="w-3 h-3 mr-1" /> 掲載院数
                                </div>
                                <div className="text-2xl font-bold">{clinics.length}</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <Search className="w-5 h-5 mr-2 text-primary" />
                                ユーザー検索
                            </h2>
                            <button
                                onClick={() => {
                                    setIsCreatingUser(true);
                                    setSelectedUser(null);
                                }}
                                className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                                title="新規ユーザー登録"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="名前または電話番号で検索..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 text-gray-800 placeholder-gray-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredUsers.map(user => (
                            <div
                                key={user.uid}
                                onClick={() => {
                                    setSelectedUser(user);
                                    setIsCreatingUser(false);
                                }}
                                className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${selectedUser?.uid === user.uid
                                    ? 'bg-blue-50/80 border-l-4 border-l-primary'
                                    : 'border-l-4 border-l-transparent'
                                    }`}
                            >
                                <div className="font-bold text-gray-800 flex justify-between">
                                    {user.name}
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                        {user.role}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 flex items-center mt-2">
                                    <Phone className="w-3 h-3 mr-2 text-primary" /> {user.phone}
                                </div>
                                <div className="text-xs text-gray-400 mt-1 flex items-center">
                                    <Mail className="w-3 h-3 mr-2 text-primary" /> {user.email}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Operations */}
                <div className="flex-1 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col border border-gray-100 relative">
                    {isCreatingUser ? (
                        <>
                            {/* Registration Header */}
                            <div className="bg-white p-6 border-b border-gray-100 shadow-sm flex justify-between items-center relative z-10">
                                <div className="flex items-center">
                                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-2xl mr-4">
                                        <UserPlus className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">新規ユーザー登録</h2>
                                        <p className="text-sm text-gray-500 mt-1">新しいユーザー情報を入力してください</p>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Content */}
                            <div className="flex-1 p-8 overflow-y-auto bg-gray-50/30">
                                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-4xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">基本情報</h3>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">お名前 <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={newUser.name}
                                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                                    placeholder="例: 山田 太郎"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">電話番号 <span className="text-red-500">*</span></label>
                                                <input
                                                    type="tel"
                                                    value={newUser.phone}
                                                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                                    placeholder="例: 090-1234-5678"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">メールアドレス</label>
                                                <input
                                                    type="email"
                                                    value={newUser.email}
                                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                                    placeholder="例: taro@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">初期対応メモ (任意)</h3>
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 mb-4">
                                                <p>※ 登録と同時に、最初のサポートログとして保存されます。</p>
                                            </div>
                                            <textarea
                                                value={logNote}
                                                onChange={(e) => setLogNote(e.target.value)}
                                                className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none text-gray-800"
                                                placeholder="お問い合わせ内容や、ユーザーの特徴などを入力してください..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-gray-100">
                                        <button
                                            onClick={() => setIsCreatingUser(false)}
                                            className="px-8 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            キャンセル
                                        </button>
                                        <button
                                            onClick={handleCreateUser}
                                            className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-primary/90 hover:scale-[1.02] transition-all flex items-center"
                                        >
                                            <UserPlus className="w-5 h-5 mr-2" />
                                            ユーザーを登録して開始
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : selectedUser ? (
                        <>
                            {/* User Header */}
                            <div className="bg-white p-6 border-b border-gray-100 shadow-sm flex justify-between items-center relative z-10">
                                <div className="flex items-center">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mr-4 shadow-lg shadow-blue-200">
                                        {selectedUser.name ? selectedUser.name[0] : 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{selectedUser.name}</h2>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded text-xs font-mono border border-gray-200">
                                                ID: {selectedUser.uid}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <Shield className="w-3 h-3 text-primary" />
                                                <select
                                                    value={selectedUser.role}
                                                    onChange={(e) => {
                                                        const newRole = e.target.value as any;
                                                        setSelectedUser({ ...selectedUser, role: newRole });
                                                        alert(`権限を ${newRole} に変更しました`);
                                                    }}
                                                    className="bg-transparent border-none text-gray-600 text-xs font-medium cursor-pointer hover:text-primary focus:ring-0 p-0"
                                                >
                                                    <option value="user">一般ユーザー</option>
                                                    <option value="clinic_admin">医院管理者</option>
                                                    <option value="super_admin">システム管理者</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setActiveTab('log')}
                                        className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'log'
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                    >
                                        サポートログ
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('booking')}
                                        className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'booking'
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                    >
                                        代理予約
                                    </button>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 p-8 overflow-y-auto bg-gray-50/30">
                                {activeTab === 'log' ? (
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-lg font-bold mb-6 flex items-center text-gray-800">
                                            <Clock className="w-5 h-5 mr-2 text-primary" />
                                            サポート対応記録
                                        </h3>
                                        <textarea
                                            value={logNote}
                                            onChange={(e) => setLogNote(e.target.value)}
                                            placeholder="対応内容を入力してください..."
                                            className="w-full h-40 bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-4 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-gray-800 placeholder-gray-400 resize-none transition-all outline-none"
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleSaveLog}
                                                className="flex items-center px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-primary/90 hover:scale-[1.02] transition-all"
                                            >
                                                <Save className="w-4 h-4 mr-2" /> 記録を保存
                                            </button>
                                        </div>

                                        <div className="mt-10">
                                            <h4 className="font-bold text-gray-400 mb-4 text-sm uppercase tracking-wider">過去の履歴</h4>
                                            <div className="space-y-4">
                                                {supportLogs.map(log => (
                                                    <div key={log.id} className="relative pl-6 border-l-2 border-gray-200 pb-4">
                                                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-white"></div>
                                                        <div className="text-xs text-primary font-mono mb-1">{new Date(log.created_at).toLocaleString()}</div>
                                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                            {log.content}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-lg font-bold mb-6 flex items-center text-gray-800">
                                            <Calendar className="w-5 h-5 mr-2 text-primary" />
                                            代理予約システム
                                        </h3>

                                        <div className="grid grid-cols-2 gap-8 mb-8">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">エリア選択</label>
                                                <div className="flex gap-2 mb-4">
                                                    <select
                                                        value={selectedPrefecture}
                                                        onChange={(e) => {
                                                            setSelectedPrefecture(e.target.value);
                                                            const cities = getCities(e.target.value);
                                                            setSelectedCity(cities[0].id);
                                                            setSelectedClinic('');
                                                        }}
                                                        className="w-1/2 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                                                    >
                                                        {PREFECTURES.map(pref => (
                                                            <option key={pref.id} value={pref.id}>{pref.name}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={selectedCity}
                                                        onChange={(e) => setSelectedCity(e.target.value)}
                                                        className="w-1/2 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                                                    >
                                                        {availableCities.map(city => (
                                                            <option key={city.id} value={city.id}>{city.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">クリニック選択</label>
                                                <select
                                                    value={selectedClinic}
                                                    onChange={(e) => setSelectedClinic(e.target.value)}
                                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                                                >
                                                    <option value="">クリニックを選択してください</option>
                                                    {availableClinics.length > 0 ? (
                                                        availableClinics.map(clinic => (
                                                            <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled>このエリアにクリニックはありません</option>
                                                    )}
                                                </select>

                                                {/* Address Display */}
                                                {currentClinic && (
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                                                        <div className="font-bold text-gray-600 mb-1">住所</div>
                                                        <div className="text-gray-800">{currentClinic.location?.address || '住所情報なし'}</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">日付選択</label>
                                                <input
                                                    type="date"
                                                    value={bookingDate.toISOString().split('T')[0]}
                                                    onChange={(e) => setBookingDate(new Date(e.target.value))}
                                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        {selectedClinic ? (
                                            <ScheduleViewer
                                                clinicId={selectedClinic}
                                                date={bookingDate}
                                                staffList={currentClinic?.staffInfo || []}
                                                onSelectSlot={(start, end) => setSelectedSlot({ start, end })}
                                            />
                                        ) : (
                                            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                                                クリニックを選択してください
                                            </div>
                                        )}

                                        {selectedSlot && (
                                            <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex justify-between items-center animate-fade-in">
                                                <div>
                                                    <div className="font-bold text-primary mb-1">選択中の日時</div>
                                                    <div className="text-gray-800 text-lg font-mono">
                                                        {selectedSlot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {selectedSlot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleBooking}
                                                    className="px-8 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-accent/90 hover:scale-[1.02] transition-all"
                                                >
                                                    予約を確定する
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 relative z-10 bg-gray-50/30">
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                                <User className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="text-xl font-medium text-gray-500">ユーザーを選択してください</p>
                            <p className="text-sm text-gray-400 mt-2">左側のパネルから検索・選択できます</p>
                            <button
                                onClick={() => setIsCreatingUser(true)}
                                className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-primary/90 transition-all flex items-center"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                新規ユーザー登録
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default CallCenter;
