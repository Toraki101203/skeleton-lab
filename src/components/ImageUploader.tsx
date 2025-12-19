import { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
    onUpload: (url: string) => void;
    className?: string;
    label?: string;
    transformFile?: (file: File) => Promise<File | Blob>;
}

const ImageUploader: React.FC<Props> = ({ onUpload, className = '', label = '画像をアップロード', transformFile }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const originalFile = e.target.files[0];
        setUploading(true);

        try {
            let fileToUpload: File | Blob = originalFile;
            if (transformFile) {
                fileToUpload = await transformFile(originalFile);
            }

            // Keep extension from original file if possible, or default to png if transformed (since canvas output is usually png)
            const fileExt = originalFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('clinic-assets')
                .upload(filePath, fileToUpload);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('clinic-assets')
                .getPublicUrl(filePath);

            onUpload(data.publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('画像のアップロードに失敗しました');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className={className}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
                {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Upload className="w-4 h-4 mr-2" />
                )}
                {uploading ? 'アップロード中...' : label}
            </button>
        </div>
    );
};

export default ImageUploader;
