const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  city: { type: String, index: true },
  location: String,
  parameter: { type: String, index: true }, // e.g. pm25, pm10, co, no2
  value: Number,
  unit: String,
  timestamp: { type: Date, index: true },
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [lon, lat]
  },
  source: String, // e.g. 'openaq'
}, { timestamps: true });

// Create a 2dsphere index for geo queries
measurementSchema.index({ coordinates: '2dsphere' });
// Composite index for queries by city + parameter + timestamp
measurementSchema.index({ city: 1, parameter: 1, timestamp: -1 });

module.exports = mongoose.model('Measurement', measurementSchema);
