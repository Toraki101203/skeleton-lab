import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building, MapPin, Globe, Loader } from 'lucide-react';
import { getClinic, updateClinicProfile } from '../../services/db';
import type { Clinic } from '../../types';

const ClinicDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Clinic>>({});

    useEffect(() => {
        const fetchClinic = async () => {
            if (!id) return;
            try {
                const data = await getClinic(id);
                setClinic(data);
                if (data) {
                    setFormData({
                        name: data.name,
                        description: data.description,
                        status: data.status || 'pending',
                        location: data.location,
                        socialLinks: data.socialLinks || {},
                    });
                }
            } catch (error) {
                console.error('Error fetching clinic:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClinic();
    }, [id]);

    const handleSave = async () => {
        if (!id || !clinic) return;
        setIsSaving(true);
        try {
            await updateClinicProfile(id, formData);
            setClinic({ ...clinic, ...formData as Clinic });
            alert('保存しました');
        } catch (error) {
            console.error('Error saving clinic:', error);
            alert('保存に失敗しました');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-full items-center justify-center text-gray-400"><Loader className="w-8 h-8 animate-spin" /></div>;
    }

    if (!clinic) {
        return <div className="text-center py-20 text-gray-400">クリニックが見つかりません</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/admin/clinics')}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">クリニック詳細・編集</h1>
                    <p className="text-sm text-gray-500">ID: {id}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? '保存中...' : '変更を保存'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Basic Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Building className="w-5 h-5 mr-2 text-primary" />
                            基本情報
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">クリニック名</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">説明文</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-primary" />
                            所在地・アクセス
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">住所</label>
                                <input
                                    type="text"
                                    value={formData.location?.address || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        location: { ...formData.location!, address: e.target.value }
                                    })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            {/* Lat/Lng could be added here if needed */}
                        </div>
                    </div>
                </div>

                {/* Right Column: Status & Settings */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">ステータス管理</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">現在の状態</label>
                                <select
                                    value={formData.status || 'pending'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="pending">承認待ち (Pending)</option>
                                    <option value="active">公開中 (Active)</option>
                                    <option value="suspended">停止中 (Suspended)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Globe className="w-5 h-5 mr-2 text-primary" />
                            SNSリンク
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Website</label>
                                <input
                                    type="text"
                                    value={formData.socialLinks?.website || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, website: e.target.value }
                                    })}
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Instagram</label>
                                <input
                                    type="text"
                                    value={formData.socialLinks?.instagram || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                                    })}
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                    placeholder="@username"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClinicDetail;
