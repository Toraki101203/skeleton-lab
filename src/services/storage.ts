import { supabase } from '../lib/supabase';

export const uploadImage = async (file: File, path: string): Promise<string> => {
    try {
        const { data, error } = await supabase.storage
            .from('clinic-images')
            .upload(path, file);

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('clinic-images')
            .getPublicUrl(data.path);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

export const uploadClinicImage = async (clinicId: string, file: File): Promise<string> => {
    const timestamp = Date.now();
    // Sanitize filename to avoid issues
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `${clinicId}/${timestamp}_${sanitizedName}`;
    return uploadImage(file, path);
};
