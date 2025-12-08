import { useState, useEffect } from 'react';
import { getAllBookings } from '../../services/db';
import { Search, Filter } from 'lucide-react';

interface AdminBooking {
    id: string;
    clinicId: string;
    clinicName?: string;
    userId?: string;
    staffId?: string;
    bookedBy: 'user' | 'proxy';
    status: 'confirmed' | 'cancelled' | 'pending' | 'no_show';
    startTime: Date;
    endTime: Date;
    notes?: string;
    guestName?: string;
    guestContact?: string;
    guestEmail?: string;
    internalMemo?: string;
    createdAt: Date;
}

const BookingOverview = () => {
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'no_show'>('all');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await getAllBookings();
                setBookings(data);
            } catch (error) {
                console.error('Error fetching all bookings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            (booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
            (booking.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
            (booking.id.includes(searchTerm));

        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

        // Optionally hide 'pending' from list if filtered, but we updated the filter state logic.
        // If status is 'pending', it will only show if filter is 'all'. 
        // User wants it GONE. So let's exclude pending unless specifically asked, but better to migrate data.
        // For now, let's just show it in 'all' but giving no option to filter FOR it.

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800'; // Keep for legacy display
            case 'no_show': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return '確定';
            case 'cancelled': return 'キャンセル';
            case 'pending': return '承認待ち';
            case 'no_show': return '無断キャンセル';
            default: return status;
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">予約・取引管理</h1>
                <p className="text-gray-500">全クリニックの予約状況を横断的に確認・検索できます。</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ゲスト名、クリニック名、予約IDで検索..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        すべて
                    </button>
                    <button
                        onClick={() => setStatusFilter('confirmed')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'confirmed' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                    >
                        確定
                    </button>
                    <button
                        onClick={() => setStatusFilter('cancelled')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={() => setStatusFilter('no_show')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'no_show' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                    >
                        無断キャンセル
                    </button>
                </div>
            </div>

            {/* Booking List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">ステータス</th>
                                <th className="px-6 py-4">予約日時</th>
                                <th className="px-6 py-4">ゲスト情報</th>
                                <th className="px-6 py-4">クリニック</th>
                                <th className="px-6 py-4">予約タイプ</th>
                                <th className="px-6 py-4 text-right">アクション</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        該当する予約が見つかりません
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                                                {getStatusLabel(booking.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">
                                                    {booking.startTime.toLocaleDateString('ja-JP')}
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                    {booking.startTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - {booking.endTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800">{booking.guestName || 'ゲスト'}</span>
                                                <span className="text-gray-400 text-xs">{booking.guestContact || booking.guestEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700">
                                            {booking.clinicName || '不明なクリニック'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {booking.bookedBy === 'proxy' ? '代理予約' : 'WEB予約'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                                                詳細
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-center text-xs text-gray-400 pb-8">
                表示件数: {filteredBookings.length} 件
            </div>
        </div>
    );
};

export default BookingOverview;
