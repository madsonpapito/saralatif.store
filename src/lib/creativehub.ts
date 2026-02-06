import { CreativeHubOrder, EmbryonicOrderResponse, DeliveryOption, ConfirmedOrderPayload } from '@/types';

const CREATIVEHUB_API_URL = process.env.CREATIVEHUB_API_URL || 'https://api.creativehub.io';
const CREATIVEHUB_API_KEY = process.env.CREATIVEHUB_API_KEY;

// Helper to handle Auth Headers and Retries
async function creativeHubRequest<T>(endpoint: string, method: 'GET' | 'POST', body?: any): Promise<T> {
    if (!CREATIVEHUB_API_KEY) {
        throw new Error('CreativeHub API key not configured');
    }

    const authFormats = [
        `ApiKey ${CREATIVEHUB_API_KEY}`,
        CREATIVEHUB_API_KEY,
        `Bearer ${CREATIVEHUB_API_KEY}`
    ];

    let lastError: string = 'Unknown error';

    for (const authHeader of authFormats) {
        try {
            console.log(`🔌 Request: ${method} ${endpoint} (Auth: ${authHeader.substring(0, 10)}...)`);

            const response = await fetch(`${CREATIVEHUB_API_URL}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader,
                },
                body: body ? JSON.stringify(body) : undefined,
            });

            if (response.ok) {
                return await response.json() as T;
            }

            const errorText = await response.text();
            lastError = `Status ${response.status}: ${errorText}`;
            console.warn(`⚠️ Request failed with ${authHeader.substring(0, 10)}...: ${lastError}`);

            // If it's NOT an auth error (401/403), do not retry other formats. Fail immediately.
            if (response.status !== 401 && response.status !== 403) {
                throw new Error(lastError);
            }

        } catch (error: any) {
            // Rethrow if it's the specific error we just threw above (checking message matches lastError)
            if (error.message === lastError) {
                throw error;
            }
            console.error('❌ Network/Auth error:', error);
            lastError = error.message;
        }
    }

    throw new Error(`All auth formats failed. Last error: ${lastError}`);
}

export async function createOrder(order: CreativeHubOrder): Promise<{ success: boolean; orderId?: string; error?: string }> {
    console.log('=== 🚀 CreativeHub Order Flow Started (3-Step) ===');

    try {
        // STEP 1: Embryonic Order
        console.log('📝 Step 1: Creating Embryonic Order...');
        const embryonic = await creativeHubRequest<EmbryonicOrderResponse>(
            '/api/v1/orders/embryonic',
            'POST',
            order
        );

        const orderId = embryonic.id || embryonic.Id;
        if (!orderId) {
            throw new Error(`Embryonic order created but no ID returned. Response: ${JSON.stringify(embryonic)}`);
        }
        console.log(`✅ Embryonic Order Created. ID: ${orderId}`);

        // STEP 2: Delivery Options
        console.log(`🚚 Step 2: Fetching Delivery Options for Order ${orderId}...`);
        const deliveryOptions = await creativeHubRequest<DeliveryOption[]>(
            `/api/v1/deliveryoptions/query?orderId=${orderId}`,
            'GET'
        );

        if (!deliveryOptions || deliveryOptions.length === 0) {
            throw new Error('No delivery options returned by CreativeHub.');
        }

        // Select the cheapest option (usually the first one, or specifically "Standard")
        // Ensuring we pick a valid option
        const selectedOption = deliveryOptions[0];
        console.log(`✅ Delivery Option Selected: ${selectedOption.Description} (${selectedOption.Id}) - ${selectedOption.TotalAmount} ${selectedOption.Currency || ''}`);

        // STEP 3: Confirm Order
        console.log('🔒 Step 3: Confirming Order...');
        const confirmPayload: ConfirmedOrderPayload = {
            OrderId: typeof orderId === 'string' ? parseInt(orderId) : orderId,
            DeliveryOptionId: selectedOption.Id,
            DeliveryChargeExcludingSalesTax: selectedOption.Amount, // Optional but good practice
            DeliveryChargeSalesTax: selectedOption.TaxAmount          // Optional but good practice
        };

        const confirmed = await creativeHubRequest<any>(
            '/api/v1/orders/confirmed',
            'POST',
            confirmPayload
        );

        console.log('✅✅ ORDER CONFIRMED SUCCESSFULLY!');
        return { success: true, orderId: orderId.toString() };

    } catch (error: any) {
        console.error('❌ CreativeHub Order Flow Failed:', error.message);
        return { success: false, error: error.message };
    }
}
