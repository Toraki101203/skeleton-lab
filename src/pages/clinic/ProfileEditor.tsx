import { useState, useEffect } from 'react';
import { Save, MapPin, Building, Clock, Layout, List, Plus, Trash2, Image as ImageIcon, Users, ExternalLink, UserCheck, MessageCircle, HelpCircle, Instagram, Twitter, Facebook } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import BusinessHoursEditor from '../../components/clinic/BusinessHoursEditor';
import StaffEditorModal from '../../components/clinic/StaffEditorModal';
import ImageUploader from '../../components/ImageUploader';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { BusinessHours, Staff, MenuItem } from '../../types';

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
    const [clinicId, setClinicId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [hours, setHours] = useState(INITIAL_WEEK);
    const [templateId, setTemplateId] = useState('standard');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [staffInfo, setStaffInfo] = useState<Staff[]>([]);
    const [directorInfo, setDirectorInfo] = useState({ name: '', title: '', message: '', imageUrl: '' });
    const [newsItems, setNewsItems] = useState<{ date: string; title: string; content: string }[]>([]);
    const [faqItems, setFaqItems] = useState<{ question: string; answer: string }[]>([]);
    const [accessDetails, setAccessDetails] = useState('');
    const [socialLinks, setSocialLinks] = useState({ instagram: '', twitter: '', facebook: '', website: '' });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

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
                    if (data.staff_info) {
                        // Migration for old staff data
                        const loadedStaff = data.staff_info.map((s: any) => ({
                            id: s.id || crypto.randomUUID(),
                            name: s.name || '',
                            role: s.role || '',
                            imageUrl: s.imageUrl || s.image_url || '',
                            description: s.description || '',
                            skillIds: s.skillIds || s.skill_ids || [],
                            defaultSchedule: s.defaultSchedule || s.default_schedule || INITIAL_WEEK,
                            scheduleOverrides: s.scheduleOverrides || s.schedule_overrides || {}
                        }));
                        setStaffInfo(loadedStaff);
                    }
                    if (data.director_info) setDirectorInfo(data.director_info);
                    if (data.news_items) setNewsItems(data.news_items);
                    if (data.faq_items) setFaqItems(data.faq_items);
                    if (data.access_details) setAccessDetails(data.access_details);
                    if (data.social_links) setSocialLinks(data.social_links);
                    if (data.id) setClinicId(data.id);
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
                director_info: directorInfo,
                news_items: newsItems,
                faq_items: faqItems,
                access_details: accessDetails,
                social_links: socialLinks,
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
                if (!error) setClinicId(existing.id);
            } else {
                // Insert
                const { data: newClinic, error: insertError } = await supabase
                    .from('clinics')
                    .insert([clinicData])
                    .select()
                    .single();
                error = insertError;
                if (newClinic) setClinicId(newClinic.id);
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
    const addMenuItem = () => setMenuItems([...menuItems, {
        id: crypto.randomUUID(),
        name: '',
        price: 0,
        description: '',
        duration: 60,
        bufferTime: 0,
        category: '',
        taxType: 'tax_included'
    }]);
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
    const addStaff = () => {
        setEditingStaff({
            id: crypto.randomUUID(),
            name: '',
            role: '',
            imageUrl: '',
            description: '',
            skillIds: [],
            defaultSchedule: JSON.parse(JSON.stringify(INITIAL_WEEK)),
            scheduleOverrides: {}
        });
        setIsModalOpen(true);
    };
    const handleSaveStaff = (staff: Staff) => {
        const index = staffInfo.findIndex(s => s.id === staff.id);
        if (index >= 0) {
            const newStaff = [...staffInfo];
            newStaff[index] = staff;
            setStaffInfo(newStaff);
        } else {
            setStaffInfo([...staffInfo, staff]);
        }
        setIsModalOpen(false);
        setEditingStaff(null);
    };
    const removeStaff = (index: number) => setStaffInfo(staffInfo.filter((_, i) => i !== index));

    // News Handlers
    const addNewsItem = () => setNewsItems([...newsItems, { date: new Date().toISOString().split('T')[0], title: '', content: '' }]);
    const updateNewsItem = (index: number, field: string, value: string) => {
        const newItems = [...newsItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setNewsItems(newItems);
    };
    const removeNewsItem = (index: number) => setNewsItems(newsItems.filter((_, i) => i !== index));

    // FAQ Handlers
    const addFaqItem = () => setFaqItems([...faqItems, { question: '', answer: '' }]);
    const updateFaqItem = (index: number, field: string, value: string) => {
        const newItems = [...faqItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setFaqItems(newItems);
    };
    const removeFaqItem = (index: number) => setFaqItems(faqItems.filter((_, i) => i !== index));

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
                        <h1 className="text-3xl font-bold text-gray-800">ページ作成・編集</h1>
                        <p className="text-gray-500 mt-1">医院ページの作成、デザイン選択、メニュー・スタッフ登録を行います</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                if (clinicId) {
                                    window.open(`/clinic/${clinicId}`, '_blank');
                                } else {
                                    alert('まずは「変更を保存」ボタンを押して、基本情報を保存してください。');
                                }
                            }}
                            className={`flex items-center px-6 py-3 border-2 rounded-xl font-bold transition-all ${clinicId
                                ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                                }`}
                        >
                            <ExternalLink className="w-5 h-5 mr-2" />
                            公開ページを確認
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-primary/90 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? '保存中...' : '変更を保存'}
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Section 1: Basic Information (Full Width) */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <Building className="w-6 h-6 mr-3 text-primary" />
                            基本情報
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">医院名 <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="例: 六本木整体院"
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900 bg-white"
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
                                            className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">紹介文・特徴</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        placeholder="医院の特徴や、患者様へのメッセージを入力してください..."
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none text-gray-900 bg-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">アクセス詳細</label>
                                    <textarea
                                        value={accessDetails}
                                        onChange={(e) => setAccessDetails(e.target.value)}
                                        rows={4}
                                        placeholder="駅からの道順や駐車場の案内など..."
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none text-gray-900 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">SNSリンク</label>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Instagram className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                            <input type="text" value={socialLinks.instagram} onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })} className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 bg-white" placeholder="Instagram URL" />
                                        </div>
                                        <div className="relative">
                                            <Twitter className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                            <input type="text" value={socialLinks.twitter} onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })} className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 bg-white" placeholder="X (Twitter) URL" />
                                        </div>
                                        <div className="relative">
                                            <Facebook className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                            <input type="text" value={socialLinks.facebook} onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })} className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 bg-white" placeholder="Facebook URL" />
                                        </div>
                                        <div className="relative">
                                            <ExternalLink className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                            <input type="text" value={socialLinks.website} onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })} className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 bg-white" placeholder="公式サイト URL" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Business Hours (Full Width) */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <Clock className="w-6 h-6 mr-3 text-primary" />
                            診療時間
                        </h2>
                        <BusinessHoursEditor value={hours} onChange={setHours} />
                    </div>

                    {/* Section 3: Content Modules (Grid) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-8">
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

                            {/* Director Info */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <UserCheck className="w-5 h-5 mr-2 text-primary" />
                                    院長挨拶
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                                            {directorInfo.imageUrl ? (
                                                <div className="relative w-full h-full group">
                                                    <img src={directorInfo.imageUrl} alt="Director" className="w-full h-full object-cover" />
                                                    <button onClick={() => setDirectorInfo({ ...directorInfo, imageUrl: '' })} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">削除</button>
                                                </div>
                                            ) : (
                                                <ImageUploader onUpload={(url) => setDirectorInfo({ ...directorInfo, imageUrl: url })} label="写真" className="scale-75" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input type="text" value={directorInfo.title} onChange={(e) => setDirectorInfo({ ...directorInfo, title: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="肩書き (例: 院長)" />
                                            <input type="text" value={directorInfo.name} onChange={(e) => setDirectorInfo({ ...directorInfo, name: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="氏名" />
                                        </div>
                                    </div>
                                    <textarea
                                        value={directorInfo.message}
                                        onChange={(e) => setDirectorInfo({ ...directorInfo, message: e.target.value })}
                                        rows={4}
                                        placeholder="患者様へのメッセージ..."
                                        className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
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
                                            <div className="mb-2">
                                                <input type="text" value={item.name} onChange={(e) => updateMenuItem(index, 'name', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="メニュー名" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-2 text-gray-400 text-xs">¥</span>
                                                    <input type="number" value={item.price} onChange={(e) => updateMenuItem(index, 'price', parseInt(e.target.value) || 0)} className="w-full pl-6 p-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="料金" />
                                                </div>
                                                <div className="relative">
                                                    <Clock className="absolute left-2 top-2.5 text-gray-400 w-3 h-3" />
                                                    <input type="number" value={item.duration} onChange={(e) => updateMenuItem(index, 'duration', parseInt(e.target.value) || 0)} className="w-full pl-7 p-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="分" />
                                                    <span className="absolute right-2 top-2 text-gray-400 text-xs">分</span>
                                                </div>
                                            </div>
                                            <input type="text" value={item.description} onChange={(e) => updateMenuItem(index, 'description', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="説明 (任意)" />
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
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setEditingStaff(staff); setIsModalOpen(true); }}
                                                    className="p-1 text-gray-400 hover:text-primary transition-colors"
                                                >
                                                    <Layout className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeStaff(index)}
                                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Staff Image */}
                                            <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
                                                {staff.imageUrl ? (
                                                    <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="w-8 h-8 text-gray-300" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="font-bold text-gray-800">{staff.name || '（氏名未入力）'}</div>
                                                <div className="text-sm text-gray-500">{staff.role || '（役職なし）'}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    対応メニュー: {staff.skillIds.length}件
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {staffInfo.length === 0 && (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            スタッフが登録されていません
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Staff Edit Modal */}
                            {isModalOpen && editingStaff && (
                                <StaffEditorModal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                    initialStaff={editingStaff}
                                    onSave={handleSaveStaff}
                                    menuItems={menuItems}
                                />
                            )}

                            {/* News Editor */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                        <MessageCircle className="w-5 h-5 mr-2 text-primary" />
                                        お知らせ
                                    </h2>
                                    <button onClick={addNewsItem} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-bold flex items-center transition-colors">
                                        <Plus className="w-4 h-4 mr-1" /> 追加
                                    </button>
                                </div>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {newsItems.map((item, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                                            <button onClick={() => removeNewsItem(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <input type="date" value={item.date} onChange={(e) => updateNewsItem(index, 'date', e.target.value)} className="w-full mb-2 p-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" />
                                            <input type="text" value={item.title} onChange={(e) => updateNewsItem(index, 'title', e.target.value)} className="w-full mb-2 p-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="タイトル" />
                                            <textarea value={item.content} onChange={(e) => updateNewsItem(index, 'content', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white resize-none" rows={2} placeholder="内容" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* FAQ Editor */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                        <HelpCircle className="w-5 h-5 mr-2 text-primary" />
                                        よくある質問 (FAQ)
                                    </h2>
                                    <button onClick={addFaqItem} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-bold flex items-center transition-colors">
                                        <Plus className="w-4 h-4 mr-1" /> 追加
                                    </button>
                                </div>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {faqItems.map((item, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                                            <button onClick={() => removeFaqItem(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <input type="text" value={item.question} onChange={(e) => updateFaqItem(index, 'question', e.target.value)} className="w-full mb-2 p-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="質問 (Q)" />
                                            <textarea value={item.answer} onChange={(e) => updateFaqItem(index, 'answer', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white resize-none" rows={3} placeholder="回答 (A)" />
                                        </div>
                                    ))}
                                </div>
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
