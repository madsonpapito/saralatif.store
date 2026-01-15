import { products as staticProducts } from '@/data/products';
import { Product } from '@/types';

const BASE_IMAGE_URL = 'https://app.creativehub.io/file-preview/api/file/pshubcontainer/';

/**
 * Returns all products with normalized image URLs.
 */
export function getAllProducts(): Product[] {
    return staticProducts.map(product => ({
        ...product,
        image: product.image.startsWith('http') ? product.image : `${BASE_IMAGE_URL}${product.image}`
    }));
}

/**
 * Returns unique products grouped by creativeHubProductId.
 * It selects the cheapest variant (usually the smallest size) as the representative.
 */
export function getUniqueProducts(): Product[] {
    const allProducts = getAllProducts();
    const seenIds = new Set<number>();
    const uniqueProducts: Product[] = [];

    // Sort by price ascending so we pick the cheapest variant first
    const sortedProducts = [...allProducts].sort((a, b) => a.price - b.price);

    for (const product of sortedProducts) {
        // If we haven't seen this artwork ID yet (or if generic ID, check title/ID)
        const identifier = product.creativeHubProductId || product.id;

        if (!seenIds.has(identifier as number)) {
            seenIds.add(identifier as number);
            uniqueProducts.push(product);
        }
    }

    return uniqueProducts;
}

export function getProductById(id: string): Product | undefined {
    const products = getAllProducts();
    return products.find(p => p.id === id);
}

export function getProductVariants(product: Product): Product[] {
    if (!product.creativeHubProductId) return [];
    const products = getAllProducts();
    return products.filter(p =>
        p.creativeHubProductId === product.creativeHubProductId &&
        p.id !== product.id
    ).sort((a, b) => a.price - b.price);
}
