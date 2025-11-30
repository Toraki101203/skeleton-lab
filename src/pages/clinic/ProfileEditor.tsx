import { useState, useEffect } from 'react';
import { Save, MapPin, Building, FileText, Clock, Layout, List, Plus, Trash2, Image as ImageIcon, Users } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import BusinessHoursEditor from '../../components/clinic/BusinessHoursEditor';
import ImageUploader from '../../components/ImageUploader';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { BusinessHours } from '../../types';

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

const TEMPLATES = [
    { id: 'standard', name: 'スタンダード', description: '清潔感のある標準的なデザイン', color: 'bg-blue-50 border-blue-200' },
    { id: 'warm', name: 'ウォーム', description: '温かみのある優しいデザイン', color: 'bg-orange-50 border-orange-200' },
    { id: 'modern', name: 'モダン', description: '黒を基調とした洗練されたデザイン', color: 'bg-slate-50 border-slate-200' },
];

const ProfileEditor = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [hours, setHours] = useState(INITIAL_WEEK);
    const [templateId, setTemplateId] = useState('standard');
    const [menuItems, setMenuItems] = useState<{ name: string; price: number; description: string }[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [staffInfo, setStaffInfo] = useState<{ name: string; imageUrl: string; role: string }[]>([]);

    // Fetch existing data
    useEffect(() => {
        const fetchClinic = async () => {
            if (!user?.uid) return;

            try {
                const { data, error } = await supabase
                    .from('clinics')
                    .select('*')
                    .eq('owner_uid', user.uid)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching clinic:', error);
                }

                if (data) {
                    setName(data.name || '');
                    setDescription(data.description || '');
                    setAddress(data.location?.address || '');
                    if (data.business_hours) setHours(data.business_hours);
                    if (data.template_id) setTemplateId(data.template_id);
                    if (data.menu_items) setMenuItems(data.menu_items);
                    if (data.images) setImages(data.images);
                    if (data.staff_info) setStaffInfo(data.staff_info);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setFetching(false);
            }
        };
        fetchClinic();
    }, [user]);

    const handleSave = async () => {
        if (!user?.uid) return;
        if (!name) {
            alert('医院名は必須です');
            return;
        }

        setLoading(true);
        try {
            // Check if clinic exists
            const { data: existing } = await supabase
                .from('clinics')
                .select('id')
                .eq('owner_uid', user.uid)
                .single();

            const clinicData = {
                owner_uid: user.uid,
                name,
                description,
                location: { address },
                business_hours: hours,
                template_id: templateId,
                menu_items: menuItems,
                images,
                staff_info: staffInfo,
                updated_at: new Date().toISOString()
            };

            let error;
            if (existing) {
                // Update
                const { error: updateError } = await supabase
                    .from('clinics')
                    .update(clinicData)
                    .eq('owner_uid', user.uid);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('clinics')
                    .insert([clinicData]);
                error = insertError;
            }

            if (error) throw error;

            alert('基本情報を保存しました');
        } catch (error: any) {
            console.error("Failed to update profile", error);
            alert(`保存に失敗しました: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Menu Handlers
    const addMenuItem = () => setMenuItems([...menuItems, { name: '', price: 0, description: '' }]);
    const updateMenuItem = (index: number, field: string, value: any) => {
        const newItems = [...menuItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setMenuItems(newItems);
    };
    const removeMenuItem = (index: number) => setMenuItems(menuItems.filter((_, i) => i !== index));

    // Image Handlers
    const handleImageUpload = (url: string) => {
        if (images.length >= 10) {
            alert('画像は最大10枚までです');
            return;
        }
        setImages([...images, url]);
    };
    const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

    // Staff Handlers
    const addStaff = () => setStaffInfo([...staffInfo, { name: '', imageUrl: '', role: '' }]);
    const updateStaff = (index: number, field: string, value: any) => {
        const newStaff = [...staffInfo];
        newStaff[index] = { ...newStaff[index], [field]: value };
        setStaffInfo(newStaff);
    };
    const removeStaff = (index: number) => setStaffInfo(staffInfo.filter((_, i) => i !== index));

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
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">ページ作成・編集</h1>
                        <p className="text-gray-500 mt-1">医院ページの作成、デザイン選択、メニュー・スタッフ登録を行います</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-primary/90 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {loading ? '保存中...' : '変更を保存'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Template Selection */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Layout className="w-5 h-5 mr-2 text-primary" />
                                デザインテンプレート
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                {TEMPLATES.map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => setTemplateId(t.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${templateId === t.id
                                            ? 'border-primary bg-blue-50 ring-2 ring-primary/20'
                                            : 'border-gray-100 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="font-bold text-gray-800">{t.name}</div>
                                        <div className="text-sm text-gray-500">{t.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Clinic Name & Address */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Building className="w-5 h-5 mr-2 text-primary" />
                                医院情報
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">医院名 <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="例: 六本木整体院"
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">住所</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="例: 東京都港区六本木1-1-1"
                                            className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-primary" />
                                紹介文・特徴
                            </h2>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                placeholder="医院の特徴や、患者様へのメッセージを入力してください..."
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Clinic Images */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                    <ImageIcon className="w-5 h-5 mr-2 text-primary" />
                                    医院画像 (最大10枚)
                                </h2>
                                <span className="text-sm text-gray-500">{images.length} / 10</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {images.map((url, index) => (
                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden group border border-gray-200">
                                        <img src={url} alt={`Clinic ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 10 && (
                                    <div className="aspect-video flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        <ImageUploader onUpload={handleImageUpload} label="追加" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col h-full space-y-6">
                        {/* Business Hours */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-primary" />
                                診療時間
                            </h2>
                            <BusinessHoursEditor value={hours} onChange={setHours} />
                        </div>

                        {/* Menu Editor */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                    <List className="w-5 h-5 mr-2 text-primary" />
                                    メニュー・料金
                                </h2>
                                <button onClick={addMenuItem} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-bold flex items-center transition-colors">
                                    <Plus className="w-4 h-4 mr-1" /> 追加
                                </button>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {menuItems.map((item, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                                        <button onClick={() => removeMenuItem(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-3 gap-3 mb-2">
                                            <div className="col-span-2">
                                                <input type="text" value={item.name} onChange={(e) => updateMenuItem(index, 'name', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="メニュー名" />
                                            </div>
                                            <div>
                                                <input type="number" value={item.price} onChange={(e) => updateMenuItem(index, 'price', parseInt(e.target.value) || 0)} className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="料金" />
                                            </div>
                                        </div>
                                        <input type="text" value={item.description} onChange={(e) => updateMenuItem(index, 'description', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="説明" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Staff Editor */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-primary" />
                                    スタッフ紹介
                                </h2>
                                <button onClick={addStaff} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-bold flex items-center transition-colors">
                                    <Plus className="w-4 h-4 mr-1" /> 追加
                                </button>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {staffInfo.map((staff, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group flex gap-4 items-start">
                                        <button onClick={() => removeStaff(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        {/* Staff Image */}
                                        <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
                                            {staff.imageUrl ? (
                                                <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageUploader onUpload={(url) => updateStaff(index, 'imageUrl', url)} label="写真" className="scale-75" />
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <input type="text" value={staff.name} onChange={(e) => updateStaff(index, 'name', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="スタッフ名" />
                                            <input type="text" value={staff.role} onChange={(e) => updateStaff(index, 'role', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="役職・一言" />
                                            {staff.imageUrl && (
                                                <button onClick={() => updateStaff(index, 'imageUrl', '')} className="text-xs text-red-500 hover:underline">画像を削除</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

// Helper for X icon
const X = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

export default ProfileEditor;
