const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const createMulterConfig = () => {
  return multer({
    storage: multer.diskStorage({
      destination: uploadDir,
      filename: (req, file, cb) => {
        const uniqueName = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname) || '.jpg'}`;
        cb(null, uniqueName);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
};

/**
 * Process image from request (either file upload or base64)
 * @param {Object} req - Express request object
 * @returns {Promise<string|null>} - Image URL or null
 */
const processImageFromRequest = async (req) => {
  let imageUrl = null;
  
  console.log('Checking for image in request...');
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Request body imageUrl type:', typeof req.body.imageUrl);
  console.log('Request body imageUrl starts with data:image?', req.body.imageUrl && req.body.imageUrl.startsWith('data:image'));
  
  // Check if we have a file from multer
  if (req.file) {
    console.log('Found file from multer:', req.file.filename);
    // Use absolute URL with hostname for client compatibility
    const host = req.get('host');
    const protocol = req.protocol;
    imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    console.log('Image saved to:', imageUrl);
  } 
  // Check if we have a base64 image in the request body
  else if (req.body.imageUrl && req.body.imageUrl.startsWith('data:image')) {
    console.log('Found base64 image in request body');
    imageUrl = await processBase64Image(req.body.imageUrl, req);
  } else {
    console.log('No image received in request');
  }
  
  return imageUrl;
};

/**
 * Process base64 image data and save to file
 * @param {string} base64Data - Base64 image data
 * @param {Object} req - Express request object
 * @returns {Promise<string|null>} - Image URL or null
 */
const processBase64Image = async (base64Data, req) => {
  try {
    // Extract the base64 data and file type
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      console.log('Invalid base64 image format');
      return null;
    }

    // Extract content type and base64 data
    const contentType = matches[1];
    const base64Content = matches[2];
    console.log('Image content type:', contentType);
    console.log('Base64 data length:', base64Content.length);
    
    const buffer = Buffer.from(base64Content, 'base64');
    
    // Generate a unique filename
    const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}.${contentType.split('/')[1] || 'jpg'}`;
    const filepath = path.join(uploadDir, filename);
    console.log('Saving image to path:', filepath);
    
    // Check if directory exists and is writable
    try {
      console.log('Upload directory exists:', fs.existsSync(uploadDir));
      console.log('Upload directory writable:', fs.accessSync(uploadDir, fs.constants.W_OK) === undefined);
    } catch (err) {
      console.error('Directory access error:', err);
    }
    
    // Save the file
    try {
      fs.writeFileSync(filepath, buffer);
      console.log('File saved successfully to:', filepath);
      console.log('File exists after save:', fs.existsSync(filepath));
      console.log('File size:', fs.statSync(filepath).size, 'bytes');
    } catch (saveErr) {
      console.error('Error saving file:', saveErr);
      throw saveErr;
    }
    
    // Set the image URL - use absolute URL with hostname for client compatibility
    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${filename}`;
    console.log('Base64 image saved to:', imageUrl);
    
    return imageUrl;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    console.error('Error details:', error.message);
    return null;
  }
};

/**
 * Download external image and store locally
 * @param {string} imageUrl - External image URL
 * @param {Object} req - Express request object
 * @returns {Promise<string>} - Local image URL
 */
const downloadExternalImage = async (imageUrl, req) => {
  const fetch = require('node-fetch');
  
  console.log('[Server] Downloading image from URL:', imageUrl);
  
  // Download the image from external URL
  const response = await fetch(imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }
  
  // Get the image buffer
  const imageBuffer = await response.buffer();
  
  // Determine file extension from content type or URL
  let fileExt = 'jpg'; // default
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('image/png')) fileExt = 'png';
  else if (contentType?.includes('image/gif')) fileExt = 'gif';
  else if (contentType?.includes('image/webp')) fileExt = 'webp';
  else if (contentType?.includes('image/jpeg')) fileExt = 'jpg';
  else {
    // Try to extract from URL
    const urlExt = imageUrl.split('.').pop()?.split('?')[0]?.toLowerCase();
    if (urlExt && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(urlExt)) {
      fileExt = urlExt === 'jpeg' ? 'jpg' : urlExt;
    }
  }
  
  // Generate unique filename
  const uniqueName = `downloaded-${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
  const filePath = path.join(uploadDir, uniqueName);
  
  // Save the image to disk
  fs.writeFileSync(filePath, imageBuffer);
  
  // Return the relative URL path for the stored image
  const imageUrlPath = `/uploads/${uniqueName}`;
  
  console.log('[Server] Image downloaded and saved successfully:', imageUrlPath);
  
  return imageUrlPath;
};

module.exports = {
  createMulterConfig,
  processImageFromRequest,
  processBase64Image,
  downloadExternalImage,
  uploadDir
};
