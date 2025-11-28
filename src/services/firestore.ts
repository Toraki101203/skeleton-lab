import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Clinic, Booking } from '../types';

// --- User & Diagnosis ---

export const saveDiagnosis = async (userId: string, data: any) => {
    try {
        const docRef = await addDoc(collection(db, 'diagnosis_logs'), {
            userId,
            ...data,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving diagnosis:", error);
        throw error;
    }
};

// --- Clinic Management ---

export const getClinic = async (clinicId: string): Promise<Clinic | null> => {
    try {
        const docRef = doc(db, 'clinics', clinicId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Clinic;
        }
        return null;
    } catch (error) {
        console.error("Error getting clinic:", error);
        throw error;
    }
};

export const updateClinicProfile = async (clinicId: string, data: Partial<Clinic>) => {
    try {
        const docRef = doc(db, 'clinics', clinicId);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error("Error updating clinic:", error);
        throw error;
    }
};

export const getAllClinics = async (): Promise<Clinic[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, 'clinics'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Clinic));
    } catch (error) {
        console.error("Error fetching clinics:", error);
        throw error;
    }
};

// --- Booking ---

export const createBooking = async (booking: Omit<Booking, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, 'bookings'), {
            ...booking,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
    }
};

export const getClinicBookings = async (clinicId: string, startDate: Date, endDate: Date) => {
    try {
        // Note: In a real app, you'd use compound queries for date range
        // For simplicity, we fetch all for the clinic and filter client-side or use a simple index
        const q = query(collection(db, 'bookings'), where("clinicId", "==", clinicId));
        const querySnapshot = await getDocs(q);

        // Basic client-side filtering for date (since Firestore range queries need indexes)
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking))
            .filter(b => {
                const start = b.startTime instanceof Timestamp ? b.startTime.toDate() : new Date(b.startTime);
                return start >= startDate && start <= endDate;
            });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw error;
    }
};
