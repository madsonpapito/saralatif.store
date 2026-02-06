import { CreativeHubOrder } from '@/types';

const CREATIVEHUB_API_URL = process.env.CREATIVEHUB_API_URL || 'https://api.creativehub.io';
const CREATIVEHUB_API_KEY = process.env.CREATIVEHUB_API_KEY;

export async function createOrder(order: CreativeHubOrder): Promise<{ success: boolean; orderId?: string; error?: string }> {
    if (!CREATIVEHUB_API_KEY) {
        console.error('CreativeHub API key not configured');
        return { success: false, error: 'CreativeHub API key not configured' };
    }

    try {
        // Correct endpoint based on Swagger /api/v1/orders pattern
        const response = await fetch(`${CREATIVEHUB_API_URL}/api/v1/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': CREATIVEHUB_API_KEY, // Trying direct key first since it has 'production-' prefix
            },
            body: JSON.stringify(order),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('CreativeHub API error:', errorText);
            return { success: false, error: `CreativeHub API error: ${response.status}` };
        }

        const data = await response.json();
        console.log('CreativeHub order created:', data);

        return { success: true, orderId: data.id || data.order_id };
    } catch (error) {
        console.error('Failed to create CreativeHub order:', error);
        return { success: false, error: 'Failed to connect to CreativeHub' };
    }
}
