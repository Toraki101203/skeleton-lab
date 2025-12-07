import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, User, Clock, Check } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Clinic, Staff, MenuItem, BusinessHours } from '../../types';
import StaffEditorModal from '../../components/clinic/StaffEditorModal';

const INITIAL_HOURS: BusinessHours = { start: '09:00', end: '20:00', isClosed: false };
const INITIAL_WEEK = {
    mon: { ...INITIAL_HOURS },
    tue: { ...INITIAL_HOURS },
    wed: { ...INITIAL_HOURS },
    thu: { ...INITIAL_HOURS },
    fri: { ...INITIAL_HOURS },
    sat: { ...INITIAL_HOURS, end: '17:00' },
    sun: { ...INITIAL_HOURS, isClosed: true },
};

const StaffManagement = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    // Fetch Data
    useEffect(() => {
        const fetchClinic = async () => {
            if (!user?.uid) return;
            try {
                const { data, error } = await supabase
                    .from('clinics')
                    .select('*')
                    .eq('owner_uid', user.uid)
                    .single();

                if (error) throw error;

                if (data) {
                    setClinic(data);

                    // 1. Ensure menu items have IDs (Migration)
                    let loadedMenuItems = data.menu_items || [];
                    if (loadedMenuItems.some((item: any) => !item.id)) {
                        console.log('Migrating menu items: Adding missing IDs');
                        loadedMenuItems = loadedMenuItems.map((item: any) => ({
                            ...item,
                            id: item.id || crypto.randomUUID()
                        }));

                        // Save fixed menu items immediately
                        await supabase
                            .from('clinics')
                            .update({ menu_items: loadedMenuItems })
                            .eq('owner_uid', user.uid);
                    }
                    setMenuItems(loadedMenuItems);

                    // 2. Ensure staff has all required fields (Migration)
                    const loadedStaff = (data.staff_info || []).map((s: any) => ({
                        id: s.id || crypto.randomUUID(),
                        name: s.name || '',
                        role: s.role || '',
                        imageUrl: s.imageUrl || s.image_url || '',
                        description: s.description || '',
                        skillIds: s.skillIds || s.skill_ids || [],
                        defaultSchedule: s.defaultSchedule || s.default_schedule || INITIAL_WEEK,
                        scheduleOverrides: s.scheduleOverrides || s.schedule_overrides || {}
                    }));
                    setStaffList(loadedStaff);
                }
            } catch (err) {
                console.error('Error fetching clinic:', err);
            } finally {
                setFetching(false);
            }
        };
        fetchClinic();
    }, [user]);

    const saveData = async (newStaffList: Staff[]) => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('clinics')
                .update({
                    staff_info: newStaffList,
                    updated_at: new Date().toISOString()
                })
                .eq('owner_uid', user.uid);

            if (error) throw error;
            setStaffList(newStaffList);
            setIsModalOpen(false);
            setEditingStaff(null);
        } catch (err: any) {
            console.error('Error saving data:', err);
            alert('保存に失敗しました: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStaff = async (staffToSave: Staff) => {
        let newStaffList = [...staffList];
        const index = newStaffList.findIndex(s => s.id === staffToSave.id);

        if (index >= 0) {
            newStaffList[index] = staffToSave;
        } else {
            newStaffList.push(staffToSave);
        }

        await saveData(newStaffList);
    };

    const handleDeleteStaff = async (id: string) => {
        if (!confirm('このスタッフを削除しますか？')) return;
        const newStaffList = staffList.filter(s => s.id !== id);
        await saveData(newStaffList);
    };

    const openNewStaffModal = () => {
        setEditingStaff({
            id: crypto.randomUUID(),
            name: '',
            role: '',
            imageUrl: '',
            description: '',
            skillIds: [],
            defaultSchedule: JSON.parse(JSON.stringify(INITIAL_WEEK)), // Deep copy
            scheduleOverrides: {}
        });
        setIsModalOpen(true);
    };



    if (fetching) {
        return (
            <PageLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">スタッフ管理</h1>
                        <p className="text-gray-500 mt-1">スタッフの登録、シフト設定、対応メニューの管理を行います</p>
                    </div>
                    <button
                        onClick={openNewStaffModal}
                        className="flex items-center px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-primary/90 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        スタッフ追加
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staffList.map(staff => (
                        <div key={staff.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                        {staff.imageUrl ? (
                                            <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{staff.name}</h3>
                                        <p className="text-sm text-gray-500">{staff.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setEditingStaff(staff); setIsModalOpen(true); }}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteStaff(staff.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Check className="w-4 h-4 mr-2 text-green-500" />
                                    対応メニュー: {staff.skillIds.length}件
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                    シフト設定済み
                                </div>
                            </div>
                        </div>
                    ))}

                    {staffList.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                            スタッフが登録されていません。<br />
                            右上のボタンから追加してください。
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                {isModalOpen && editingStaff && (
                    <StaffEditorModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        initialStaff={editingStaff}
                        onSave={handleSaveStaff}
                        menuItems={menuItems}
                    />
                )}
            </div>
        </PageLayout>
    );
};

export default StaffManagement;
