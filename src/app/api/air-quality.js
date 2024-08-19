export default async function handler(req, res) {
    const { zipCode } = req.query;

    if (!zipCode) {
        return res.status(400).json({ error: 'ZIP code is required' });
    }

    const apiKey = process.env.AIRNOW_API_KEY;
    const url = `https://www.airnowapi.org/aq/forecast/zipCode/?format=application/json&zipCode=${zipCode}&distance=25&API_KEY=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch data from AirNow API');
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching AirNow API data:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
