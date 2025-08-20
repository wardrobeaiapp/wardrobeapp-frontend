import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FetchImageRequest {
  imageUrl: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse the request body
    const { imageUrl }: FetchImageRequest = await req.json()

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[fetch-image-proxy] Fetching image from:', imageUrl)

    // Fetch the image from the external URL
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      console.error('[fetch-image-proxy] Failed to fetch image:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch image: ${response.status} ${response.statusText}` 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the image as array buffer
    const imageBuffer = await response.arrayBuffer()
    
    // Determine content type from URL if header is missing or incorrect
    let contentType = response.headers.get('content-type')
    let fileExt = 'jpg'
    
    // Extract file extension from URL first
    const urlMatch = imageUrl.match(/\.([a-z]{3,4})(?:\?|$)/i)
    if (urlMatch) {
      fileExt = urlMatch[1].toLowerCase()
    }
    
    // Set proper content type based on file extension
    switch (fileExt) {
      case 'png':
        contentType = 'image/png'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        fileExt = 'jpg'
        break
      default:
        contentType = 'image/jpeg'
        fileExt = 'jpg'
    }
    
    console.log('[fetch-image-proxy] Successfully fetched image:', {
      size: imageBuffer.byteLength,
      contentType,
      fileExt,
      originalUrl: imageUrl
    })

    // Return the image data and metadata
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          imageData: Array.from(new Uint8Array(imageBuffer)), // Convert to array for JSON
          contentType,
          fileExt,
          size: imageBuffer.byteLength
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[fetch-image-proxy] Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
