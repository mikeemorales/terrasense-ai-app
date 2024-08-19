import { NextResponse } from 'next/server';

export async function POST(request) {
    const { query } = await request.json();
    const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const endpoint = 'https://api.openai.com/v1/completions';

    try {
        // Use GPT-3 to understand and extract the zip code from the query
        const gptResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`,
            },
            body: JSON.stringify({
                model: 'text-davinci-003', // Ensure the model is correct
                prompt: `Extract the zip code from the following query: "${query}"`,
                max_tokens: 10,
                temperature: 0.0, // Adjust if needed
            }),
        });

        if (!gptResponse.ok) {
            throw new Error(`Failed to fetch GPT response: ${gptResponse.statusText}`);
        }

        const gptData = await gptResponse.json();
        const zipCode = gptData.choices[0].text.trim(); // Extracted zip code

        if (!zipCode) {
            throw new Error('No zip code extracted from GPT response');
        }

        // Fetch air quality data using the extracted zip code
        const airNowApiKey = process.env.NEXT_PUBLIC_AIRNOW_API_KEY;
        const airNowResponse = await fetch(`https://www.airnowapi.org/aq/forecast/zipCode/?format=application/json&zipCode=${zipCode}&distance=25&API_KEY=${airNowApiKey}`);

        if (!airNowResponse.ok) {
            throw new Error(`Failed to fetch air quality data: ${airNowResponse.statusText}`);
        }

        const airQualityData = await airNowResponse.json();
        return NextResponse.json({ response: airQualityData });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ response: null, error: error.message }, { status: 500 });
    }
}
