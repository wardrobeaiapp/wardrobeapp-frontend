# Server Payload Limits Configuration Guide

## Overview

This document provides instructions for configuring server-side payload limits to accommodate larger image uploads for the wardrobe app's AI analysis feature. While our frontend implements aggressive image compression, properly configured server limits are essential for optimal performance.

## Current Issue

The Claude API integration sometimes fails with `413 Payload Too Large` errors when uploading high-resolution images. Our frontend compression implementation reduces most images to an acceptable size, but some server configurations may still reject larger payloads.

## Configuration Options

### Express.js Server

If using Express.js, update your server configuration:

```javascript
// In your server.js or app.js file
const express = require('express');
const app = express();

// Increase JSON payload limit to 10MB (adjust as needed)
app.use(express.json({ limit: '10mb' }));

// Increase URL-encoded payload limit
app.use(express.urlencoded({ limit: '10mb', extended: true }));
```

### Nginx Reverse Proxy

If using Nginx as a reverse proxy, update your configuration:

```nginx
http {
  # Increase client body size limit to 10MB
  client_max_body_size 10m;
  
  # Other configuration settings...
}
```

### Node.js with Axios

If your backend uses Axios to call external APIs, add maxBodyLength and maxContentLength parameters:

```javascript
axios.post('https://api.example.com/endpoint', data, {
  maxContentLength: 10 * 1024 * 1024, // 10MB
  maxBodyLength: 10 * 1024 * 1024 // 10MB
});
```

### Supabase Edge Functions

If using Supabase Edge Functions, update your `supabase/functions/analyze-wardrobe-item/index.ts` file:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Increase request size limit here by using custom reader
    const bodyText = await req.text();
    const data = JSON.parse(bodyText);
    
    // Your logic here...
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

## Recommended Settings

For the wardrobe app's AI analysis feature, we recommend:

1. Frontend compression: Already implemented to reduce most images to under 1MB
2. Server payload limit: Set to at least 5MB to accommodate occasional larger images
3. API timeout: Increase to 60 seconds for larger image processing operations

## Monitoring

After updating payload limits, monitor:

1. Server logs for any remaining 413 errors
2. Memory usage on your server (increased limits require more RAM)
3. Performance metrics for any degradation due to larger payloads

## Security Considerations

Increasing payload limits may expose your server to potential denial-of-service attacks. Consider implementing additional security measures:

1. Rate limiting for image upload endpoints
2. Authentication for all API endpoints
3. Request validation to reject obviously invalid images before processing
