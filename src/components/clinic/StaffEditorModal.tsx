import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Calendar, Check } from 'lucide-react';
import type { Staff, MenuItem } from '../../types';
import BusinessHoursEditor from './BusinessHoursEditor';
import ImageUploader from '../ImageUploader';

interface StaffEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialStaff: Staff;
    onSave: (staff: Staff) => void;
    menuItems: MenuItem[];
}

const StaffEditorModal = ({ isOpen, onClose, initialStaff, onSave, menuItems }: StaffEditorModalProps) => {
    const [editingStaff, setEditingStaff] = useState<Staff>(initialStaff);
    const [activeTab, setActiveTab] = useState<'basic' | 'skills' | 'shifts'>('basic');

    // Reset state when modal opens with new staff
    useEffect(() => {
        setEditingStaff(initialStaff);
        setActiveTab('basic');
    }, [initialStaff, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!editingStaff.name) {
            alert('スタッフ名は必須です');
            return;
        }
        onSave(editingStaff);
    };

    const toggleSkill = (menuId: string) => {
        const newSkillIds = editingStaff.skillIds.includes(menuId)
            ? editingStaff.skillIds.filter(id => id !== menuId)
            : [...editingStaff.skillIds, menuId];
        setEditingStaff({ ...editingStaff, skillIds: newSkillIds });
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <h3 className="text-xl font-bold text-gray-800">スタッフ編集</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex border-b border-gray-100 shrink-0">
                    <button
                        onClick={() => setActiveTab('basic')}
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'basic' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        基本情報
                    </button>
                    <button
                        onClick={() => setActiveTab('skills')}
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'skills' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        対応メニュー ({editingStaff.skillIds.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('shifts')}
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'shifts' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        シフト設定
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {activeTab === 'basic' && (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="flex gap-6">
                                <div className="w-32 h-32 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 overflow-hidden relative group">
                                    {editingStaff.imageUrl ? (
                                        <>
                                            <img src={editingStaff.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setEditingStaff({ ...editingStaff, imageUrl: '' })}
                                                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                            >
                                                削除
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center flex flex-col items-center justify-center h-full w-full">
                                            <User className="w-8 h-8 text-gray-400 mb-2" />
                                            <ImageUploader
                                                onUpload={(url) => setEditingStaff({ ...editingStaff, imageUrl: url })}
                                                label="追加"
                                                className="scale-90"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">氏名 <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={editingStaff.name}
                                            onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900 bg-white"
                                            placeholder="山田 花子"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">役職・肩書き</label>
                                        <input
                                            type="text"
                                            value={editingStaff.role}
                                            onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900 bg-white"
                                            placeholder="院長 / 鍼灸師"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">画像</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="text"
                                        value={editingStaff.imageUrl || ''}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, imageUrl: e.target.value })}
                                        className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900 bg-white text-sm"
                                        placeholder="https://..."
                                    />
                                    <ImageUploader
                                        onUpload={(url) => setEditingStaff({ ...editingStaff, imageUrl: url })}
                                        label="アップロード"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">自己紹介・経歴</label>
                                <textarea
                                    value={editingStaff.description || ''}
                                    onChange={(e) => setEditingStaff({ ...editingStaff, description: e.target.value })}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none text-gray-900 bg-white"
                                    rows={4}
                                    placeholder="資格や得意な施術など..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="max-w-3xl mx-auto">
                            <p className="text-sm text-gray-500 mb-6">このスタッフが担当可能なメニューを選択してください</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {menuItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleSkill(item.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${editingStaff.skillIds.includes(item.id)
                                            ? 'border-primary bg-blue-50'
                                            : 'border-gray-100 hover:border-gray-200 bg-white'
                                            }`}
                                    >
                                        <div>
                                            <div className={`font-bold ${editingStaff.skillIds.includes(item.id) ? 'text-primary' : 'text-gray-700'}`}>
                                                {item.name}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">{item.category} | {item.duration}分</div>
                                        </div>
                                        {editingStaff.skillIds.includes(item.id) && (
                                            <Check className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                ))}
                                {menuItems.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-gray-400">
                                        メニューが登録されていません。<br />
                                        先にメニュー管理からメニューを追加してください。
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'shifts' && (
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-blue-50 p-4 rounded-xl mb-6 flex items-start">
                                <Calendar className="w-5 h-5 text-primary mr-3 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-primary mb-1">基本シフト設定</h4>
                                    <p className="text-sm text-blue-600">
                                        このスタッフの基本的な勤務時間を設定します。<br />
                                        クリニック全体の営業時間内で設定してください。
                                    </p>
                                </div>
                            </div>
                            <BusinessHoursEditor
                                value={editingStaff.defaultSchedule}
                                onChange={(newSchedule) => setEditingStaff({ ...editingStaff, defaultSchedule: newSchedule })}
                            />
                        </div>
                    )}
                </div>

                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-primary/90 hover:scale-[1.02] transition-all"
                    >
                        保存する
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StaffEditorModal;
