
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.CREATIVEHUB_API_KEY;
const API_URL = 'https://api.creativehub.io/api/v1/orders/embryonic';

async function test() {
    console.log('--- Testing ShippingAddress Variations ---');

    const var1 = {
        name: "CountryCode + Fields inside ShippingAddress",
        payload: {
            ExternalRef: 'debug_test_addr_01',
            ShippingAddress: {
                FirstName: 'Test',
                LastName: 'User',
                Line1: 'Street',
                City: 'City',
                PostCode: '12345',
                CountryCode: 'PT'
            },
            Items: [{ ProductId: 7644143, PrintOptionId: 2436364, Quantity: 1 }]
        }
    };

    const var2 = {
        name: "IsoCountryCode",
        payload: {
            ExternalRef: 'debug_test_addr_02',
            ShippingAddress: {
                FirstName: 'Test',
                LastName: 'User',
                Line1: 'Street',
                City: 'City',
                PostCode: '12345',
                IsoCountryCode: 'PT'
            },
            Items: [{ ProductId: 7644143, PrintOptionId: 2436364, Quantity: 1 }]
        }
    };

    for (const v of [var1, var2]) {
        console.log(`\nTesting: ${v.name}`);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `ApiKey ${API_KEY}` },
                body: JSON.stringify(v.payload)
            });
            console.log(`Status: ${res.status}`);
            const text = await res.text();
            console.log('Response:', text);
        } catch (e) { console.log(e.message); }
    }
}

test();
