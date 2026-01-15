
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.CREATIVEHUB_API_KEY;
const API_URL = 'https://api.creativehub.io/api/v1/orders/confirmed';

const basePayload = {
    ExternalRef: 'debug_case_01',
    Email: 'sarapereiralatif@gmail.com',
    FirstName: 'Madson',
    LastName: 'Araujo',
    ShippingAddress: {
        FirstName: 'Madson',
        LastName: 'Araujo',
        Line1: 'Test St',
        City: 'Lisbon',
        PostCode: '1000',
        CountryId: 177,
        CountryCode: 'PT'
    },
    BillingAddress: {
        FirstName: 'Madson',
        LastName: 'Araujo',
        Line1: 'Test St',
        City: 'Lisbon',
        PostCode: '1000',
        CountryId: 177,
        CountryCode: 'PT'
    }
};

async function test(name: string, list: any[]) {
    console.log(`\nTesting: ${name} ...`);
    const payload = { ...basePayload, items: list };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `ApiKey ${API_KEY}` },
            body: JSON.stringify(payload)
        });
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log('Response:', text.substring(0, 300));
    } catch (e) { console.log(e.message); }
}

async function run() {
    // 1. camelCase props
    await test('items_camel', [{ productId: 7644131, printOptionId: 2436349, quantity: 1 }]);

    // 2. snake_case props
    await test('items_snake', [{ product_id: 7644131, print_option_id: 2436349, quantity: 1 }]);

    // 3. PascalProps inside lowercase items
    await test('items_Pascal', [{ ProductId: 7644131, PrintOptionId: 2436349, Quantity: 1 }]);

    // 4. ExternalSku camel
    await test('items_sku_camel', [{ externalSku: "7644131-2436349", quantity: 1 }]);
}

run();
