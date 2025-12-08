import { useState, useEffect } from 'react';
import { Search, Building, MapPin, CheckCircle, XCircle, AlertCircle, Edit } from 'lucide-react';
import { getAllClinics, updateClinicProfile } from '../../services/db';
import type { Clinic } from '../../types';
import { useNavigate } from 'react-router-dom';

const ClinicManagement = () => {
    const navigate = useNavigate();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [query, setQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
    const [isLoading, setIsLoading] = useState(true);

    const fetchClinics = async () => {
        setIsLoading(true);
        try {
            const data = await getAllClinics();
            setClinics(data);
        } catch (error) {
            console.error('Error fetching clinics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClinics();
    }, []);

    const handleStatusChange = async (clinicId: string, newStatus: 'active' | 'suspended' | 'pending') => {
        if (!confirm(`クリニックのステータスを ${newStatus} に変更しますか？`)) return;

        try {
            await updateClinicProfile(clinicId, { status: newStatus });
            setClinics(clinics.map(c => c.id === clinicId ? { ...c, status: newStatus } : c));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('ステータスの更新に失敗しました');
        }
    };

    const filteredClinics = clinics.filter(c => {
        const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase()) ||
            (c.location?.address && c.location.address.includes(query));
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesQuery && matchesStatus;
    });

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'active':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> 公開中</span>;
            case 'pending':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> 承認待ち</span>;
            case 'suspended':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> 停止中</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">未設定</span>;
        }
    };

    return (
        <div className="flex h-full flex-col gap-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
                        <Building className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">総掲載数</div>
                        <div className="text-2xl font-bold text-gray-800">{clinics.length}</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">公開中</div>
                        <div className="text-2xl font-bold text-gray-800">{clinics.filter(c => c.status === 'active').length}</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg mr-4">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">承認待ち</div>
                        <div className="text-2xl font-bold text-gray-800">{clinics.filter(c => c.status === 'pending').length}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="クリニック名、住所で検索..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-600 font-medium"
                        >
                            <option value="all">すべてのステータス</option>
                            <option value="active">公開中</option>
                            <option value="pending">承認待ち</option>
                            <option value="suspended">停止中</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Clinic List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1 p-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40 text-gray-400">Loading...</div>
                    ) : filteredClinics.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            該当するクリニックが見つかりません
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredClinics.map((clinic) => (
                                <div key={clinic.id} className="group border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all bg-white">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {clinic.images && clinic.images[0] ? (
                                                    <img src={clinic.images[0]} alt={clinic.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Building className="w-8 h-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="tex-lg font-bold text-gray-800">{clinic.name}</h3>
                                                    {getStatusBadge(clinic.status)}
                                                </div>
                                                <div className="text-sm text-gray-500 mb-2 flex items-center">
                                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                                    {clinic.location?.address || '住所未設定'}
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2 max-w-2xl">
                                                    {clinic.description || '説明文がありません'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 items-end">
                                            <div className="flex gap-2">
                                                {clinic.status !== 'active' && (
                                                    <button
                                                        onClick={() => handleStatusChange(clinic.id, 'active')}
                                                        className="px-3 py-1.5 text-xs font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                                                    >
                                                        承認・公開
                                                    </button>
                                                )}
                                                {clinic.status === 'active' && (
                                                    <button
                                                        onClick={() => handleStatusChange(clinic.id, 'suspended')}
                                                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-400 rounded-lg hover:bg-red-500 transition-colors"
                                                    >
                                                        停止
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/admin/clinics/${clinic.id}`)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono mt-2">ID: {clinic.id}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClinicManagement;
