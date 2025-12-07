import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Clinic } from '../../types';
import { getClinic } from '../../services/db';
import { supabase } from '../../lib/supabase';

// Templates
import ClinicTemplateStandard from '../../components/templates/ClinicTemplateStandard';
import ClinicTemplateWarm from '../../components/templates/ClinicTemplateWarm';
import ClinicTemplateModern from '../../components/templates/ClinicTemplateModern';

const ClinicDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    // const { user } = useAuth(); // Unused now

    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [loading, setLoading] = useState(true);
    // Removed unused state variables

    useEffect(() => {
        const fetchClinic = async () => {
            if (!id) return;
            try {
                const data = await getClinic(id);
                setClinic(data);

                // Increment PV
                await supabase.rpc('increment_clinic_pv', { p_clinic_id: id });
            } catch (error) {
                console.error("Failed to fetch clinic", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClinic();
    }, [id]);

    if (loading) {
        return <div className="p-10 text-center">読み込み中...</div>;
    }

    if (!clinic) {
        return <div className="p-10 text-center">クリニックが見つかりませんでした</div>;
    }

    // Removed handleBookingSubmit as it is no longer used

    const handleBookingClick = () => {
        // Navigate to Booking Wizard
        navigate(`/booking?clinicId=${clinic.id}`);
    };

    const renderTemplate = () => {
        switch (clinic.templateId) {
            case 'warm':
                return <ClinicTemplateWarm clinic={clinic} onBooking={handleBookingClick} />;
            case 'modern':
                return <ClinicTemplateModern clinic={clinic} onBooking={handleBookingClick} />;
            case 'standard':
            default:
                return <ClinicTemplateStandard clinic={clinic} onBooking={handleBookingClick} />;
        }
    };

    return (
        <>
            {renderTemplate()}
        </>
    );
};

export default ClinicDetail;
