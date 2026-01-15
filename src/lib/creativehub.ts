import { CreativeHubOrder } from '@/types';

const CREATIVEHUB_API_URL = process.env.CREATIVEHUB_API_URL || 'https://api.creativehub.io';
const CREATIVEHUB_API_KEY = process.env.CREATIVEHUB_API_KEY;

export async function createOrder(order: CreativeHubOrder): Promise<{ success: boolean; orderId?: string; error?: string }> {
    console.log('=== CreativeHub Order Creation Started ===');
    console.log('API URL:', CREATIVEHUB_API_URL);
    console.log('API Key configured:', !!CREATIVEHUB_API_KEY);
    console.log('Order payload:', JSON.stringify(order, null, 2));

    if (!CREATIVEHUB_API_KEY) {
        console.error('❌ CreativeHub API key not configured');
        return { success: false, error: 'CreativeHub API key not configured' };
    }

    // Try valid auth formats based on documentation
    const authFormats = [
        `ApiKey ${CREATIVEHUB_API_KEY}`,
        CREATIVEHUB_API_KEY,
        `Bearer ${CREATIVEHUB_API_KEY}`
    ];

    for (const authHeader of authFormats) {
        try {
            console.log(`🔄 Trying auth format: ${authHeader.substring(0, 10)}...`);

            // Correct endpoint for confirmed orders
            const requestUrl = `${CREATIVEHUB_API_URL}/api/v1/orders/confirmed`;
            console.log('Request URL:', requestUrl);

            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader,
                },
                body: JSON.stringify(order),
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers)));

            if (response.ok) {
                const data = await response.json();
                console.log('✅ CreativeHub order created successfully:', JSON.stringify(data, null, 2));
                return { success: true, orderId: data.id || data.order_id || data.Id || data.OrderId };
            }

            const errorText = await response.text();
            console.log(`❌ Auth format failed with status ${response.status}:`, errorText);

            // If it's a 401/403, try next auth format
            if (response.status === 401 || response.status === 403) {
                continue;
            }

            // For other errors, return immediately
            return { success: false, error: `CreativeHub API error: ${response.status} - ${errorText}` };

        } catch (error) {
            console.error('❌ Network error with auth format:', error);
        }
    }

    console.error('❌ All auth formats failed');
    return { success: false, error: 'Failed to authenticate with CreativeHub - all auth formats failed' };
}
