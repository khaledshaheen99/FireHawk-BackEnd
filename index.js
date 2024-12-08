const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Firestore } = require('@google-cloud/firestore');
const { Parser } = require('json2csv');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Middleware to ensure responses are JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Firestore setup
const firestore = new Firestore({
  keyFilename: './service-account-key.json',
});

const carsCollection = firestore.collection('cars');

// GET: Fetch all cars with optional filters
app.get('/cars', async (req, res) => {
  try {
    const snapshot = await carsCollection.get();
    const cars = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error.message);
    res.status(500).json({ error: 'Error fetching cars: ' + error.message });
  }
});

// POST: Add a new car
app.post('/cars', async (req, res) => {
  try {
    const car = req.body;

    // Validate required fields
    const requiredFields = [
      'name',
      'mpg',
      'cylinders',
      'displacement',
      'horsepower',
      'weight',
      'acceleration',
      'model_year',
      'origin',
    ];
    for (const field of requiredFields) {
      if (!car[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Add car to Firestore
    const docRef = await carsCollection.add(car);
    res.status(201).json({ message: 'Car added successfully', id: docRef.id });
  } catch (error) {
    console.error('Error adding car:', error.message);
    res.status(500).json({ error: 'Error adding car: ' + error.message });
  }
});

// GET: Export cars to CSV
app.get('/export', async (req, res) => {
  try {
    const snapshot = await carsCollection.get();
    const cars = snapshot.docs.map((doc) => doc.data());
    const parser = new Parser();
    const csv = parser.parse(cars);

    fs.writeFileSync('cars.csv', csv);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=cars.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting cars:', error.message);
    res.status(500).json({ error: 'Error exporting cars: ' + error.message });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Car Management API!' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
