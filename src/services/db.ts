import { supabase } from '../lib/supabase';
import type { Clinic, Booking, AuditLog, AttendanceRecord, Shift } from '../types';

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

export const deleteClinic = async (clinicId: string) => {
    try {
        const { error, count } = await supabase
            .from('clinics')
            .delete({ count: 'exact' }) // Request exact count
            .eq('id', clinicId);

        if (error) throw error;
        if (count === 0) throw new Error("削除対象が見つからないか、削除権限がありません。");
    } catch (error) {
        console.error("Error deleting clinic:", error);
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

// --- Availability & Integrity Helpers ---

/**
 * Checks if a specific staff member is available for a given time slot.
 * Returns true if available, throws error or returns false if not.
 */
export const checkStaffAvailability = async (clinicId: string, staffId: string, startTime: Date, endTime: Date): Promise<boolean> => {
    const startIso = startTime.toISOString();
    const endIso = endTime.toISOString();

    // Fix: Use local YYYY-MM-DD for checking shifts, as shifts are stored without timezone info
    // but implies local calendar date. isISOString() converts to UTC which might be Previous Day.
    const year = startTime.getFullYear();
    const month = String(startTime.getMonth() + 1).padStart(2, '0');
    const day = String(startTime.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // 1. Check Shift
    const { data: shift, error: shiftError } = await supabase
        .from('shifts')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('staff_id', staffId)
        .eq('date', dateStr)
        .single();

    if (shiftError && shiftError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error("Error checking shift:", shiftError);
        throw new Error("シフト情報の確認に失敗しました");
    }

    if (!shift) {
        // No shift defined for this day -> Assuming "Not Working" if strict, or maybe "Default Schedule"?
        // For robustness, if no shift explicitly created, we should ideally check default schedule or assume unavailable.
        // Based on ShiftManagement.tsx, shifts are generated/saved. If missing, treat as unavailable.
        return false;
    }

    if (shift.is_holiday) {
        return false;
    }

    // Check if within working hours
    // Shift times are usually "HH:mm:ss" string in DB
    const shiftStart = new Date(`${dateStr}T${shift.start_time}`);
    const shiftEnd = new Date(`${dateStr}T${shift.end_time}`);

    // Adjust for timezone if needed, but assuming local time string in DB matches formatted date
    // Simple string comparison for HH:mm might be safer if we strictly format

    // String comparison: "09:00" <= "10:00"
    // Only works if format is identical. 
    // Let's use the Date objects created above for safer comparison if dates match
    if (startTime < shiftStart || endTime > shiftEnd) {
        return false;
    }

    // 2. Check Existing Bookings (Overlap)
    const { data: conflicts, error: conflictError } = await supabase
        .from('bookings')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('staff_id', staffId)
        .neq('status', 'cancelled') // Ignore cancelled
        .lt('start_time', endIso)   // Existing start < New end
        .gt('end_time', startIso);  // Existing end > New start

    if (conflictError) {
        console.error("Error checking overlaps:", conflictError);
        throw new Error("予約状況の確認に失敗しました");
    }

    if (conflicts && conflicts.length > 0) {
        return false; // Overlap found
    }

    return true;
};

/**
 * Finds all available staff for a given time slot.
 */
export const findAvailableStaff = async (clinicId: string, startTime: Date, endTime: Date): Promise<string[]> => {
    // 1. Get all staff for the clinic
    const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('staff_ids')
        .eq('id', clinicId)
        .single();

    if (clinicError || !clinic) throw new Error("クリニック情報の取得に失敗しました");

    const allStaffIds: string[] = clinic.staff_ids || [];
    if (allStaffIds.length === 0) return [];

    const availableStaff: string[] = [];

    // Check availability for each staff
    // Optimization: Could be done with complex SQL, but loop is safer for complex logic for now
    for (const staffId of allStaffIds) {
        try {
            const isAvailable = await checkStaffAvailability(clinicId, staffId, startTime, endTime);
            if (isAvailable) {
                availableStaff.push(staffId);
            }
        } catch (e) {
            // Ignore error, just treat as unavailable or log
            console.warn(`Skipping staff ${staffId} due to check error`, e);
        }
    }

    return availableStaff;
};

export const createBooking = async (booking: Omit<Booking, 'id'>) => {
    try {
        let finalStaffId = booking.staffId;

        // --- Integrity Check ---
        if (finalStaffId) {
            // Case A: Nomination (Staff ID provided)
            const isAvailable = await checkStaffAvailability(booking.clinicId, finalStaffId, booking.startTime, booking.endTime);
            if (!isAvailable) {
                throw new Error("指定されたスタッフはその時間帯に予約できません（空きがないか、勤務時間外です）。");
            }
        } else {
            // Case B: Free (No Staff ID) -> Auto Assignment
            const availableStaffIds = await findAvailableStaff(booking.clinicId, booking.startTime, booking.endTime);

            if (availableStaffIds.length === 0) {
                throw new Error("申し訳ありません、その時間帯はすべてのスタッフが埋まっています。");
            }

            // Simple assignment strategy: Pick the first available
            // Future improvement: Load balancing (pick one with fewest bookings)
            finalStaffId = availableStaffIds[0];
        }
        // -----------------------

        const dbData = {
            clinic_id: booking.clinicId,
            user_id: booking.userId || null,
            staff_id: finalStaffId, // Use the verified/assigned ID
            booked_by: booking.bookedBy,
            status: booking.status || 'confirmed',
            start_time: booking.startTime.toISOString(),
            end_time: booking.endTime.toISOString(),
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

// --- Site Settings ---

export interface SiteSettings {
    key: string;
    value: any;
}

export const getSiteSettings = async (key: string) => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            // If table doesn't exist, we might get other errors, but we can't fix it from here.
            // Silently return null for now to avoid crashing if table missing.
            console.warn("Could not fetch site settings (table might be missing):", error.message);
            return null;
        }
        return data.value;
    } catch (error) {
        console.error("Error fetching site settings:", error);
        return null; // Return null on error to handle gracefully
    }
};

export const saveSiteSettings = async (key: string, value: any) => {
    try {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key, value });

        if (error) throw error;
    } catch (error) {
        console.error("Error saving site settings:", error);
        throw error;
    }
};

// --- Shift Requests ---

export interface ShiftRequest {
    id: string;
    clinicId: string;
    staffId: string;
    date: string;
    startTime: string;
    endTime: string;
    isHoliday: boolean;
    status: 'pending' | 'approved' | 'rejected';
}

export const createShiftRequest = async (request: Omit<ShiftRequest, 'id' | 'status'>) => {
    const dbData = {
        clinic_id: request.clinicId,
        staff_id: request.staffId,
        date: request.date,
        start_time: request.startTime,
        end_time: request.endTime,
        is_holiday: request.isHoliday,
        status: 'pending'
    };

    const { error } = await supabase.from('shift_requests').insert(dbData);
    if (error) throw error;
};

export const getShiftRequests = async (clinicId: string): Promise<ShiftRequest[]> => {
    const { data, error } = await supabase
        .from('shift_requests')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'pending')
        .order('date', { ascending: true });

    if (error) throw error;

    return data.map((r: any) => ({
        id: r.id,
        clinicId: r.clinic_id,
        staffId: r.staff_id,
        date: r.date,
        startTime: r.start_time,
        endTime: r.end_time,
        isHoliday: r.is_holiday,
        status: r.status
    }));
};

export const approveShiftRequest = async (request: ShiftRequest) => {
    // 1. Check if shift exists
    const { data: existingShift } = await supabase
        .from('shifts')
        .select('id')
        .eq('clinic_id', request.clinicId)
        .eq('staff_id', request.staffId)
        .eq('date', request.date)
        .single();

    const shiftData = {
        clinic_id: request.clinicId,
        staff_id: request.staffId,
        date: request.date,
        start_time: request.startTime,
        end_time: request.endTime,
        is_holiday: request.isHoliday
    };

    if (existingShift) {
        // Update
        const { error: updateError } = await supabase
            .from('shifts')
            .update(shiftData)
            .eq('id', existingShift.id);

        if (updateError) throw updateError;
    } else {
        // Insert
        const { error: insertError } = await supabase
            .from('shifts')
            .insert(shiftData);

        if (insertError) throw insertError;
    }

    // 2. Update Request Status
    const { error: reqError } = await supabase
        .from('shift_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

    if (reqError) throw reqError;
};

export const rejectShiftRequest = async (requestId: string) => {
    const { error } = await supabase
        .from('shift_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

    if (error) throw error;
};

export const deleteMonthlyShifts = async (clinicId: string, startDate: string, endDate: string) => {
    // Delete requests in range
    await supabase.from('shift_requests')
        .delete()
        .eq('clinic_id', clinicId)
        .gte('date', startDate)
        .lte('date', endDate);

    // Delete shifts in range
    await supabase.from('shifts')
        .delete()
        .eq('clinic_id', clinicId)
        .gte('date', startDate)
        .lte('date', endDate);
};

export const getShifts = async (clinicId: string, startDate: string, endDate: string): Promise<Shift[]> => {
    const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) throw error;

    return data.map((s: any) => ({
        id: s.id,
        clinicId: s.clinic_id,
        staffId: s.staff_id,
        date: s.date,
        startTime: s.start_time?.slice(0, 5),
        endTime: s.end_time?.slice(0, 5),
        isHoliday: s.is_holiday
    }));
};

// --- Attendance Management ---

export const getTodayAttendance = async (clinicId: string, staffId: string, date: string): Promise<AttendanceRecord | null> => {
    const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('staff_id', staffId)
        .eq('date', date)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    return {
        id: data.id,
        clinicId: data.clinic_id,
        staffId: data.staff_id,
        date: data.date,
        clockIn: data.clock_in?.slice(0, 5) || '',
        clockOut: data.clock_out?.slice(0, 5) || '',
        breakTime: data.break_time,
        status: data.status
    };
};

export const clockIn = async (clinicId: string, staffId: string) => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const { error } = await supabase
        .from('attendance_records')
        .insert({
            clinic_id: clinicId,
            staff_id: staffId,
            date: date,
            clock_in: time,
            status: 'working',
            break_time: 0
        });

    if (error) throw error;
};

export const clockOut = async (recordId: string, breakTime: number = 60) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const { error } = await supabase
        .from('attendance_records')
        .update({
            clock_out: time,
            break_time: breakTime,
            status: 'completed'
        })
        .eq('id', recordId);

    if (error) throw error;
};

export const getAttendanceRecords = async (clinicId: string, date: Date): Promise<AttendanceRecord[]> => {
    // Basic implementation: fetch by month or specific day?
    // Admin page usually shows "Month" but filtered by day, or list for a month.
    // Let's assume the UI passes a Date and we fetch that whole Month's records?
    // User requested "Staff TimeCard" (today) & Admin Page (List).
    // Admin page currently has a "Current Date" button, implies Day or Month view.
    // Let's implement generic fetch by Range for flexibility.

    // For now, let's just fetch the whole MONTH of the given date
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

    if (error) throw error;

    return data.map((r: any) => ({
        id: r.id,
        clinicId: r.clinic_id,
        staffId: r.staff_id,
        date: r.date,
        clockIn: r.clock_in?.slice(0, 5) || '',
        clockOut: r.clock_out?.slice(0, 5) || '',
        breakTime: r.break_time,
        status: r.status
    }));
};

export const updateAttendanceRecord = async (id: string, updates: Partial<AttendanceRecord>) => {
    // Convert to snake_case for DB
    const dbData: any = {};
    if (updates.clockIn !== undefined) dbData.clock_in = updates.clockIn; // allows empty string to clear?
    if (updates.clockOut !== undefined) dbData.clock_out = updates.clockOut;
    if (updates.breakTime !== undefined) dbData.break_time = updates.breakTime;

    // Auto status update?
    // If clockOut is set and not empty, status -> completed. If empty, working?
    // Handled by UI mostly, but good to be safe.
    if (updates.clockOut) dbData.status = 'completed';
    else if (updates.clockIn && !updates.clockOut) dbData.status = 'working';

    const { error } = await supabase
        .from('attendance_records')
        .update(dbData)
        .eq('id', id);

    if (error) throw error;
};
