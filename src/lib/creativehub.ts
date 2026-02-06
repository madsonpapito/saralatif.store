import { CreativeHubOrder, EmbryonicOrderResponse, DeliveryOption, ConfirmedOrderPayload } from '@/types';

const CREATIVEHUB_API_URL = process.env.CREATIVEHUB_API_URL || 'https://api.creativehub.io';
const CREATIVEHUB_API_KEY = process.env.CREATIVEHUB_API_KEY;

/**
 * Makes a request to the CreativeHub API with proper authentication
 */
async function creativeHubRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST',
    body?: any
): Promise<T> {
    if (!CREATIVEHUB_API_KEY) {
        throw new Error('CreativeHub API key not configured');
    }

    const url = `${CREATIVEHUB_API_URL}${endpoint}`;
    console.log(`🔌 CreativeHub API: ${method} ${endpoint}`);

    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ CreativeHub API Error (${response.status}):`, errorText);
        throw new Error(`CreativeHub API error ${response.status}: ${errorText}`);
    }

    return await response.json() as T;
}

/**
 * Creates an order in CreativeHub using the 2-step process:
 * 1. Create Embryonic Order (full payload) -> returns OrderId
 * 2. Get Delivery Options -> returns DeliveryOptionId
 * 3. Confirm Order (simplified payload with OrderId + DeliveryOptionId)
 */
export async function createOrder(order: CreativeHubOrder): Promise<{ success: boolean; orderId?: string; error?: string }> {
    console.log('=== 🚀 CreativeHub Order Flow Started (2-Step) ===');

    try {
        // STEP 1: Create Embryonic Order
        console.log('📝 Step 1: Creating Embryonic Order...');
        console.log('Payload:', JSON.stringify(order, null, 2));

        const embryonicResponse = await creativeHubRequest<EmbryonicOrderResponse>(
            '/api/v1/orders/embryonic',
            'POST',
            order
        );

        const orderId = embryonicResponse.OrderId || embryonicResponse.Id || embryonicResponse.id;
        if (!orderId) {
            throw new Error(`Embryonic order created but no OrderId returned. Response: ${JSON.stringify(embryonicResponse)}`);
        }
        console.log(`✅ Embryonic Order Created. OrderId: ${orderId}`);

        // STEP 2: Get Delivery Options
        console.log(`🚚 Step 2: Fetching Delivery Options...`);
        const countryId = order.ShippingAddress?.CountryId || 177;
        const postCode = order.ShippingAddress?.PostCode || '';

        const deliveryOptions = await creativeHubRequest<DeliveryOption[]>(
            `/api/v1/deliveryoptions/query?CountryId=${countryId}&PostCode=${encodeURIComponent(postCode)}`,
            'GET'
        );

        if (!deliveryOptions || deliveryOptions.length === 0) {
            throw new Error('No delivery options returned by CreativeHub.');
        }

        // Select the first (cheapest) delivery option
        const selectedOption = deliveryOptions[0];
        console.log(`✅ Delivery Option Selected: ${selectedOption.Description || 'Standard'} (ID: ${selectedOption.Id || selectedOption.DeliveryOptionId})`);

        // STEP 3: Confirm Order
        console.log('🔒 Step 3: Confirming Order...');
        const deliveryOptionIdRaw = selectedOption.Id || selectedOption.DeliveryOptionId || 0;
        const deliveryOptionId = typeof deliveryOptionIdRaw === 'string' ? parseInt(deliveryOptionIdRaw) : deliveryOptionIdRaw;

        const confirmPayload: ConfirmedOrderPayload = {
            OrderId: typeof orderId === 'string' ? parseInt(orderId) : orderId,
            DeliveryOptionId: typeof deliveryOptionId === 'string' ? parseInt(deliveryOptionId) : deliveryOptionId,
            DeliveryChargeExcludingSalesTax: selectedOption.Amount || selectedOption.ChargeExcludingTax || 0,
            DeliveryChargeSalesTax: selectedOption.TaxAmount || selectedOption.Tax || 0,
            ExternalReference: order.ExternalRef,
        };

        console.log('Confirm Payload:', JSON.stringify(confirmPayload, null, 2));

        await creativeHubRequest<any>(
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
