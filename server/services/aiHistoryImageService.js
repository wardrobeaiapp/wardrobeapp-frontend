const { createClient } = require('@supabase/supabase-js');
const FormData = require('form-data');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anBxZWN3ZGZ0YndrY253aXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTU0NDksImV4cCI6MjA2ODA5MTQ0OX0.1_ViFuaH4PAiTk_QkSm7S9srp1rQa_Zv7D2a8pJx5So';

/**
 * Upload AI history image to Supabase Storage
 * @param {string} base64Data - Base64 image data
 * @param {string} mediaType - Image media type (e.g., 'image/jpeg')
 * @param {string} userId - User ID for file path organization
 * @param {string} token - User auth token
 * @returns {Promise<Object>} - Upload result with filePath and signedUrl
 */
const uploadAIHistoryImage = async (base64Data, mediaType, userId, token) => {
  try {
    console.log('📤 Uploading AI history image to Supabase Storage...');
    
    // Convert base64 to buffer
    const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const buffer = Buffer.from(base64String, 'base64');
    
    // Create form data for upload
    const formData = new FormData();
    const fileName = `ai-history-${Date.now()}.jpg`;
    formData.append('file', buffer, {
      filename: fileName,
      contentType: mediaType
    });
    
    // Call Supabase Edge Function
    const functionUrl = `${supabaseUrl}/functions/v1/upload-ai-history-image`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Upload failed:', errorData);
      throw new Error(`Upload failed: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ AI history image uploaded successfully:', result.filePath);
    
    return {
      filePath: result.filePath,
      signedUrl: result.signedUrl,
      publicUrl: result.publicUrl
    };
    
  } catch (error) {
    console.error('❌ Error uploading AI history image:', error);
    throw error;
  }
};

module.exports = {
  uploadAIHistoryImage
};
