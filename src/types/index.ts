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
    menuItems?: {
        name: string;
        price: number;
        description?: string;
        duration?: number;
    }[];
    staffInfo?: {
        name: string;
        imageUrl: string;
        role?: string;
    }[];
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
    userId: string;
    staffId: string;
    bookedBy?: 'user' | 'operator';
    status: 'pending' | 'confirmed' | 'cancelled';
    startTime: Date;
    endTime: Date;
    notes?: string;
}
