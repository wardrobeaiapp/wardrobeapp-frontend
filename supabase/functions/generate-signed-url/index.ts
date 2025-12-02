// @ts-ignore - This is a Deno runtime import
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore - This is a Deno runtime import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Deno runtime type declaration for Edge Functions
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client for auth verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    const body = await req.json();
    const filePath = body.filePath as string;
    const expiresIn = body.expiresIn || 3600;
    
    if (typeof filePath !== 'string') {
      return new Response(
        JSON.stringify({ error: 'File path is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // 2. Validate file ownership - user can only access their own files
    if (!filePath.startsWith(`${user.id}/`)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - file not owned by user' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        }
      );
    }

    // 3. Create service role client for storage operations
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate a signed URL for the wardrobe-images bucket
    const { data, error } = await serviceClient.storage
      .from('wardrobe-images')
      .createSignedUrl(filePath, expiresIn)

    console.log(`Generated signed URL for user ${user.id}, file: ${filePath}, expires in: ${expiresIn}s`);

    if (error) throw error

    return new Response(
      JSON.stringify({ signedUrl: data.signedUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
