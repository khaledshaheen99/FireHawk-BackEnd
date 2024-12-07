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

// Firestore setup
const firestore = new Firestore({
  keyFilename: './service-account-key.json',
});

const carsCollection = firestore.collection('cars');

// GET: Fetch all cars with optional filters
app.get('/cars', async (req, res) => {
  try {
    const snapshot = await carsCollection.get();
    const cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).send('Error fetching cars: ' + error.message);
  }
});

// POST: Add a new car
app.post('/cars', async (req, res) => {
  try {
    const car = req.body;
    await carsCollection.add(car);
    res.status(201).send('Car added successfully');
  } catch (error) {
    res.status(500).send('Error adding car: ' + error.message);
  }
});

// GET: Export cars to CSV
app.get('/export', async (req, res) => {
  try {
    const snapshot = await carsCollection.get();
    const cars = snapshot.docs.map(doc => doc.data());
    const parser = new Parser();
    const csv = parser.parse(cars);

    fs.writeFileSync('cars.csv', csv);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=cars.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).send('Error exporting cars: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
