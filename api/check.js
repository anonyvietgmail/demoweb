export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Forward the request to the real API
        const response = await fetch('https://gmailver.com/php/check1.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Keep the original Origin/Referer if the API checks for it, 
                // or spoof it locally if needed. 
                'Origin': 'https://www.gmailcek.com',
                'Accept': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            throw new Error(`Upstream API responded with ${response.status}`);
        }

        const data = await response.json();

        // Return the data to our frontend
        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error'
        });
    }
}
