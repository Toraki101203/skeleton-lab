import { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertTriangle } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';
import { getSiteSettings, saveSiteSettings } from '../../services/db';

interface LogoSettings {
    imageUrl: string;
    height: string;
    positionTop: string;
    positionLeft: string;
    opacity: number;
}

const SiteSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<LogoSettings>({
        imageUrl: '',
        height: '100px',
        positionTop: '20px',
        positionLeft: '20px',
        opacity: 100
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSiteSettings('home_logo_settings');
            if (data) {
                setSettings({
                    imageUrl: data.imageUrl || '',
                    height: data.height || '100px',
                    positionTop: data.positionTop || '20px',
                    positionLeft: data.positionLeft || '20px',
                    opacity: data.opacity ?? 100
                });
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await saveSiteSettings('home_logo_settings', settings);
            setMessage({ type: 'success', text: '設定を保存しました' });
        } catch (error) {
            console.error('Failed to save settings', error);
            setMessage({ type: 'error', text: '保存に失敗しました。site_settingsテーブルが存在するか確認してください。' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (url: string) => {
        setSettings(prev => ({ ...prev, imageUrl: url }));
    };

    if (loading) return <div className="p-8 text-center text-gray-500">読み込み中...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">サイト設定</h1>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">トップページ ロゴ画像設定</h2>
                    <p className="text-sm text-gray-500 mt-1">トップページの左上に表示する画像とその表示位置を設定します。</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">画像</label>
                        <div className="flex items-start gap-6">
                            <div className="w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                                {settings.imageUrl ? (
                                    <img
                                        src={settings.imageUrl}
                                        alt="Logo Preview"
                                        className="max-w-full max-h-full object-contain"
                                        style={{ opacity: settings.opacity / 100 }}
                                    />
                                ) : (
                                    <span className="text-gray-400 text-sm">画像なし</span>
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <ImageUploader onUpload={handleImageUpload} label="画像をアップロード" />
                                <div className="text-xs text-gray-500">
                                    <p>推奨サイズ: 透過PNG推奨</p>
                                    <p>現在選択中: {settings.imageUrl || 'なし'}</p>
                                </div>
                                {settings.imageUrl && (
                                    <button
                                        onClick={() => setSettings(prev => ({ ...prev, imageUrl: '' }))}
                                        className="text-sm text-red-500 hover:underline"
                                    >
                                        画像を削除
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Layout Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">高さ (Height)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={settings.height}
                                    onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                                    placeholder="例: 100px, 5rem"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                <span className="text-xs text-gray-500 shrink-0 w-24">CSS単位可</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">不透明度 (Opacity) %</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.opacity}
                                    onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value) })}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="w-12 text-right font-mono">{settings.opacity}%</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">上からの位置 (Top)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={settings.positionTop}
                                    onChange={(e) => setSettings({ ...settings, positionTop: e.target.value })}
                                    placeholder="例: 20px"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">左からの位置 (Left)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={settings.positionLeft}
                                    onChange={(e) => setSettings({ ...settings, positionLeft: e.target.value })}
                                    placeholder="例: 20px"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex-1">
                        {message && (
                            <div className={`text-sm flex items-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.type === 'error' && <AlertTriangle className="w-4 h-4 mr-2" />}
                                {message.text}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        保存する
                    </button>
                </div>
            </div>

            {/* Background Decoration Settings */}
            <BackgroundDecorationSettings />

            {/* Home Illustration Settings */}
            <HomeIllustrationSettings />

            {/* Home Left Illustration Settings */}
            <HomeLeftIllustrationSettings />

            {/* Help Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold mb-1">データベース設定について</p>
                        <p>この機能を使用するには、以下のSQLを実行して `site_settings` テーブルを作成する必要があります：</p>
                        <pre className="bg-yellow-100 p-2 rounded mt-2 text-xs font-mono overflow-x-auto text-yellow-900 border border-yellow-300 select-all">
                            {`create table if not exists site_settings (
  key text primary key,
  value jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS設定 (エラーが出る場合は無視するか、下記のように drop してから作成してください)
alter table site_settings enable row level security;

drop policy if exists "Public read access" on site_settings;
create policy "Public read access" on site_settings for select using (true);

drop policy if exists "Admin all access" on site_settings;
create policy "Admin all access" on site_settings for all using (true); 
`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BackgroundDecorationSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<LogoSettings>({
        imageUrl: '',
        height: '400px',
        positionTop: '80px',
        positionLeft: '', // Intentionally empty to default to right side if not set, but we probably want "right" support.
        // Wait, the interface uses "positionLeft". If we want to support "positionRight", we should update the interface or just use left.
        // Let's stick to Top/Left as per the common standard, or add Right.
        // The previous request asked for "position and height".
        opacity: 10
    });
    // Extended settings for background which might use Right instead of Left
    const [positionType, setPositionType] = useState<'left' | 'right'>('right');
    const [positionValue, setPositionValue] = useState('-50px');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSiteSettings('background_decor_settings');
            if (data) {
                setSettings({
                    imageUrl: data.imageUrl || '',
                    height: data.height || '400px',
                    positionTop: data.positionTop || '80px',
                    positionLeft: data.positionRight ? '' : (data.positionLeft || ''), // if right is set, left is empty
                    opacity: data.opacity ?? 10
                });
                if (data.positionRight) {
                    setPositionType('right');
                    setPositionValue(data.positionRight);
                } else {
                    setPositionType('left');
                    setPositionValue(data.positionLeft || '-50px');
                }
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const dataToSave = {
                ...settings,
                positionLeft: positionType === 'left' ? positionValue : undefined,
                positionRight: positionType === 'right' ? positionValue : undefined,
            };
            await saveSiteSettings('background_decor_settings', dataToSave);
            setMessage({ type: 'success', text: '設定を保存しました' });
        } catch (error) {
            console.error('Failed to save settings', error);
            setMessage({ type: 'error', text: '保存に失敗しました' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (url: string) => {
        setSettings(prev => ({ ...prev, imageUrl: url }));
    };

    if (loading) return <div className="p-4 text-center text-gray-500">読み込み中...</div>;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">背景装飾画像設定</h2>
                <p className="text-sm text-gray-500 mt-1">全ページの背景に表示される装飾画像の配置を設定します。</p>
            </div>

            <div className="p-6 space-y-8">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">画像</label>
                    <div className="flex items-start gap-6">
                        <div className="w-48 h-48 bg-slate-700 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                            {settings.imageUrl ? (
                                <img
                                    src={settings.imageUrl}
                                    alt="Decor Preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <span className="text-gray-400 text-sm">画像なし</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <ImageUploader onUpload={handleImageUpload} label="装飾画像をアップロード" />
                            <div className="text-xs text-gray-500">
                                <p>推奨サイズ: 大きめの透過PNG</p>
                            </div>
                            {settings.imageUrl && (
                                <button
                                    onClick={() => setSettings(prev => ({ ...prev, imageUrl: '' }))}
                                    className="text-sm text-red-500 hover:underline"
                                >
                                    画像を削除
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Layout Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">高さ・サイズ (Height)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.height}
                                onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                                placeholder="例: 400px, 30rem"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">不透明度 (Opacity) %</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.opacity}
                                onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value) })}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="w-12 text-right font-mono">{settings.opacity}%</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">上からの位置 (Top)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.positionTop}
                                onChange={(e) => setSettings({ ...settings, positionTop: e.target.value })}
                                placeholder="例: 80px"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">横方向の位置</label>
                        <div className="flex gap-2">
                            <select
                                value={positionType}
                                onChange={(e) => setPositionType(e.target.value as 'left' | 'right')}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                            >
                                <option value="left">左 (Left)</option>
                                <option value="right">右 (Right)</option>
                            </select>
                            <input
                                type="text"
                                value={positionValue}
                                onChange={(e) => setPositionValue(e.target.value)}
                                placeholder="例: -50px"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex-1">
                    {message && (
                        <div className={`text-sm flex items-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {message.type === 'error' && <AlertTriangle className="w-4 h-4 mr-2" />}
                            {message.text}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    保存する
                </button>
            </div>
        </div>
    );
};

const HomeIllustrationSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<LogoSettings>({
        imageUrl: '',
        height: '150px',
        positionTop: '', // Not used for this inline element usually, but keeping structure
        positionLeft: '',
        opacity: 100
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSiteSettings('home_illustration_settings');
            if (data) {
                setSettings({
                    imageUrl: data.imageUrl || '',
                    height: data.height || '128px',
                    positionTop: data.positionTop || '',
                    positionLeft: data.positionLeft || '',
                    opacity: data.opacity ?? 80
                });
            } else {
                setSettings(prev => ({ ...prev, imageUrl: '/home-illustration.png' }));
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await saveSiteSettings('home_illustration_settings', settings);
            setMessage({ type: 'success', text: '設定を保存しました' });
        } catch (error) {
            console.error('Failed to save settings', error);
            setMessage({ type: 'error', text: '保存に失敗しました' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (url: string) => {
        setSettings(prev => ({ ...prev, imageUrl: url }));
    };

    if (loading) return <div className="p-4 text-center text-gray-500">読み込み中...</div>;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">トップページ問診票横イラスト設定</h2>
                <p className="text-sm text-gray-500 mt-1">トップページの問診票エリアに表示されるイラストを設定します。</p>
            </div>

            <div className="p-6 space-y-8">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">画像</label>
                    <div className="flex items-start gap-6">
                        <div className="w-48 h-48 bg-slate-700 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                            {settings.imageUrl ? (
                                <img
                                    src={settings.imageUrl}
                                    alt="Decor Preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <span className="text-gray-400 text-sm">画像なし</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <ImageUploader onUpload={handleImageUpload} label="イラストをアップロード" />
                            <div className="text-xs text-gray-500">
                                <p>推奨サイズ: 透過PNG</p>
                            </div>
                            {settings.imageUrl && (
                                <button
                                    onClick={() => setSettings(prev => ({ ...prev, imageUrl: '' }))}
                                    className="text-sm text-red-500 hover:underline"
                                >
                                    画像を削除
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Layout Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">高さ・サイズ (Height)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.height}
                                onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                                placeholder="例: 128px"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">不透明度 (Opacity) %</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.opacity}
                                onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value) })}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="w-12 text-right font-mono">{settings.opacity}%</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">上からの位置 (Top)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.positionTop}
                                onChange={(e) => setSettings({ ...settings, positionTop: e.target.value })}
                                placeholder="例: 100px (空欄で下寄せ)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">右からの位置 (Right)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.positionLeft} // Using positionLeft property to store "Right" value for simplicity or mapped?
                                // The interface says positionLeft. I can't easily change the interface without migration if I strictly follow types.
                                // But I can reuse positionLeft to store the "Right" value if I label it as such, 
                                // OR better, I should treat it as "Horizontal Position"
                                // Let's look at `Home.tsx`. It uses style={{ left: ... }}.
                                // If I want "Right", I should probably change how Home.tsx uses it.
                                // For now, let's keep it simple: "Left (or Right if negative?)"
                                // Actually, for the home illustration, "Right" is more natural.
                                // I will interpret `positionLeft` as "Right" in Home.tsx if I want?
                                // No, that's confusing.
                                // The previous code `LogoSettings` interface has `positionLeft`.
                                // I'll just use `positionLeft` field but label it "右(Right)" and in Home.tsx apply it to `right`.
                                // Wait, `LogoSettings` is shared? Yes.
                                // So I will use `positionLeft` state to store the value, but in Home.tsx I will apply it to `right`.
                                // To make this clear, I'll label it "Right" here.
                                onChange={(e) => setSettings({ ...settings, positionLeft: e.target.value })}
                                placeholder="例: 20px"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            <span className="text-xs text-gray-500">※Homeでは右寄せ(right)として適用されます</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex-1">
                    {message && (
                        <div className={`text-sm flex items-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {message.type === 'error' && <AlertTriangle className="w-4 h-4 mr-2" />}
                            {message.text}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    保存する
                </button>
            </div>
        </div>
    );
};

const HomeLeftIllustrationSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<LogoSettings>({
        imageUrl: '',
        height: '128px',
        positionTop: '',
        positionLeft: '',
        opacity: 80
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSiteSettings('home_left_illustration_settings');
            if (data) {
                setSettings({
                    imageUrl: data.imageUrl || '',
                    height: data.height || '128px',
                    positionTop: data.positionTop || '',
                    positionLeft: data.positionLeft || '',
                    opacity: data.opacity ?? 80
                });
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await saveSiteSettings('home_left_illustration_settings', settings);
            setMessage({ type: 'success', text: '設定を保存しました' });
        } catch (error) {
            console.error('Failed to save settings', error);
            setMessage({ type: 'error', text: '保存に失敗しました' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (url: string) => {
        setSettings(prev => ({ ...prev, imageUrl: url }));
    };

    if (loading) return <div className="p-4 text-center text-gray-500">読み込み中...</div>;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">トップページ問診票[左]イラスト設定</h2>
                <p className="text-sm text-gray-500 mt-1">トップページの問診票エリアの左側に表示されるイラストを設定します。</p>
            </div>

            <div className="p-6 space-y-8">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">画像</label>
                    <div className="flex items-start gap-6">
                        <div className="w-48 h-48 bg-slate-700 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                            {settings.imageUrl ? (
                                <img
                                    src={settings.imageUrl}
                                    alt="Decor Preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <span className="text-gray-400 text-sm">画像なし</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <ImageUploader onUpload={handleImageUpload} label="イラストをアップロード" />
                            <div className="text-xs text-gray-500">
                                <p>推奨サイズ: 透過PNG</p>
                            </div>
                            {settings.imageUrl && (
                                <button
                                    onClick={() => setSettings(prev => ({ ...prev, imageUrl: '' }))}
                                    className="text-sm text-red-500 hover:underline"
                                >
                                    画像を削除
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Layout Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">高さ・サイズ (Height)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.height}
                                onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                                placeholder="例: 128px"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">不透明度 (Opacity) %</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.opacity}
                                onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value) })}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="w-12 text-right font-mono">{settings.opacity}%</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">上からの位置 (Top)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.positionTop}
                                onChange={(e) => setSettings({ ...settings, positionTop: e.target.value })}
                                placeholder="例: 100px (空欄で下寄せ)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">左からの位置 (Left)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.positionLeft}
                                onChange={(e) => setSettings({ ...settings, positionLeft: e.target.value })}
                                placeholder="例: 20px"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex-1">
                    {message && (
                        <div className={`text-sm flex items-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {message.type === 'error' && <AlertTriangle className="w-4 h-4 mr-2" />}
                            {message.text}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    保存する
                </button>
            </div>
        </div>
    );
};

export default SiteSettings;
