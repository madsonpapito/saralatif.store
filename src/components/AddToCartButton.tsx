'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addItem } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleClick = () => {
        addItem(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isAdded}
            className={`
        w-full py-4 px-8 text-sm tracking-wider uppercase font-medium
        transition-all duration-300 border border-gray-900
        ${isAdded
                    ? 'bg-green-600 text-white border-green-600 cursor-default'
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                }
      `}
        >
            {isAdded ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart
                </span>
            ) : (
                'Add to Cart'
            )}
        </button>
    );
}

export function BuyNowButton({ product }: AddToCartButtonProps) {
    const { addItem } = useCart();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        addItem(product);
        // Small delay to ensure state update if needed, but usually instant.
        // Redirect to cart/checkout
        router.push('/cart');
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="w-full py-4 px-8 text-sm tracking-wider uppercase font-medium transition-all duration-300 bg-gray-900 text-white hover:bg-gray-800 border border-gray-900"
        >
            {isLoading ? 'Processing...' : 'Checkout'}
        </button>
    );
}
