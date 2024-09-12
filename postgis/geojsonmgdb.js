const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/geoDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the GeoJSON schema
const locationSchema = new mongoose.Schema({
  name: String,
  geometry: {
    type: {
      type: String,
      enum: ['Point', 'LineString', 'Polygon'], // Only allow specific GeoJSON types
      required: true,
    },
    coordinates: {
      type: [[Number]], // Array of arrays for polygon coordinates
      required: true,
    },
  },
});

// Create the model
const Location = mongoose.model('Location', locationSchema);

// Read the JSON file
const filePath = path.join(__dirname, 'karnataka.json');
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Parse the JSON data
  const geoJSON = JSON.parse(data);

  // Insert the GeoJSON data into MongoDB
  Location.create(geoJSON, (err, location) => {
    if (err) {
      console.error('Error inserting GeoJSON data:', err);
    } else {
      console.log('GeoJSON data inserted:', location);
    }

    // Close the MongoDB connection
    mongoose.connection.close();
  });
});
