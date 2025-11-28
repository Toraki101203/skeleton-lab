import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export const uploadImage = async (file: File, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

export const uploadClinicImage = async (clinicId: string, file: File): Promise<string> => {
    const timestamp = Date.now();
    const path = `clinics/${clinicId}/${timestamp}_${file.name}`;
    return uploadImage(file, path);
};
