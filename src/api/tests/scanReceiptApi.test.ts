// Create a file called test-receipt.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Path to a real receipt image on your computer
// get current path
const currentPath = path.resolve();
const imagePath = `./src/api/tests/IMG_1461.png`; // CHANGE THIS TO YOUR ACTUAL IMAGE PATH

// Read the image and convert to base64
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = `${imageBuffer.toString('base64')}`;

// Test the API
async function testScanReceipt() {
  try {
    const response = await axios.post('http://localhost:3000/scan-receipt', {
      image: base64Image
    });
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testScanReceipt();