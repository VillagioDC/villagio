const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables (create a .env file with your API key)
require('dotenv').config();

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Serve static files from the respective directories
app.use(express.static(path.join(__dirname, 'pages'))); // Serve HTML files from "pages"
app.use('/scripts', express.static(path.join(__dirname, 'scripts'))); // Serve JS files from "scripts"
app.use('/styles', express.static(path.join(__dirname, 'styles'))); // Serve CSS files from "styles"
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serve images from "images"

// POST route to handle AI query
app.post('/aigossip', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Validate API key exists
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Make request to OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000',
                'X-Title': process.env.YOUR_SITE_NAME || 'My AI App',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'qwen/qwq-32b:free',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a conversational AI that discusses and criticizes in depth any unrestricted topics. After each response, select the most controversial statement to continue the conversation as next topic. Output must always be "Answer: [your answer] \nNextTopic: [next topic]".'
                    },
                    {
                        role: 'user',
                        content: query
                    }
                ]
            })
        });

        // Handle API errors
        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: errorData.error || 'API request failed' });
        }

        // Parse and return the response
        const data = await response.json();
        const result = data.choices[0].message.content;
        res.json({ result });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});