import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CartItem } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const { items }: { items: CartItem[] } = await request.json();

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: 'No items in cart' },
                { status: 400 }
            );
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        // Create line items for Stripe
        const lineItems = items.map((item) => ({
            price_data: {
                currency: item.product.currency.toLowerCase(),
                product_data: {
                    name: item.product.title,
                    description: item.product.description,
                    images: [
                        item.product.image.startsWith('http')
                            ? item.product.image
                            : `${baseUrl}${item.product.image}`,
                    ],
                    metadata: {
                        productId: item.product.id,
                        creativeHubSku: item.product.creativeHubSettings.sku,
                        paperId: item.product.creativeHubSettings.paperId,
                        size: item.product.creativeHubSettings.size,
                    },
                },
                unit_amount: Math.round(item.product.price * 100), // Stripe uses cents
            },
            quantity: item.quantity,
        }));

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            shipping_address_collection: {
                allowed_countries: [
                    'PT', 'ES', 'FR', 'DE', 'IT', 'GB', 'NL', 'BE', 'AT', 'CH',
                    'US', 'CA', 'AU', 'BR', 'JP', 'KR', 'SG', 'AE'
                ],
            },
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/canceled`,
            metadata: {
                cartItems: JSON.stringify(
                    items.map((item) => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                        sku: item.product.creativeHubSettings.sku,
                        creativeHubProductId: item.product.creativeHubProductId,
                        creativeHubPrintOptionId: item.product.creativeHubPrintOptionId,
                        paper: item.product.creativeHubSettings.paperId,
                        size: item.product.creativeHubSettings.size,
                    }))
                ),
            },
            allow_promotion_codes: true, // Enable coupons (for testing/marketing)
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
