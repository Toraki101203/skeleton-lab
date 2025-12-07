import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Clock } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';


interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    bufferTime: number;
    category: string;
    taxType: 'tax_included' | 'tax_excluded';
}

const DEFAULT_CATEGORIES = ['鍼灸院', '整骨院', '接骨院', '一般', '自費診療'];

const MenuManagement = () => {
    const { user } = useAuth();

    const [fetching, setFetching] = useState(true);

    // Data State
    const [categories, setCategories] = useState<string[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    // UI State
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);

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
                    // Map DB fields to TS types (snake_case to camelCase if needed, but here we use the JSON structure directly)
                    // Note: Supabase returns JSONB columns as objects/arrays directly.
                    const loadedCategories = (data.menu_categories && data.menu_categories.length > 0) ? data.menu_categories : DEFAULT_CATEGORIES;
                    const loadedItems = data.menu_items || [];


                    setCategories(loadedCategories);
                    setMenuItems(loadedItems);

                    if (loadedCategories.length > 0) {
                        setSelectedCategory(loadedCategories[0]);
                    }
                }
            } catch (err) {
                console.error('Error fetching clinic:', err);
            } finally {
                setFetching(false);
            }
        };
        fetchClinic();
    }, [user]);

    // Save Data Helper
    const saveData = async (newCategories: string[], newItems: MenuItem[]) => {
        if (!user?.uid) return;

        try {
            const { error } = await supabase
                .from('clinics')
                .update({
                    menu_categories: newCategories,
                    menu_items: newItems,
                    updated_at: new Date().toISOString()
                })
                .eq('owner_uid', user.uid);

            if (error) throw error;

            setCategories(newCategories);
            setMenuItems(newItems);
        } catch (err: any) {
            console.error('Error saving data:', err);
            alert('保存に失敗しました: ' + err.message);
        } finally {

        }
    };

    // Category Handlers
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        if (categories.includes(newCategoryName)) {
            alert('そのカテゴリは既に存在します');
            return;
        }

        const newCategories = [...categories, newCategoryName];
        await saveData(newCategories, menuItems);
        setSelectedCategory(newCategoryName);
        setNewCategoryName('');
        setIsEditingCategory(false);
    };

    const handleDeleteCategory = async (category: string) => {
        if (!confirm(`カテゴリ「${category}」を削除しますか？\n含まれるメニューも削除されます。`)) return;

        const newCategories = categories.filter(c => c !== category);
        const newItems = menuItems.filter(i => i.category !== category);

        await saveData(newCategories, newItems);
        if (selectedCategory === category && newCategories.length > 0) {
            setSelectedCategory(newCategories[0]);
        } else if (newCategories.length === 0) {
            setSelectedCategory('');
        }
    };

    // Item Handlers
    const handleSaveItem = async () => {
        if (!editingItem) return;
        if (!editingItem.name) {
            alert('メニュー名は必須です');
            return;
        }

        let newItems = [...menuItems];
        const index = newItems.findIndex(i => i.id === editingItem.id);

        if (index >= 0) {
            newItems[index] = editingItem;
        } else {
            newItems.push(editingItem);
        }

        await saveData(categories, newItems);
        setIsItemModalOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('このメニューを削除しますか？')) return;
        const newItems = menuItems.filter(i => i.id !== id);
        await saveData(categories, newItems);
    };

    const openNewItemModal = () => {
        setEditingItem({
            id: crypto.randomUUID(),
            name: '',
            description: '',
            price: 0,
            duration: 30,
            bufferTime: 10,
            category: selectedCategory,
            taxType: 'tax_included'
        });
        setIsItemModalOpen(true);
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
                        <h1 className="text-3xl font-bold text-gray-800">メニュー・施術管理</h1>
                        <p className="text-gray-500 mt-1">予約可能なメニューの作成、料金、所要時間を設定します</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar: Categories */}
                    <div className="w-full lg:w-64 shrink-0 space-y-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                                <span>カテゴリ</span>
                                <button
                                    onClick={() => setIsEditingCategory(true)}
                                    className="text-primary hover:bg-blue-50 p-1 rounded-lg transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </h2>

                            {isEditingCategory && (
                                <div className="mb-4 p-2 bg-blue-50 rounded-lg">
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="カテゴリ名"
                                        className="w-full p-2 border border-blue-200 rounded-lg text-sm mb-2 text-gray-900 bg-white"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setIsEditingCategory(false)} className="text-xs text-gray-500">キャンセル</button>
                                        <button onClick={handleAddCategory} className="text-xs bg-primary text-white px-2 py-1 rounded">追加</button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                {categories.map(cat => (
                                    <div
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedCategory === cat
                                            ? 'bg-primary text-white shadow-md shadow-blue-200'
                                            : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <span className="font-medium truncate">{cat}</span>
                                        {selectedCategory === cat && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <div className="text-center py-4 text-gray-400 text-sm">
                                        カテゴリを追加してください
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Menu Items */}
                    <div className="flex-1">
                        {selectedCategory ? (
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[500px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                        <span className="bg-blue-100 text-primary px-3 py-1 rounded-lg text-sm mr-3">
                                            {selectedCategory}
                                        </span>
                                        メニュー一覧
                                    </h2>
                                    <button
                                        onClick={openNewItemModal}
                                        className="flex items-center px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-primary/90 transition-all"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        メニュー追加
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {menuItems.filter(item => item.category === selectedCategory).map(item => (
                                        <div key={item.id} className="group p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all bg-white">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                                                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                            {item.taxType === 'tax_included' ? '税込' : '税抜'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.description}</p>

                                                    <div className="flex items-center gap-6 text-sm">
                                                        <div className="flex items-center text-gray-700 font-bold">
                                                            <span className="text-gray-400 mr-1">¥</span>
                                                            {item.price.toLocaleString()}
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                                            施術: {item.duration}分
                                                        </div>
                                                        <div className="flex items-center text-gray-500">
                                                            <span className="w-4 h-4 mr-1 flex items-center justify-center text-xs font-bold border border-gray-300 rounded-full text-gray-400">+</span>
                                                            準備: {item.bufferTime}分
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setEditingItem(item); setIsItemModalOpen(true); }}
                                                        className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {menuItems.filter(item => item.category === selectedCategory).length === 0 && (
                                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                                            メニューがまだありません。<br />
                                            右上のボタンから追加してください。
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                                左側のリストからカテゴリを選択してください
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Item Modal */}
                {isItemModalOpen && editingItem && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-xl font-bold text-gray-800">メニュー編集</h3>
                                <button onClick={() => setIsItemModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">メニュー名 <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={editingItem.name}
                                            onChange={(e) => setEditingItem({ ...editingItem!, name: e.target.value })}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900 bg-white"
                                            placeholder=""
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">説明文</label>
                                        <textarea
                                            value={editingItem.description}
                                            onChange={(e) => setEditingItem({ ...editingItem!, description: e.target.value })}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none text-gray-900 bg-white"
                                            rows={3}
                                            placeholder="施術の内容や特徴を入力してください"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">料金 (円)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3.5 text-gray-400 font-bold">¥</span>
                                            <input
                                                type="number"
                                                value={editingItem.price}
                                                onChange={(e) => setEditingItem({ ...editingItem!, price: parseInt(e.target.value) || 0 })}
                                                className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900 bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">税区分</label>
                                        <select
                                            value={editingItem.taxType}
                                            onChange={(e) => setEditingItem({ ...editingItem!, taxType: e.target.value as any })}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white text-gray-900"
                                        >
                                            <option value="tax_included">税込</option>
                                            <option value="tax_excluded">税抜</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">施術時間 (分)</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                                            <input
                                                type="number"
                                                value={editingItem.duration}
                                                onChange={(e) => setEditingItem({ ...editingItem!, duration: parseInt(e.target.value) || 0 })}
                                                className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900 bg-white"
                                                step={5}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">患者様が受ける実際の時間</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">準備・片付け (分)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 flex items-center justify-center font-bold">+</span>
                                            <input
                                                type="number"
                                                value={editingItem.bufferTime}
                                                onChange={(e) => setEditingItem({ ...editingItem!, bufferTime: parseInt(e.target.value) || 0 })}
                                                className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900 bg-white"
                                                step={5}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">予約枠として確保する追加時間</p>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">カテゴリ</label>
                                        <select
                                            value={editingItem.category}
                                            onChange={(e) => setEditingItem({ ...editingItem!, category: e.target.value })}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white text-gray-900"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
                                <button
                                    onClick={() => setIsItemModalOpen(false)}
                                    className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSaveItem}
                                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-primary/90 hover:scale-[1.02] transition-all"
                                >
                                    保存する
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default MenuManagement;
