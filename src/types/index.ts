export type UserRole = 'user' | 'clinic_admin' | 'super_admin';

export interface UserProfile {
    uid: string;
    role: UserRole;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
}

export interface BusinessHours {
    start: string; // "09:00"
    end: string;   // "20:00"
    isClosed: boolean;
}

export interface Staff {
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
    description?: string;
    skillIds: string[]; // IDs of menu items this staff can perform
    defaultSchedule: {
        mon: BusinessHours;
        tue: BusinessHours;
        wed: BusinessHours;
        thu: BusinessHours;
        fri: BusinessHours;
        sat: BusinessHours;
        sun: BusinessHours;
    };
    scheduleOverrides?: Record<string, BusinessHours>; // "YYYY-MM-DD": BusinessHours
}

export interface MenuItem {
    id: string;
    name: string;
    price: number;
    description?: string;
    duration: number; // minutes
    bufferTime?: number; // minutes
    category?: string;
    taxType?: 'tax_included' | 'tax_excluded';
}

export interface Clinic {
    id: string;
    ownerUid: string;
    name: string;
    description: string;
    images: string[];
    businessHours: {
        mon: BusinessHours;
        tue: BusinessHours;
        wed: BusinessHours;
        thu: BusinessHours;
        fri: BusinessHours;
        sat: BusinessHours;
        sun: BusinessHours;
    };
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    staffIds: string[];
    templateId?: 'standard' | 'warm' | 'modern';
    menuCategories?: string[];
    menuItems?: MenuItem[];
    staffInfo?: Staff[];
    directorInfo?: {
        name: string;
        title: string;
        message: string;
        imageUrl: string;
    };
    newsItems?: {
        date: string;
        title: string;
        content: string;
    }[];
    faqItems?: {
        question: string;
        answer: string;
    }[];
    accessDetails?: string;
    socialLinks?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
        website?: string;
    };
    status?: 'pending' | 'active' | 'suspended';
}

export interface DiagnosisLog {
    id: string;
    userId: string;
    symptoms: Record<string, any>; // Flexible for now
    createdAt: Date;
}

export interface SupportLog {
    id: string;
    userId: string;
    operatorId: string;
    content: string;
    category: 'inquiry' | 'booking' | 'complaint';
    createdAt: Date;
}

export interface Booking {
    id?: string;
    clinicId: string;
    userId?: string; // Optional for guest bookings
    staffId: string | null; // Nullable for "Free" (no nomination)
    bookedBy?: 'user' | 'operator' | 'guest' | 'proxy';
    status: 'pending' | 'confirmed' | 'cancelled' | 'no_show';
    startTime: Date;
    endTime: Date;
    notes?: string;
    guestName?: string;
    guestContact?: string;
    guestEmail?: string;
    internalMemo?: string;
    menuItemId?: string;
}

export interface Shift {
    id: string;
    clinicId?: string; // Optional for now as we might not have it in mock
    date: string; // YYYY-MM-DD
    staffId: string;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    isHoliday: boolean;
}

export interface AttendanceRecord {
    id: string;
    date: string;
    staffId: string;
    clockIn: string;
    clockOut: string;
    breakTime: number; // minutes
    status: 'working' | 'completed' | 'absent';
}

export interface Reservation {
    id: string;
    clinicId: string;
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    staffId: string;
    menuItemId?: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    notes?: string;
    createdAt: string;
}

export interface AuditLog {
    id: string;
    userId?: string;
    userEmail?: string;
    action: string;
    target?: string;
    details?: any;
    ipAddress?: string;
    createdAt: string;
}
