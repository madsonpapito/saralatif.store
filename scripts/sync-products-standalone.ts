
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Load .env.local
dotenv.config({ path: '.env.local' });

async function sync() {
    console.log('Starting standalone product sync...');

    // Dynamic import to ensure env vars are loaded first
    const { fetchProducts, transformProducts } = await import('../src/lib/creativehub-products');

    try {
        const chProducts = await fetchProducts();

        if (chProducts.length === 0) {
            console.error('No products found!');
            process.exit(1);
        }

        console.log(`Found ${chProducts.length} products.`);

        const products = transformProducts(chProducts);

        const fileContent = `// Auto-generated from CreativeHub API
// Generated at: ${new Date().toISOString()}
// Total products: ${products.length}

import { Product } from '@/types';

export const products: Product[] = ${JSON.stringify(products, null, 2)};

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}
`;

        const filePath = join(process.cwd(), 'src', 'data', 'products.ts');
        writeFileSync(filePath, fileContent, 'utf-8');
        console.log('✅ Successfully wrote updated products to:', filePath);

    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

sync();
