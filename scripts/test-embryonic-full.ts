
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.CREATIVEHUB_API_KEY;
const API_URL = 'https://api.creativehub.io/api/v1/orders/embryonic';

const addr = {
    FirstName: 'Madson',
    LastName: 'Araujo',
    Line1: 'Test St',
    City: 'Lisbon',
    PostCode: '1000',
    CountryId: 177,
    CountryCode: 'PT'
};

const payload = {
    ExternalRef: 'debug_emb_full_01',
    Email: 'sarapereiralatif@gmail.com',
    FirstName: 'Madson',
    LastName: 'Araujo',
    ShippingAddress: addr,
    BillingAddress: addr,
    OrderItems: [
        { ProductId: 7644131, PrintOptionId: 2436349, Quantity: 1 }
    ]
};

async function test() {
    console.log('Testing EMBRYONIC Full...');
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `ApiKey ${API_KEY}` },
            body: JSON.stringify(payload)
        });
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log('Response:', text.substring(0, 500));
    } catch (e) { console.log(e.message); }
}

test();
