import { supabase } from '$lib/supabaseClient'; // We'll create this file next
import type { RequestHandler } from './$types';

const DAILY_ORDER_LIMIT = 15;

export const POST: RequestHandler = async ({ request }) => {
    try {
        const orderData = await request.json();
        const { items, totalAmount, orderId } = orderData;

        // 1. Check daily order limit
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of the day

        const { count: dailyOrdersCount, error: countError } = await supabase
            .from('orders')
            .select('*', { count: 'exact' })
            .gte('created_at', today.toISOString());

        if (countError) {
            console.error('Error checking daily order count:', countError);
            return new Response(JSON.stringify({ success: false, error: 'Error checking order limit.' }), { status: 500 });
        }

        if (dailyOrdersCount !== null && dailyOrdersCount >= DAILY_ORDER_LIMIT) {
            return new Response(JSON.stringify({ success: false, error: 'Daily order limit reached.' }), { status: 429 }); // 429 Too Many Requests
        }

        // 2. Save the order to Supabase
        const { data, error: insertError } = await supabase
            .from('orders')
            .insert([
                {
                    order_id: orderId,
                    items: items, // Store items as JSONB
                    total_amount: totalAmount,
                    // user_id: auth.uid() // Uncomment if you have authentication
                },
            ]);

        if (insertError) {
            console.error('Error saving order to Supabase:', insertError);
            return new Response(JSON.stringify({ success: false, error: 'Error saving order.' }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true, orderId: orderId }), { status: 200 });

    } catch (error) {
        console.error('Error processing order request:', error);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error.' }), { status: 500 });
    }
};

// Optional: Add a GET endpoint to check the daily limit from the frontend
export const GET: RequestHandler = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of the day

        const { count: dailyOrdersCount, error: countError } = await supabase
            .from('orders')
            .select('*', { count: 'exact' })
            .gte('created_at', today.toISOString());

        if (countError) {
            console.error('Error checking daily order count:', countError);
            return new Response(JSON.stringify({ success: false, error: 'Error checking order limit.' }), { status: 500 });
        }

        const limitReached = dailyOrdersCount !== null && dailyOrdersCount >= DAILY_ORDER_LIMIT;

        return new Response(JSON.stringify({ limitReached }), { status: 200 });

    } catch (error) {
        console.error('Error checking daily limit:', error);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error.' }), { status: 500 });
    }
};