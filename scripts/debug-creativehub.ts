
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function debug() {
    // Dynamic import to allow dotenv to load first
    const { fetchProductById } = await import('../src/lib/creativehub-products');

    console.log('Fetching product 7644143...');
    const product = await fetchProductById(7644143);

    if (!product) {
        console.error('Product not found!');
        return;
    }

    console.log('Product Name:', product.DisplayName);
    console.log('Print Options Count:', product.PrintOptions?.length);

    const targetId = 2436364;
    const option = product.PrintOptions?.find(p => p.Id === targetId);

    if (option) {
        console.log('✅ Found PrintOption:', targetId);
        console.log('   IsAvailable:', option.IsAvailable);
        console.log('   Name:', option.Name);
        console.log('   Size:', option.SizeName);
    } else {
        console.error('❌ PrintOption NOT found:', targetId);
        console.log('Available Options:', product.PrintOptions?.map(p => p.Id));
    }
}

debug();
