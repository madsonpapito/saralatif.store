import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createOrder } from '@/lib/creativehub';
import { CreativeHubOrder } from '@/types';

// Force dynamic to prevent caching issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// GET handler for testing if the route is accessible
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Stripe webhook endpoint is active',
        timestamp: new Date().toISOString()
    });
}


export async function POST(request: NextRequest) {
    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured');
        return NextResponse.json(
            { error: 'Webhook secret not configured' },
            { status: 500 }
        );
    }

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'No signature provided' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('=== Stripe Webhook: Checkout Session Completed ===');
        console.log('Session ID:', session.id);
        console.log('Session metadata:', JSON.stringify(session.metadata, null, 2));
        console.log('Shipping details:', JSON.stringify((session as any).shipping_details, null, 2));

        try {
            // Parse cart items from metadata
            const cartItemsJson = session.metadata?.cartItems;
            console.log('Cart items JSON:', cartItemsJson);

            if (!cartItemsJson) {
                console.error('❌ No cart items in session metadata');
                return NextResponse.json({ received: true });
            }

            const cartItems = JSON.parse(cartItemsJson) as Array<{
                productId: string;
                quantity: number;
                sku: string;
                creativeHubProductId?: number;
                creativeHubPrintOptionId?: number;
                paper: string;
                size: string;
            }>;

            // Get shipping address from session
            const shippingDetails = (session as any).shipping_details;
            if (!shippingDetails?.address) {
                console.error('No shipping address in session');
                return NextResponse.json({ received: true });
            }

            const address = shippingDetails.address;
            const nameParts = (shippingDetails.name || 'Customer').split(' ');
            const firstName = nameParts[0] || 'Customer';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Build CreativeHub order
            const creativeHubOrder: CreativeHubOrder = {
                ExternalRef: session.id,
                Email: session.customer_details?.email || undefined,
                ShippingAddress: {
                    FirstName: firstName,
                    LastName: lastName,
                    Line1: address.line1 || '',
                    Line2: address.line2 || undefined,
                    City: address.city || '',
                    State: address.state || undefined,
                    PostCode: address.postal_code || '',
                    CountryCode: address.country || 'PT', // Stripe gives ISO 2 char, safe to pass
                },
                Items: cartItems.map((item) => {
                    // Prefer ID-based ordering if available
                    if (item.creativeHubProductId && item.creativeHubPrintOptionId) {
                        return {
                            ProductId: item.creativeHubProductId,
                            PrintOptionId: item.creativeHubPrintOptionId,
                            Quantity: item.quantity
                        };
                    }
                    // Fallback to SKU
                    return {
                        ExternalSku: item.sku,
                        Quantity: item.quantity
                    };
                }),
            };

            console.log('Creating CreativeHub order:', JSON.stringify(creativeHubOrder, null, 2));

            // Send order to CreativeHub
            const result = await createOrder(creativeHubOrder);

            if (result.success) {
                console.log('CreativeHub order created successfully:', result.orderId);
            } else {
                console.error('Failed to create CreativeHub order:', result.error);
                // Note: In production, you might want to implement retry logic
                // or queue failed orders for manual processing
            }
        } catch (error) {
            console.error('Error processing checkout session:', error);
        }
    }

    return NextResponse.json({ received: true });
}
