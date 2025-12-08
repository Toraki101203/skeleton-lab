import { useState, useEffect } from 'react';
import { Search, Shield, Filter, Clock } from 'lucide-react';
import { getAuditLogs } from '../../services/db';
import type { AuditLog } from '../../types';

const formatAction = (action: string) => {
    switch (action) {
        case 'CREATE_RESERVATION':
            return { label: '新規予約', color: 'bg-blue-100 text-blue-700' };
        case 'UPDATE_RESERVATION_STATUS':
            return { label: 'ステータス変更', color: 'bg-purple-100 text-purple-700' };
        case 'UPDATE_BOOKING':
            return { label: '予約情報更新', color: 'bg-orange-100 text-orange-700' };
        case 'LOGIN':
            return { label: 'ログイン', color: 'bg-green-100 text-green-700' };
        default:
            return { label: action, color: 'bg-gray-100 text-gray-700' };
    }
};

const formatTarget = (log: AuditLog) => {
    if (log.action === 'UPDATE_RESERVATION_STATUS' && log.details) {
        const details = log.details as any;
        return (
            <div>
                <div className="font-medium text-gray-800">予約ステータス変更</div>
                <div className="text-xs text-gray-500 mt-0.5">
                    {details.previousStatus || '不明'} <span className="text-gray-400">→</span> <span className="font-bold text-gray-700">{details.status}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5 font-mono">{log.target}</div>
            </div>
        );
    }
    if (log.action === 'CREATE_RESERVATION' && log.details) {
        const details = log.details as any;
        return (
            <div>
                <div className="font-medium text-gray-800">予約作成: {details.guest || 'ゲスト'}</div>
                <div className="text-xs text-gray-400 mt-0.5 font-mono">{log.target}</div>
            </div>
        );
    }
    return <span className="text-gray-600">{log.target}</span>;
};

const AuditLogs = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getAuditLogs();
                setLogs(data);
            } catch (error) {
                console.error('Error fetching audit logs:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        (log.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.target?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading logs...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    操作ログ（監査ログ）
                </h1>
                <p className="text-gray-500">システム内の重要な操作履歴を確認できます。</p>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ユーザー、操作、対象で検索..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                    <Filter className="w-4 h-4" />
                    フィルター
                </button>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">日時</th>
                                <th className="px-6 py-4">操作ユーザー</th>
                                <th className="px-6 py-4">アクション</th>
                                <th className="px-6 py-4">内容</th>
                                <th className="px-6 py-4">IPアドレス</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        ログが見つかりません
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => {
                                    const actionFormat = formatAction(log.action);
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(log.createdAt).toLocaleString('ja-JP')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-800">{log.userEmail || log.userId || 'Unknown'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${actionFormat.color}`}>
                                                    {actionFormat.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {formatTarget(log)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 font-mono text-xs">{log.ipAddress || '-'}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
