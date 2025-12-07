
import { supabase } from './src/lib/supabase';

async function checkLatestBooking() {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Latest Booking:", data);
    }
}

checkLatestBooking();
