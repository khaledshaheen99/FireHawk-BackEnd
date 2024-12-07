const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('./service-account-key.json');

const firestore = new Firestore({
  keyFilename: './service-account-key.json',
});

const carsCollection = firestore.collection('cars');

const importData = async () => {
  try {
    const cars = require('./automobile-dataset.json');
    const batch = firestore.batch();

    cars.forEach((car) => {
      const docRef = carsCollection.doc();
      batch.set(docRef, car);
    });

    await batch.commit();
    console.log('Data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

importData();
