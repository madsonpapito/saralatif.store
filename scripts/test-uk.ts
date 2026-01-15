
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.CREATIVEHUB_API_KEY;
const API_URL = 'https://api.creativehub.io/api/v1/orders/embryonic';

const addr = {
    FirstName: 'Test',
    LastName: 'User',
    Line1: '10 Downing Street',
    City: 'London',
    PostCode: 'SW1A 2AA',
    CountryId: 224, // UK
    CountryCode: 'GB'
};

const payload = {
    ExternalRef: 'debug_uk_01',
    Email: 'sarapereiralatif@gmail.com',
    FirstName: 'Test',
    LastName: 'User',
    ShippingAddress: addr,
    BillingAddress: addr,
    OrderItems: [
        { ProductId: 7644131, PrintOptionId: 2436349, Quantity: 1 }
    ]
};

async function test() {
    console.log('Testing UK Address...');
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
