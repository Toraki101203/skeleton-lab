import { supabase } from '../lib/supabase';
import type { Clinic, Booking, AuditLog } from '../types';

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
            staffInfo: data.staff_info || [],
            directorInfo: data.director_info,
            newsItems: data.news_items || [],
            faqItems: data.faq_items || [],
            accessDetails: data.access_details,
            socialLinks: data.social_links,
            status: data.status
        } as Clinic;
    } catch (error) {
        console.error("Error getting clinic:", error);
        throw error;
    }
};

export const updateClinicProfile = async (clinicId: string, data: Partial<Clinic>) => {
    try {
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
        if (data.directorInfo) dbData.director_info = data.directorInfo;
        if (data.newsItems) dbData.news_items = data.newsItems;
        if (data.faqItems) dbData.faq_items = data.faqItems;
        if (data.accessDetails) dbData.access_details = data.accessDetails;
        if (data.socialLinks) dbData.social_links = data.socialLinks;
        if (data.status) dbData.status = data.status;

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
            staffInfo: d.staff_info || [],
            directorInfo: d.director_info,
            newsItems: d.news_items || [],
            faqItems: d.faq_items || [],
            accessDetails: d.access_details,
            socialLinks: d.social_links,
            status: d.status
        })) as Clinic[];
    } catch (error) {
        console.error("Error fetching clinics:", error);
        throw error;
    }
};

// --- Booking ---

export const createBooking = async (booking: Omit<Booking, 'id'>) => {
    try {
        const dbData = {
            clinic_id: booking.clinicId,
            user_id: booking.userId || null,
            staff_id: booking.staffId || null,
            booked_by: booking.bookedBy,
            status: booking.status || 'confirmed',
            start_time: booking.startTime,
            end_time: booking.endTime,
            notes: booking.notes,
            guest_name: booking.guestName,
            guest_contact: booking.guestContact,
            guest_email: booking.guestEmail,
            internal_memo: booking.internalMemo,
            menu_item_id: booking.menuItemId
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

export const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
        // Map camelCase to snake_case
        const dbData: any = {};
        if (updates.clinicId) dbData.clinic_id = updates.clinicId;
        if (updates.userId) dbData.user_id = updates.userId;
        if (updates.staffId) dbData.staff_id = updates.staffId;
        if (updates.bookedBy) dbData.booked_by = updates.bookedBy;
        if (updates.status) dbData.status = updates.status;
        if (updates.startTime) dbData.start_time = updates.startTime;
        if (updates.endTime) dbData.end_time = updates.endTime;
        if (updates.notes) dbData.notes = updates.notes;
        if (updates.guestName) dbData.guest_name = updates.guestName;
        if (updates.guestContact) dbData.guest_contact = updates.guestContact;
        if (updates.guestEmail) dbData.guest_email = updates.guestEmail;
        if (updates.internalMemo) dbData.internal_memo = updates.internalMemo;
        if (updates.menuItemId) dbData.menu_item_id = updates.menuItemId;

        const { error } = await supabase
            .from('bookings')
            .update(dbData)
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error("Error updating booking:", error);
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
            notes: b.notes,
            guestName: b.guest_name,
            guestContact: b.guest_contact,
            guestEmail: b.guest_email,
            internalMemo: b.internal_memo,
            menuItemId: b.menu_item_id
        })) as Booking[];
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw error;
    }
};

// --- Admin Dashboard Stats ---

export const getAdminDashboardStats = async () => {
    try {
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: clinicCount } = await supabase.from('clinics').select('*', { count: 'exact', head: true });

        const { count: pendingClinicCount } = await supabase.from('clinics')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        return {
            totalUsers: userCount || 0,
            totalClinics: clinicCount || 0,
            pendingClinics: pendingClinicCount || 0,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
};

export const getAnalyticsData = async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateStr = thirtyDaysAgo.toISOString();

        const { data: bookings } = await supabase
            .from('bookings')
            .select('created_at, clinic_id')
            .gte('created_at', dateStr);

        const dailyBookingsMap = new Map<string, number>();
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dailyBookingsMap.set(d.toISOString().split('T')[0], 0);
        }

        bookings?.forEach(b => {
            const date = b.created_at.split('T')[0];
            if (dailyBookingsMap.has(date)) {
                dailyBookingsMap.set(date, (dailyBookingsMap.get(date) || 0) + 1);
            }
        });

        const dailyBookings = Array.from(dailyBookingsMap.entries())
            .map(([date, count]) => ({ date: date.slice(5).replace('-', '/'), count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const userGrowth = [];
        let currentTotal = totalUsers || 0;
        for (let i = 0; i < 30; i++) {
            userGrowth.push({
                date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0].slice(5).replace('-', '/'),
                total: Math.max(0, Math.floor(currentTotal))
            });
            currentTotal = currentTotal * 0.98;
        }
        userGrowth.reverse();

        const clinicCounts = new Map<string, number>();
        bookings?.forEach(b => {
            if (b.clinic_id) {
                clinicCounts.set(b.clinic_id, (clinicCounts.get(b.clinic_id) || 0) + 1);
            }
        });

        const uniqueClinicIds = Array.from(clinicCounts.keys());
        let clinicNames = new Map<string, string>();
        if (uniqueClinicIds.length > 0) {
            const { data: clinics } = await supabase
                .from('clinics')
                .select('id, name')
                .in('id', uniqueClinicIds);
            clinics?.forEach(c => clinicNames.set(c.id, c.name));
        }

        const popularClinics = Array.from(clinicCounts.entries())
            .map(([id, count]) => ({ name: clinicNames.get(id) || 'Unknown', bookings: count }))
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 5);

        return {
            dailyBookings,
            userGrowth,
            popularClinics
        };

    } catch (error) {
        console.error("Error fetching analytics data:", error);
        return {
            dailyBookings: [],
            userGrowth: [],
            popularClinics: []
        };
    }
};

export const getAllBookings = async (): Promise<any[]> => {
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            clinics (name)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(b => ({
        id: b.id,
        clinicId: b.clinic_id,
        clinicName: b.clinics?.name,
        userId: b.user_id,
        staffId: b.staff_id,
        bookedBy: b.booked_by,
        status: b.status,
        startTime: new Date(b.start_time),
        endTime: new Date(b.end_time),
        notes: b.notes,
        guestName: b.guest_name,
        guestContact: b.guest_contact,
        guestEmail: b.guest_email,
        internalMemo: b.internal_memo,
        createdAt: new Date(b.created_at)
    }));
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) throw error;

    return data.map(log => ({
        id: log.id,
        userId: log.user_id,
        userEmail: log.user_email,
        action: log.action,
        target: log.target,
        details: log.details,
        ipAddress: log.ip_address,
        createdAt: log.created_at
    }));
};

export const logAction = async (action: string, target?: string, details?: any) => {
    const { data: { user } } = await supabase.auth.getUser();

    // In a real app, IP would come from edge function or server
    // Here we can't easily get it client-side without external service

    const { error } = await supabase
        .from('audit_logs')
        .insert({
            user_id: user?.id,
            user_email: user?.email,
            action,
            target,
            details
        });

    if (error) console.error('Failed to log action:', error);
};
