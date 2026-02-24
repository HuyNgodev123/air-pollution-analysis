import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import startPoller from './jobs/poller.js';
import measurementsRouter from './routes/measurements.js';
import locationsRouter from './routes/locations.js'; 
import authRouter from './routes/auth.js'; 
import { seedLocations } from './seed.js';
import productRoutes from './routes/products.js';
import user from './routes/user.js';

const app = express();
app.use(cors({
    origin: '*', 
    credentials: true
}));
app.use(express.json());


app.use('/api/measurements', measurementsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRouter);
app.use('/api/user', user);
app.get('/', (req, res) => res.send('Air Quality API running...'));


const start = async () => {
try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    await seedLocations();
    // Start poller after DB connected
    startPoller();
} catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
}
};


start();