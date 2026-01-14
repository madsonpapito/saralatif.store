import { NextResponse } from 'next/server';

const CREATIVEHUB_API_URL = process.env.CREATIVEHUB_API_URL || 'https://api.creativehub.io';
const CREATIVEHUB_API_KEY = process.env.CREATIVEHUB_API_KEY;

/**
 * GET /api/products/debug
 * Debug endpoint to test CreativeHub API connection with different auth formats
 */
export async function GET() {
    const results: Record<string, unknown> = {
        config: {
            apiUrl: CREATIVEHUB_API_URL,
            apiKeyConfigured: !!CREATIVEHUB_API_KEY,
            apiKeyLength: CREATIVEHUB_API_KEY?.length || 0,
            apiKeyPrefix: CREATIVEHUB_API_KEY?.substring(0, 15) + '...',
        },
        tests: [],
    };

    if (!CREATIVEHUB_API_KEY) {
        return NextResponse.json({
            ...results,
            error: 'CREATIVEHUB_API_KEY not configured in .env.local',
        });
    }

    // Test different auth header formats
    const authFormats = [
        { name: 'Authorization (direct)', headers: { 'Authorization': CREATIVEHUB_API_KEY } },
        { name: 'Authorization Bearer', headers: { 'Authorization': `Bearer ${CREATIVEHUB_API_KEY}` } },
        { name: 'Api-Key header', headers: { 'Api-Key': CREATIVEHUB_API_KEY } },
        { name: 'X-API-Key header', headers: { 'X-API-Key': CREATIVEHUB_API_KEY } },
        { name: 'x-api-key lowercase', headers: { 'x-api-key': CREATIVEHUB_API_KEY } },
    ];

    const requestBody = { Page: 1, PageSize: 10 };

    for (const format of authFormats) {
        try {
            const fullUrl = `${CREATIVEHUB_API_URL}/api/v1/products/query`;

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(format.headers as any),
                } as HeadersInit,
                body: JSON.stringify(requestBody),
            });

            const responseText = await response.text();
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch {
                // Show first 300 chars if not JSON
                responseData = responseText.substring(0, 300);
            }

            (results.tests as unknown[]).push({
                format: format.name,
                url: fullUrl,
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                response: responseData,
            });

            // If successful, stop testing
            if (response.ok) {
                results.successfulFormat = format.name;
                break;
            }
        } catch (error) {
            (results.tests as unknown[]).push({
                format: format.name,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    results.requestBody = requestBody;

    return NextResponse.json(results, { status: 200 });
}
