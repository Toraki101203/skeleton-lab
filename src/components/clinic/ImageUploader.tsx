import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface Props {
    onUpload: (file: File) => void;
}

const ImageUploader: React.FC<Props> = ({ onUpload }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('No context');

                // Max width 1200px
                const MAX_WIDTH = 1200;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject('Compression failed');
                    }
                }, 'image/jpeg', 0.8); // Quality 80%
            };
            img.onerror = (err) => reject(err);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProcessing(true);
        try {
            const compressed = await compressImage(file);
            setPreview(URL.createObjectURL(compressed));
            onUpload(compressed);
        } catch (err) {
            console.error('Compression error:', err);
            alert('Failed to process image');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
            {preview ? (
                <div className="relative inline-block">
                    <img src={preview} alt="Preview" className="max-h-48 rounded shadow" />
                    <button
                        onClick={() => setPreview(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <label className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 font-medium">
                        {processing ? 'Processing...' : 'Click to upload clinic photo'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">Max 1200px, Auto-compressed</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            )}
        </div>
    );
};

export default ImageUploader;
