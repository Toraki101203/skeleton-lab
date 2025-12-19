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
    hasFrame?: boolean;
    framePaddingRight?: string;
    framePaddingLeft?: string;
    framePaddingTop?: string;
    framePaddingBottom?: string;
    frameBorderWidth?: string;
    frameBorderRadiusRight?: string;
    frameBorderRadiusLeft?: string;
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
        opacity: 100,
        hasFrame: true,
        framePaddingRight: '2.5rem',
        framePaddingLeft: '1.5rem',
        framePaddingTop: '0.5rem',
        framePaddingBottom: '0.5rem',
        frameBorderWidth: '4px',
        frameBorderRadiusRight: '9999px',
        frameBorderRadiusLeft: '8px'
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
                    opacity: data.opacity ?? 100,
                    hasFrame: data.hasFrame ?? true,
                    framePaddingRight: data.framePaddingRight || '2.5rem',
                    framePaddingLeft: data.framePaddingLeft || '1.5rem',
                    framePaddingTop: data.framePaddingTop || '0.5rem',
                    framePaddingBottom: data.framePaddingBottom || '0.5rem',
                    frameBorderWidth: data.frameBorderWidth || '4px',
                    frameBorderRadiusRight: data.frameBorderRadiusRight || '9999px',
                    frameBorderRadiusLeft: data.frameBorderRadiusLeft || '8px'
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
                            <div className="w-full min-h-[300px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-auto relative p-8">
                                {settings.imageUrl ? (
                                    <div className="relative border border-gray-200 bg-[url('/grid-pattern.png')] bg-repeat">
                                        {/* Helper text for preview context */}
                                        <div className="absolute -top-6 left-0 text-xs text-gray-400 whitespace-nowrap">プレビュー (実際の高さ: {settings.height})</div>
                                        <img
                                            src={settings.imageUrl}
                                            alt="Logo Preview"
                                            className="object-contain transition-all duration-300"
                                            style={{
                                                height: settings.height, // Use the actual configured height
                                                opacity: settings.opacity / 100,
                                                paddingTop: settings.hasFrame ? settings.framePaddingTop : '0',
                                                paddingBottom: settings.hasFrame ? settings.framePaddingBottom : '0',
                                                paddingLeft: settings.hasFrame ? settings.framePaddingLeft : '0',
                                                paddingRight: settings.hasFrame ? settings.framePaddingRight : '0',
                                                borderWidth: settings.hasFrame ? settings.frameBorderWidth : '0',
                                                borderColor: settings.hasFrame ? 'var(--color-primary, #0ea5e9)' : 'transparent', // Simplified for preview
                                                borderStyle: 'solid',
                                                borderTopRightRadius: settings.hasFrame ? settings.frameBorderRadiusRight : '0',
                                                borderBottomRightRadius: settings.hasFrame ? settings.frameBorderRadiusRight : '0',
                                                borderTopLeftRadius: settings.hasFrame ? settings.frameBorderRadiusLeft : '0',
                                                borderBottomLeftRadius: settings.hasFrame ? settings.frameBorderRadiusLeft : '0',
                                                backgroundColor: settings.hasFrame ? 'white' : 'transparent',
                                                boxShadow: settings.hasFrame ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
                                            }}
                                        />
                                    </div>
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
                            <div className="space-y-3">
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
                                {/* Height Slider helper */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min="20"
                                        max="600"
                                        step="10"
                                        value={parseInt(settings.height) || 100}
                                        onChange={(e) => setSettings({ ...settings, height: `${e.target.value}px` })}
                                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-500 w-12 text-right">{parseInt(settings.height) || 100}px</span>
                                </div>
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

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex-1 mb-6">
                        {message && (
                            <div className={`text-sm flex items-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.type === 'error' && <AlertTriangle className="w-4 h-4 mr-2" />}
                                {message.text}
                            </div>
                        )}
                    </div>

                    {/* Frame Settings */}
                    <div className="pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                            <input
                                type="checkbox"
                                id="hasFrame"
                                checked={settings.hasFrame}
                                onChange={(e) => setSettings({ ...settings, hasFrame: e.target.checked })}
                                className="w-5 h-5 rounded text-primary focus:ring-primary"
                            />
                            <label htmlFor="hasFrame" className="text-sm font-bold text-gray-800 cursor-pointer">
                                ロゴの「枠（カプセル形状）」を表示する
                            </label>
                        </div>

                        {settings.hasFrame && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">枠線の太さ (例: 4px)</label>
                                    <input
                                        type="text"
                                        value={settings.frameBorderWidth}
                                        onChange={(e) => setSettings({ ...settings, frameBorderWidth: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="4px"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">角丸 - 右 (例: 9999px, 40px)</label>
                                    <input
                                        type="text"
                                        value={settings.frameBorderRadiusRight}
                                        onChange={(e) => setSettings({ ...settings, frameBorderRadiusRight: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="9999px"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">角丸 - 左 (例: 8px, 0px)</label>
                                    <input
                                        type="text"
                                        value={settings.frameBorderRadiusLeft}
                                        onChange={(e) => setSettings({ ...settings, frameBorderRadiusLeft: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="8px"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">余白 - 上</label>
                                        <input
                                            type="text"
                                            value={settings.framePaddingTop}
                                            onChange={(e) => setSettings({ ...settings, framePaddingTop: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">余白 - 下</label>
                                        <input
                                            type="text"
                                            value={settings.framePaddingBottom}
                                            onChange={(e) => setSettings({ ...settings, framePaddingBottom: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">余白 - 左</label>
                                        <input
                                            type="text"
                                            value={settings.framePaddingLeft}
                                            onChange={(e) => setSettings({ ...settings, framePaddingLeft: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">余白 - 右</label>
                                        <input
                                            type="text"
                                            value={settings.framePaddingRight}
                                            onChange={(e) => setSettings({ ...settings, framePaddingRight: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
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
            </div>

            {/* Background Decoration Settings */}
            <BackgroundDecorationSettings />

            {/* Concept Platform Image Settings - NEW */}
            <ConceptPlatformImageSettings />
            <ConceptWorrySettings id="concept_worry_1" title="悩み1アイコン（左）" />
            <ConceptWorrySettings id="concept_worry_2" title="悩み2アイコン（中央）" />
            <ConceptWorrySettings id="concept_worry_3" title="悩み3アイコン（右）" />

            {/* Concept Solution Section Icon Settings */}
            <ConceptSolutionIconSettings />

            {/* Concept Solution Section Background Decoration Settings */}
            <ConceptSolutionDecorSettings />

            {/* Monitor Diagnosis Image Settings */}
            <ConceptMonitorImageSettings />

            {/* Features Page Decor Settings */}
            <FeaturesLeftDecorSettings />
            <FeaturesRightDecorSettings />
            <FeaturesMainImageSettings />

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

const ConceptPlatformImageSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<LogoSettings>({
        imageUrl: '',
        height: '200px',
        positionTop: '',
        positionLeft: '',
        opacity: 100
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSiteSettings('concept_platform_image_settings');
            if (data) {
                setSettings({
                    imageUrl: data.imageUrl || '',
                    height: data.height || '200px',
                    positionTop: data.positionTop || '',
                    positionLeft: data.positionLeft || '',
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
            await saveSiteSettings('concept_platform_image_settings', settings);
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
                <h2 className="text-lg font-bold text-gray-800">コンセプトページ プラットフォーム図画像設定</h2>
                <p className="text-sm text-gray-500 mt-1">コンセプトページの「新しい形の検索・予約プラットフォーム」セクションに表示する画像を設定します。</p>
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
                                    alt="Preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <span className="text-gray-400 text-sm">画像なし</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <ImageUploader onUpload={handleImageUpload} label="イラストをアップロード" />
                            <div className="text-xs text-gray-500">
                                <p>推奨サイズ: 横長または正方形の透過PNG</p>
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
                                placeholder="例: 200px"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">高さ位置調整 (Margin Top)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.positionTop}
                                onChange={(e) => setSettings({ ...settings, positionTop: e.target.value })}
                                placeholder="例: 20px, -10px"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        {/* Not strictly needed if centered, but good for fine tuning */}
                        <label className="block text-sm font-medium text-gray-700 mb-2">幅制限 (Max Width)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.positionLeft} // Reusing positionLeft for MaxWidth for simplicity in schema
                                onChange={(e) => setSettings({ ...settings, positionLeft: e.target.value })}
                                placeholder="例: 500px, 100%"
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
                                value={settings.positionLeft} // Using positionLeft property to store "Right" value for simplicity
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

const ConceptWorrySettings = ({ id, title }: { id: string, title: string }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<LogoSettings>({
        imageUrl: '',
        height: '64px',
        positionTop: '',
        positionLeft: '',
        opacity: 100
    });

    useEffect(() => {
        loadSettings();
    }, [id]);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSiteSettings(id);
            if (data) {
                setSettings({
                    imageUrl: data.imageUrl || '',
                    height: data.height || '64px',
                    positionTop: data.positionTop || '',
                    positionLeft: data.positionLeft || '',
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
            await saveSiteSettings(id, settings);
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
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-500 mt-1">「こんなお悩みありませんか？」セクションのアイコン画像を設定します。</p>
            </div>

            <div className="p-6 space-y-8">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">画像</label>
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 bg-yellow-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                            {settings.imageUrl ? (
                                <img
                                    src={settings.imageUrl}
                                    alt="Icon Preview"
                                    className="max-w-full max-h-full object-contain"
                                    style={{ opacity: settings.opacity / 100 }}
                                />
                            ) : (
                                <span className="text-gray-400 text-xs">画像なし</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <ImageUploader onUpload={handleImageUpload} label="アイコンをアップロード" />
                            <div className="text-xs text-gray-500">
                                <p>推奨サイズ: 正方形・透過PNG</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">サイズ (Height/Width)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.height}
                                onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                                placeholder="例: 64px"
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

const ConceptSolutionIconSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<LogoSettings>({
        imageUrl: '',
        height: '64px',
        positionTop: '',
        positionLeft: '',
        opacity: 100
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSiteSettings('concept_solution_icon_settings');
            if (data) {
                setSettings({
                    imageUrl: data.imageUrl || '',
                    height: data.height || '64px',
                    positionTop: data.positionTop || '',
                    positionLeft: data.positionLeft || '',
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
            await saveSiteSettings('concept_solution_icon_settings', settings);
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
                <h2 className="text-lg font-bold text-gray-800">解決セクションアイコン設定（スケルトン Lab. ならの左横）</h2>
                <p className="text-sm text-gray-500 mt-1">「スケルトン Lab. なら」タイトルの横に表示するアイコン画像を設定します。</p>
            </div>

            <div className="p-6 space-y-8">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">画像</label>
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 bg-primary/20 border-2 border-dashed border-primary/30 rounded-full flex items-center justify-center overflow-hidden relative">
                            {settings.imageUrl ? (
                                <img
                                    src={settings.imageUrl}
                                    alt="Icon Preview"
                                    className="max-w-full max-h-full object-contain"
                                    style={{ opacity: settings.opacity / 100 }}
                                />
                            ) : (
                                <span className="text-primary/40 text-xs">画像なし</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <ImageUploader onUpload={handleImageUpload} label="アイコンをアップロード" />
                            <div className="text-xs text-gray-500">
                                <p>推奨サイズ: 正方形・透過PNG</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">サイズ (Height/Width)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.height}
                                onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                                placeholder="例: 64px"
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

const ConceptSolutionDecorSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<LogoSettings>({
        imageUrl: '',
        height: '192px',
        positionTop: '50%',
        positionLeft: '-20px', // using positionLeft as "Right" in this context or actually right.
        opacity: 20
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSiteSettings('concept_solution_decor_settings');
            if (data) {
                setSettings({
                    imageUrl: data.imageUrl || '',
                    height: data.height || '192px',
                    positionTop: data.positionTop || '50%',
                    positionLeft: data.positionLeft || '-20px',
                    opacity: data.opacity ?? 20
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
            await saveSiteSettings('concept_solution_decor_settings', settings);
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
                <h2 className="text-lg font-bold text-gray-800">解決セクション背景装飾設定（右端の薄いアイコン）</h2>
                <p className="text-sm text-gray-500 mt-1">「スケルトン Lab. なら」カードの右端に表示される背景装飾画像を設定します。</p>
            </div>

            <div className="p-6 space-y-8">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">画像</label>
                    <div className="flex items-start gap-6">
                        <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                            {settings.imageUrl ? (
                                <img
                                    src={settings.imageUrl}
                                    alt="Decor Preview"
                                    className="max-w-full max-h-full object-contain"
                                    style={{ opacity: settings.opacity / 100 }}
                                />
                            ) : (
                                <span className="text-gray-400 text-xs">画像なし</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <ImageUploader onUpload={handleImageUpload} label="装飾をアップロード" />
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">サイズ (Height/Width)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.height}
                                onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                                placeholder="例: 192px"
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
                                placeholder="例: 50% (中央)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">右からの位置 (Right)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.positionLeft} // Using positionLeft as "Right"
                                onChange={(e) => setSettings({ ...settings, positionLeft: e.target.value })}
                                placeholder="例: -20px"
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

const ConceptMonitorImageSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<LogoSettings>({
        imageUrl: '',
        height: '100%',
        positionTop: 'center', // using as object-position-y or similar if needed, or just unused
        positionLeft: 'center', // using as object-position-x
        opacity: 80
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSiteSettings('concept_monitor_image_settings');
            if (data) {
                setSettings({
                    imageUrl: data.imageUrl || '',
                    height: data.height || '100%',
                    positionTop: data.positionTop || 'center',
                    positionLeft: data.positionLeft || 'center',
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
            await saveSiteSettings('concept_monitor_image_settings', settings);
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
                <h2 className="text-lg font-bold text-gray-800">モニター診断画像設定</h2>
                <p className="text-sm text-gray-500 mt-1">「モニター診断（予約制）」セクションの背景画像を設定します。</p>
            </div>

            <div className="p-6 space-y-8">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">画像</label>
                    <div className="flex items-start gap-6">
                        <div className="w-64 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                            {settings.imageUrl ? (
                                <img
                                    src={settings.imageUrl}
                                    alt="Monitor Preview"
                                    className="w-full h-full object-cover"
                                    style={{ opacity: settings.opacity / 100 }}
                                />
                            ) : (
                                <span className="text-gray-400 text-xs">画像なし</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <ImageUploader onUpload={handleImageUpload} label="画像をアップロード" />
                            <div className="text-xs text-gray-500">
                                <p>推奨サイズ: 横長の写真（JPEG/PNG）</p>
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

const FeaturesLeftDecorSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<LogoSettings>({
        imageUrl: '',
        height: '300px',
        positionTop: '50%',
        positionLeft: '0px',
        opacity: 100
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSiteSettings('features_left_decor_settings');
            if (data) {
                setSettings({
                    imageUrl: data.imageUrl || '',
                    height: data.height || '300px',
                    positionTop: data.positionTop || '50%',
                    positionLeft: data.positionLeft || '0px',
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
            await saveSiteSettings('features_left_decor_settings', settings);
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">特徴ページ 左側装飾画像設定</h2>
            </div>
            <div className="p-6 space-y-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">画像</label>
                    <div className="flex items-start gap-6">
                        <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                            {settings.imageUrl ? (
                                <img src={settings.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-gray-400 text-xs">画像なし</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <ImageUploader onUpload={handleImageUpload} label="画像をアップロード" />
                            {settings.imageUrl && (
                                <button onClick={() => setSettings(prev => ({ ...prev, imageUrl: '' }))} className="text-sm text-red-500 hover:underline">画像を削除</button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">高さ (例: 300px, 50%)</label>
                        <input type="text" value={settings.height} onChange={(e) => setSettings({ ...settings, height: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="300px" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">上からの位置 (Top)</label>
                        <input type="text" value={settings.positionTop} onChange={(e) => setSettings({ ...settings, positionTop: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="50%" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">左からの位置 (Left)</label>
                        <input type="text" value={settings.positionLeft} onChange={(e) => setSettings({ ...settings, positionLeft: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="0px" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">不透明度 {settings.opacity}%</label>
                        <input type="range" min="0" max="100" value={settings.opacity} onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存する
                </button>
            </div>
        </div>
    );
};

const FeaturesRightDecorSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<LogoSettings>({
        imageUrl: '',
        height: '300px',
        positionTop: '50%',
        positionLeft: '0px', // using as RIGHT position
        opacity: 100
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSiteSettings('features_right_decor_settings');
            if (data) {
                setSettings({
                    imageUrl: data.imageUrl || '',
                    height: data.height || '300px',
                    positionTop: data.positionTop || '50%',
                    positionLeft: data.positionLeft || '0px', // Right
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
            await saveSiteSettings('features_right_decor_settings', settings);
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">特徴ページ 右側装飾画像設定</h2>
            </div>
            <div className="p-6 space-y-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">画像</label>
                    <div className="flex items-start gap-6">
                        <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                            {settings.imageUrl ? (
                                <img src={settings.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-gray-400 text-xs">画像なし</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <ImageUploader onUpload={handleImageUpload} label="画像をアップロード" />
                            {settings.imageUrl && (
                                <button onClick={() => setSettings(prev => ({ ...prev, imageUrl: '' }))} className="text-sm text-red-500 hover:underline">画像を削除</button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">高さ (例: 300px, 50%)</label>
                        <input type="text" value={settings.height} onChange={(e) => setSettings({ ...settings, height: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="300px" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">上からの位置 (Top)</label>
                        <input type="text" value={settings.positionTop} onChange={(e) => setSettings({ ...settings, positionTop: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="50%" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">右からの位置 (Right)</label>
                        <input type="text" value={settings.positionLeft} onChange={(e) => setSettings({ ...settings, positionLeft: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="0px" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">不透明度 {settings.opacity}%</label>
                        <input type="range" min="0" max="100" value={settings.opacity} onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存する
                </button>
            </div>
        </div>
    );
};


const FeaturesMainImageSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<LogoSettings>({
        imageUrl: '',
        height: 'auto',
        positionTop: '0px',
        positionLeft: '1000px', // using as maxWidth
        opacity: 100
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSiteSettings('features_main_image_settings');
            if (data) {
                setSettings({
                    imageUrl: data.imageUrl || '',
                    height: data.height || 'auto',
                    positionTop: data.positionTop || '0px',
                    positionLeft: data.positionLeft || '1000px',
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
            await saveSiteSettings('features_main_image_settings', settings);
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

    const removeBackgroundColor = (file: File): Promise<File | Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context not available'));

                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                // Target Color: #869abe (R:134, G:154, B:190)
                const targetR = 134;
                const targetG = 154;
                const targetB = 190;
                const tolerance = 10; // Adjust tolerance

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    if (
                        Math.abs(r - targetR) < tolerance &&
                        Math.abs(g - targetG) < tolerance &&
                        Math.abs(b - targetB) < tolerance
                    ) {
                        data[i + 3] = 0; // Alpha to 0
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob failed'));
                }, 'image/png');
            };
            img.onerror = (e) => reject(e);
            img.src = URL.createObjectURL(file);
        });
    };

    if (loading) return <div className="p-4 text-center text-gray-500">読み込み中...</div>;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">特徴ページ メイン画像設定</h2>
                <p className="text-sm text-gray-500 mt-1">特徴ページの導入文の下に表示する画像を設定します。</p>
            </div>

            <div className="p-6 space-y-8">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">画像</label>
                    <div className="flex items-start gap-6">
                        <div className="w-full min-h-[200px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-auto relative p-4">
                            {settings.imageUrl ? (
                                <img
                                    src={settings.imageUrl}
                                    alt="Preview"
                                    className="object-contain"
                                    style={{
                                        maxHeight: '300px',
                                        maxWidth: '100%'
                                    }}
                                />
                            ) : (
                                <span className="text-gray-400 text-sm">画像なし</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <ImageUploader
                                onUpload={handleImageUpload}
                                label="画像をアップロード"
                                transformFile={removeBackgroundColor}
                            />
                            <div className="text-xs text-gray-500">
                                <p>推奨サイズ: 横幅1000px程度の画像</p>
                                <p className="text-blue-600 mt-1">※背景色(#869abe)は自動的に透過されます。</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">最大幅 (Max Width)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.positionLeft}
                                onChange={(e) => setSettings({ ...settings, positionLeft: e.target.value })}
                                placeholder="例: 1000px, 90%"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">高さ (Height)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.height}
                                onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                                placeholder="例: auto, 300px"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">上からの余白 (Margin Top)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={settings.positionTop}
                                onChange={(e) => setSettings({ ...settings, positionTop: e.target.value })}
                                placeholder="例: 40px, 2rem"
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
