const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


// MongoDB connection URI
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.post('/tiles', async (req, res) => {
  try {
    
    // Convert latlngs to GeoJSON Polygon
    const { aoiCoordinates } = req.body;
   
    const polygon = {
      type: 'Polygon',
      coordinates: [aoiCoordinates]
    };

    // Connect to MongoDB
    await client.connect();
    const database = client.db('geoDB');
    const tilesCollection = database.collection('geoCollection');

    // Find tiles intersecting with the provided polygon
    const intersectingTiles = await tilesCollection.find({
      geometry: {
        $geoIntersects: {
          $geometry: polygon
        }
      }
    }).toArray();

    res.json(intersectingTiles);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  } finally {
    await client.close();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
