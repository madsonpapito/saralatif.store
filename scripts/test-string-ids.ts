
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.CREATIVEHUB_API_KEY;
const API_URL = 'https://api.creativehub.io/api/v1/orders/confirmed';

const payload = {
    ExternalRef: 'debug_string_id_01',
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
    },
    // Test 'items' lower with STRING IDs
    items: [
        {
            productId: "7644131",
            printOptionId: "2436349",
            quantity: 1
        }
    ]
};

async function test() {
    console.log('Testing String IDs...');
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

test();
