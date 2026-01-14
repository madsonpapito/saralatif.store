import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createOrder } from '@/lib/creativehub';
import { CreativeHubOrder } from '@/types';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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

        console.log('Checkout session completed:', session.id);

        try {
            // Parse cart items from metadata
            const cartItemsJson = session.metadata?.cartItems;
            if (!cartItemsJson) {
                console.error('No cart items in session metadata');
                return NextResponse.json({ received: true });
            }

            const cartItems = JSON.parse(cartItemsJson) as Array<{
                productId: string;
                quantity: number;
                sku: string;
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
                external_ref: session.id,
                shipping_address: {
                    first_name: firstName,
                    last_name: lastName,
                    line1: address.line1 || '',
                    line2: address.line2 || undefined,
                    city: address.city || '',
                    state: address.state || undefined,
                    postal_code: address.postal_code || '',
                    country: address.country || 'PT',
                },
                items: cartItems.map((item) => ({
                    external_sku: item.sku,
                    quantity: item.quantity,
                    attributes: {
                        paper: item.paper,
                        size: item.size,
                    },
                })),
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
