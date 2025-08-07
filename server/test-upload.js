const fs = require('fs');
const path = require('path');

// Define the uploads directory
const uploadDir = path.join(__dirname, 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
} else {
  console.log('Uploads directory exists:', uploadDir);
}

// Create a sample base64 image (a small red dot)
const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

// Extract the base64 data
const matches = sampleBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

if (!matches || matches.length !== 3) {
  console.error('Invalid base64 image format');
  process.exit(1);
}

// Extract content type and base64 data
const contentType = matches[1];
const base64Data = matches[2];
console.log('Image content type:', contentType);
console.log('Base64 data length:', base64Data.length);

// Create buffer from base64
const buffer = Buffer.from(base64Data, 'base64');

// Generate a unique filename
const filename = `test-image-${Date.now()}.${contentType.split('/')[1] || 'png'}`;
const filepath = path.join(uploadDir, filename);

console.log('Saving test image to:', filepath);

try {
  // Save the file
  fs.writeFileSync(filepath, buffer);
  console.log('Test file saved successfully');
  console.log('File exists after save:', fs.existsSync(filepath));
  console.log('File size:', fs.statSync(filepath).size, 'bytes');
  console.log('Image URL would be:', `/uploads/${filename}`);
  console.log('Full URL would be:', `http://localhost:5000/uploads/${filename}`);
} catch (error) {
  console.error('Error saving file:', error);
}
