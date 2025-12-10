// Using native fetch instead of axios to avoid dependency issues

/**
 * Netlify Function for Waitlist API
 * Handles POST /api/waitlist requests
 */
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-auth-token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      })
    };
  }

  try {
    const { email } = JSON.parse(event.body);

    // Validate email
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email is required'
        })
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Please provide a valid email address'
        })
      };
    }

    console.log(`📧 New waitlist signup: ${email}`);

    // Email Octopus API configuration from environment variables
    const EMAIL_OCTOPUS_API_KEY = process.env.EMAIL_OCTOPUS_API_KEY;
    const EMAIL_OCTOPUS_LIST_ID = process.env.EMAIL_OCTOPUS_LIST_ID;

    if (!EMAIL_OCTOPUS_API_KEY) {
      console.error('EMAIL_OCTOPUS_API_KEY not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email service not configured'
        })
      };
    }

    if (!EMAIL_OCTOPUS_LIST_ID) {
      console.error('EMAIL_OCTOPUS_LIST_ID not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email list not configured'
        })
      };
    }

    // Add subscriber to Email Octopus list
    try {
      const requestUrl = `https://emailoctopus.com/api/1.6/lists/${EMAIL_OCTOPUS_LIST_ID}/contacts?api_key=${EMAIL_OCTOPUS_API_KEY}`;
      const requestData = {
        email_address: email.toLowerCase()
      };
      
      const emailOctopusResponse = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const responseData = await emailOctopusResponse.json();
      
      // Check if the request was successful
      if (!emailOctopusResponse.ok) {
        if (responseData.error?.code === 'MEMBER_EXISTS_WITH_EMAIL_ADDRESS') {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'This email is already on the waitlist'
            })
          };
        }
        throw new Error(responseData.error?.message || `HTTP ${emailOctopusResponse.status}`);
      }
      
      console.log('✅ Email Octopus subscriber added:', responseData.email_address);

      // Success response
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Successfully added to waitlist!',
          data: {
            email: email.toLowerCase(),
            subscriber_id: responseData.id,
            status: responseData.status,
            estimated_launch: 'Q2 2025'
          }
        })
      };

    } catch (emailOctopusError) {
      console.error('Email Octopus API error:', emailOctopusError.message);
      
      // Handle other API errors
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Failed to add email to waitlist. Please try again.'
        })
      };
    }

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      })
    };
  }
};
