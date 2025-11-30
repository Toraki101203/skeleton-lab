import { supabase } from '../lib/supabase';
import type { Clinic, Booking } from '../types';

// --- User & Diagnosis ---

export const saveDiagnosis = async (userId: string, data: any) => {
    try {
        const { data: result, error } = await supabase
            .from('diagnosis_logs')
            .insert({
                user_id: userId,
                symptoms: data
            })
            .select()
            .single();

        if (error) throw error;
        return result.id;
    } catch (error) {
        console.error("Error saving diagnosis:", error);
        throw error;
    }
};

// --- Clinic Management ---

export const getClinic = async (clinicId: string): Promise<Clinic | null> => {
    try {
        const { data, error } = await supabase
            .from('clinics')
            .select('*')
            .eq('id', clinicId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        // Map snake_case to camelCase if necessary, or ensure types match
        // Assuming Supabase returns keys matching our Clinic interface if we set up columns correctly
        // But in SQL we used snake_case for some fields (owner_uid, business_hours, staff_ids)
        // We need to map them back to camelCase for the frontend
        return {
            id: data.id,
            ownerUid: data.owner_uid,
            name: data.name,
            description: data.description,
            images: data.images,
            businessHours: data.business_hours,
            location: data.location,
            staffIds: data.staff_ids,
            templateId: data.template_id || 'standard',
            menuItems: data.menu_items || [],
            staffInfo: data.staff_info || []
        } as Clinic;
    } catch (error) {
        console.error("Error getting clinic:", error);
        throw error;
    }
};

export const updateClinicProfile = async (clinicId: string, data: Partial<Clinic>) => {
    try {
        // Map camelCase to snake_case for DB update
        const dbData: any = {};
        if (data.ownerUid) dbData.owner_uid = data.ownerUid;
        if (data.name) dbData.name = data.name;
        if (data.description) dbData.description = data.description;
        if (data.images) dbData.images = data.images;
        if (data.businessHours) dbData.business_hours = data.businessHours;
        if (data.location) dbData.location = data.location;
        if (data.staffIds) dbData.staff_ids = data.staffIds;
        if (data.templateId) dbData.template_id = data.templateId;
        if (data.menuItems) dbData.menu_items = data.menuItems;
        if (data.staffInfo) dbData.staff_info = data.staffInfo;

        const { error } = await supabase
            .from('clinics')
            .update(dbData)
            .eq('id', clinicId);

        if (error) throw error;
    } catch (error) {
        console.error("Error updating clinic:", error);
        throw error;
    }
};

export const getAllClinics = async (): Promise<Clinic[]> => {
    try {
        const { data, error } = await supabase
            .from('clinics')
            .select('*');

        if (error) throw error;

        return data.map((d: any) => ({
            id: d.id,
            ownerUid: d.owner_uid,
            name: d.name,
            description: d.description,
            images: d.images,
            businessHours: d.business_hours,
            location: d.location,
            staffIds: d.staff_ids,
            templateId: d.template_id || 'standard',
            menuItems: d.menu_items || [],
            staffInfo: d.staff_info || []
        })) as Clinic[];
    } catch (error) {
        console.error("Error fetching clinics:", error);
        throw error;
    }
};

// --- Booking ---

export const createBooking = async (booking: Omit<Booking, 'id'>) => {
    try {
        // Map camelCase to snake_case
        const dbData = {
            clinic_id: booking.clinicId,
            user_id: booking.userId,
            staff_id: booking.staffId,
            booked_by: booking.bookedBy,
            status: booking.status,
            start_time: booking.startTime,
            end_time: booking.endTime,
            notes: booking.notes
        };

        const { data, error } = await supabase
            .from('bookings')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
    }
};

export const getClinicBookings = async (clinicId: string, startDate: Date, endDate: Date) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('clinic_id', clinicId)
            .gte('start_time', startDate.toISOString())
            .lte('start_time', endDate.toISOString());

        if (error) throw error;

        return data.map((b: any) => ({
            id: b.id,
            clinicId: b.clinic_id,
            userId: b.user_id,
            staffId: b.staff_id,
            bookedBy: b.booked_by,
            status: b.status,
            startTime: new Date(b.start_time),
            endTime: new Date(b.end_time),
            notes: b.notes
        })) as Booking[];
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw error;
    }
};
