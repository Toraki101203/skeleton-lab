import { Clock, User } from 'lucide-react';
import type { Reservation, MenuItem } from '../../types';

interface ListViewProps {
    reservations: Reservation[];
    menuItems: MenuItem[];
    onReservationClick: (reservation: Reservation) => void;
}

const ListView = ({ reservations, menuItems, onReservationClick }: ListViewProps) => {
    // Sort by date and time
    const sorted = [...reservations].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
    });

    if (sorted.length === 0) {
        return (
            <div className="flex items-center justify-center p-12 text-gray-400">
                表示する予約がありません
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto bg-white p-6">
            <div className="space-y-4 max-w-4xl mx-auto">
                {sorted.map(res => {
                    const menu = menuItems.find(m => m.id === res.menuItemId);
                    const isConfirmed = res.status === 'confirmed';

                    return (
                        <div
                            key={res.id}
                            onClick={() => onReservationClick(res)}
                            className="flex items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                        >
                            {/* Date/Time Block */}
                            <div className="w-32 shrink-0 border-r border-gray-100 mr-4">
                                <div className="text-xs text-gray-500 font-bold mb-1">{res.date}</div>
                                <div className="text-xl font-bold text-gray-800 flex items-center">
                                    <Clock className="w-4 h-4 mr-1 text-primary" />
                                    {res.startTime}
                                </div>
                                <div className="text-xs text-gray-400 pl-5">~ {res.endTime}</div>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-lg text-gray-800 truncate">{res.patientName} 様</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${isConfirmed ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {isConfirmed ? '確定' : 'キャンセル'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {/* We might need staff name here by mapping staffId to staffList if passed, but keeping simple for now */}
                                        <span>担当: {res.staffId === 'free' ? '指名なし' : '指名あり'}</span>
                                    </div>
                                    <div className="text-gray-400">|</div>
                                    <div>{menu?.name || 'メニュー未設定'}</div>
                                    {menu && <div className="text-gray-400">({menu.duration}分)</div>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ListView;
