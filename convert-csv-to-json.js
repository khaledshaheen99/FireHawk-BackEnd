const csv = require('csvtojson');
const fs = require('fs');

const inputFile = './Automobile.csv';
const outputFile = './automobile-dataset.json';

csv()
  .fromFile(inputFile)
  .then((jsonObj) => {
    fs.writeFileSync(outputFile, JSON.stringify(jsonObj, null, 2), 'utf-8');
    console.log(`Converted JSON saved to ${outputFile}`);
  })
  .catch((error) => {
    console.error('Error converting CSV to JSON:', error);
  });
