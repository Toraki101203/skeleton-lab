
import { createBooking, updateBooking, getClinicBookings } from './src/services/db';
import { supabase } from './src/lib/supabase';

async function testUpdate() {
    console.log("Starting test...");

    // 1. Create a dummy booking
    const bookingId = crypto.randomUUID();
    const clinicId = 'clinic1'; // check if exists? assume mock
    // we need real clinic ID probably.

    // Let's use raw SQL to insert to be sure, or better yet, verify existing data.
    // Instead of creating, let's just pick one and update it.

    const { data: bookings } = await supabase.from('bookings').select('*').limit(1);
    if (!bookings || bookings.length === 0) {
        console.log("No bookings found to test with.");
        return;
    }

    const targetId = bookings[0].id;
    const initialStatus = bookings[0].status;
    console.log(`Target Booking: ${targetId}, Status: ${initialStatus}`);

    const newStatus = initialStatus === 'confirmed' ? 'cancelled' : 'confirmed';
    console.log(`Attempting update to: ${newStatus}`);

    await updateBooking(targetId, { status: newStatus });

    const { data: updated } = await supabase.from('bookings').select('status').eq('id', targetId).single();
    console.log(`Result Status: ${updated?.status}`);

    if (updated?.status === newStatus) {
        console.log("SUCCESS: Status updated.");
        // Revert
        await updateBooking(targetId, { status: initialStatus });
        console.log("Reverted status.");
    } else {
        console.error("FAILURE: Status did not update!");
    }
}

testUpdate();
