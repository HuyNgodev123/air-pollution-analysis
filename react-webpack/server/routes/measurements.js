import express from 'express';
import Measurement from '../models/Measurement.js';


const router = express.Router();


// GET /api/measurements?city=Hanoi&parameter=pm25&limit=100&from=&to=
router.get('/', async (req, res) => {
try {
    const { city, parameter, limit = 100, from, to } = req.query;
    const q = {};
    if (city) q.city = new RegExp(city, 'i');
    if (parameter) q.parameter = parameter;
    if (from || to) q.timestamp = {};
    if (from) q.timestamp.$gte = new Date(from);
    if (to) q.timestamp.$lte = new Date(to);


const docs = await Measurement.find(q).sort({ timestamp: -1 }).limit(Number(limit));
    res.json({ count: docs.length, results: docs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


export default router;