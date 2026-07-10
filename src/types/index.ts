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
    symptoms: Record<string, unknown>; // Flexible for now
    createdAt: Date;
}

// 問診ウィザードの入力データ（diagnosis_logs.symptoms に保存される形）
export interface DiagnosisData {
    bodyPart: string;
    symptoms: string[];
    duration: string;
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
    userId?: string | null; // Optional for guest bookings（DB では null）
    staffId: string | null; // Nullable for "Free" (no nomination)
    bookedBy?: 'user' | 'operator' | 'guest' | 'proxy' | null;
    status: 'pending' | 'confirmed' | 'cancelled' | 'no_show';
    startTime: Date;
    endTime: Date;
    notes?: string | null;
    guestName?: string | null;
    guestContact?: string | null;
    guestEmail?: string | null;
    internalMemo?: string | null;
    menuItemId?: string | null;
}

/**
 * 公開の予約カレンダー（空き枠表示）専用の型。
 *
 * なぜこれがあるか:
 *   空き枠を出すのに必要なのは「いつ・誰が・埋まっているか」だけで、
 *   患者さんの氏名・連絡先・症状メモは一切要らない。
 *   未ログインの人に bookings テーブルをそのまま見せると、
 *   これらの個人情報まで全部読めてしまう（2026-07-10 の監査で発覚）。
 *   そこで DB 側に booking_availability というビュー（必要な列だけを映した窓）を作り、
 *   公開側はこの型だけを扱うようにした。
 */
export type BookingSlot = Pick<Booking, 'id' | 'clinicId' | 'staffId' | 'status' | 'startTime' | 'endTime'>;

/** booking_availability ビューの生の行（snake_case のまま） */
export interface BookingSlotRow {
    id: string;
    clinic_id: string;
    staff_id: string | null;
    status: Booking['status'];
    start_time: string;
    end_time: string;
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
    clinicId: string;
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
    patientEmail?: string | null;
    patientPhone?: string | null;
    staffId: string;
    menuItemId?: string | null;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    notes?: string | null;
    createdAt: string;
}

// audit_logs.details (jsonb) に入る操作ログの詳細
export interface AuditLogDetails {
    status?: string;
    previousStatus?: string;
    guest?: string;
    [key: string]: unknown;
}

export interface AuditLog {
    id: string;
    userId?: string | null;
    userEmail?: string | null;
    action: string;
    target?: string | null;
    details?: AuditLogDetails | null;
    ipAddress?: string | null;
    createdAt: string;
}

// 管理画面の予約一覧（bookings + clinics.name の join 結果）
export interface AdminBooking {
    id: string;
    clinicId: string;
    clinicName?: string;
    userId?: string;
    staffId?: string;
    bookedBy: 'user' | 'proxy';
    status: 'confirmed' | 'cancelled' | 'pending' | 'no_show';
    startTime: Date;
    endTime: Date;
    notes?: string;
    guestName?: string;
    guestContact?: string;
    guestEmail?: string;
    internalMemo?: string;
    createdAt: Date;
}

// 管理ダッシュボードの分析データ（getAnalyticsData の戻り値）
export interface DailyBookingStat {
    date: string;
    count: number;
}

export interface UserGrowthStat {
    date: string;
    total: number;
}

export interface PopularClinicStat {
    name: string;
    bookings: number;
}

export interface AnalyticsData {
    dailyBookings: DailyBookingStat[];
    userGrowth: UserGrowthStat[];
    popularClinics: PopularClinicStat[];
}

// site_settings に保存する画像表示設定（ロゴ・装飾イラスト等）
export interface ImageDisplaySettings {
    imageUrl?: string;
    height?: string;
    opacity?: number;
    positionTop?: string;
    positionLeft?: string;
    positionBottom?: string;
}

// 古い staff_info (jsonb) データの互換用。snake_case キーが混在している場合がある
export interface RawStaffInfo extends Partial<Staff> {
    image_url?: string;
    skill_ids?: string[];
    default_schedule?: Staff['defaultSchedule'];
    schedule_overrides?: Staff['scheduleOverrides'];
}

// ==========================================
// Supabase テーブル行型（snake_case、supabase_schema.sql /
// db/migrations-archive/*.sql のカラム定義に準拠）
// ==========================================

// profiles
export interface ProfileRow {
    id: string;
    role: UserRole;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    created_at?: string;
}

// clinics
export interface ClinicRow {
    id: string;
    owner_uid?: string | null;
    name: string;
    description?: string | null;
    images?: string[] | null;
    business_hours?: Clinic['businessHours'] | null;
    location?: Clinic['location'] | null;
    staff_ids?: string[] | null;
    template_id?: Clinic['templateId'] | null;
    menu_categories?: string[] | null;
    menu_items?: MenuItem[] | null;
    staff_info?: Staff[] | null;
    director_info?: Clinic['directorInfo'] | null;
    news_items?: Clinic['newsItems'] | null;
    faq_items?: Clinic['faqItems'] | null;
    access_details?: string | null;
    social_links?: Clinic['socialLinks'] | null;
    status?: Clinic['status'] | null;
    created_at?: string;
    updated_at?: string | null;
}

// bookings
export interface BookingRow {
    id: string;
    clinic_id: string;
    user_id: string | null;
    staff_id: string | null;
    booked_by: Booking['bookedBy'] | null;
    status: Booking['status'];
    start_time: string;
    end_time: string;
    notes: string | null;
    guest_name: string | null;
    guest_contact: string | null;
    guest_email: string | null;
    internal_memo: string | null;
    menu_item_id: string | null;
    checked_in_at?: string | null;
    completed_at?: string | null;
    created_at?: string;
}

// shifts
export interface ShiftRow {
    id: string;
    clinic_id: string;
    staff_id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_holiday: boolean;
    created_at?: string;
}

// shift_requests
export interface ShiftRequestRow {
    id: string;
    clinic_id: string;
    staff_id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_holiday: boolean;
    status: 'pending' | 'approved' | 'rejected';
    created_at?: string;
}

// attendance_records
export interface AttendanceRecordRow {
    id: string;
    clinic_id: string;
    staff_id: string;
    date: string;
    clock_in?: string | null;
    clock_out?: string | null;
    break_time: number;
    status: AttendanceRecord['status'];
    created_at?: string;
    updated_at?: string;
}

// audit_logs
export interface AuditLogRow {
    id: string;
    user_id?: string | null;
    user_email?: string | null;
    action: string;
    target?: string | null;
    details?: AuditLogDetails | null;
    ip_address?: string | null;
    created_at: string;
}
