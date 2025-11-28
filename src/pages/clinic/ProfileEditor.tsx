import { useState } from 'react';
import BusinessHoursEditor from '../../components/clinic/BusinessHoursEditor';
import ImageUploader from '../../components/clinic/ImageUploader';
import type { BusinessHours } from '../../types';
import { updateClinicProfile } from '../../services/firestore';
import { uploadClinicImage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

const INITIAL_HOURS: BusinessHours = { start: '09:00', end: '20:00', isClosed: false };
const INITIAL_WEEK = {
    mon: { ...INITIAL_HOURS },
    tue: { ...INITIAL_HOURS },
    wed: { ...INITIAL_HOURS },
    thu: { ...INITIAL_HOURS },
    fri: { ...INITIAL_HOURS },
    sat: { ...INITIAL_HOURS, end: '17:00' },
    sun: { ...INITIAL_HOURS, isClosed: true },
};

const ProfileEditor = () => {
    const { user } = useAuth();
    const [name, setName] = useState('Skeleton Clinic Tokyo');
    const [description, setDescription] = useState('Best osteopathy in Tokyo.');
    const [hours, setHours] = useState(INITIAL_WEEK);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // In a real app, clinic ID might be different from user ID, but for 1-to-1 mapping:
            await updateClinicProfile(user.uid, { name, description, businessHours: hours });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Failed to update profile", error);
            alert('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        if (!user) return;
        try {
            const imageUrl = await uploadClinicImage(user.uid, file);
            console.log('Image uploaded:', imageUrl);
            // Optionally update clinic profile with new image URL
            // await updateClinicProfile(user.uid, { images: [imageUrl, ...existing] });
        } catch (error) {
            console.error('Failed to upload image', error);
            alert('Failed to upload image');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Clinic Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Clinic Photos</label>
                        <ImageUploader onUpload={handleImageUpload} />
                    </div>
                </div>

                <div>
                    <BusinessHoursEditor value={hours} onChange={setHours} />
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-3 bg-accent text-white rounded-lg shadow hover:bg-opacity-90 font-bold disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default ProfileEditor;
