import express from 'express';
import { POST as registerUser } from './api/register/route';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello API!');
});

app.post('/api/register', async (req, res) => {
    const request = new Request('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
    });

    const response = await registerUser(request);
    res.status(response.status).json(await response.json());
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});