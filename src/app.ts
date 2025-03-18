import express from 'express';
import { POST as registerUser } from './api/register/route';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello API!');
});

app.post('/api/register', async (req, res) => {
    try {
        // Call the registerUser function directly with the request body
        const request = {
            method: 'POST',
            headers: req.headers,
            body: JSON.stringify(req.body),
        };

        const response = await registerUser(request as any); // Adjust type if needed
        res.status(response.status).json(await response.json());
    } catch (error) {
        console.error('Error in /api/register:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});