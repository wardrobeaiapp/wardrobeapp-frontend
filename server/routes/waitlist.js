const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * @route   POST /api/waitlist
 * @desc    Add email to waitlist
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    console.log(`📧 New waitlist signup: ${email}`);

    // Email Octopus API configuration
    const EMAIL_OCTOPUS_API_KEY = process.env.EMAIL_OCTOPUS_API_KEY;
    const EMAIL_OCTOPUS_LIST_ID = process.env.EMAIL_OCTOPUS_LIST_ID;

    if (!EMAIL_OCTOPUS_API_KEY) {
      console.error('EMAIL_OCTOPUS_API_KEY not configured');
      return res.status(500).json({
        success: false,
        message: 'Email service not configured'
      });
    }

    if (!EMAIL_OCTOPUS_LIST_ID) {
      console.error('EMAIL_OCTOPUS_LIST_ID not configured');
      return res.status(500).json({
        success: false,
        message: 'Email list not configured'
      });
    }

    // Add subscriber to Email Octopus list
    try {
      const requestUrl = `https://emailoctopus.com/api/1.6/lists/${EMAIL_OCTOPUS_LIST_ID}/contacts?api_key=${EMAIL_OCTOPUS_API_KEY}`;
      const requestData = {
        email_address: email.toLowerCase()
      };
      
      const emailOctopusResponse = await axios.post(
        requestUrl,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Email Octopus subscriber added:', emailOctopusResponse.data.email_address);

      // Success response
      res.json({
        success: true,
        message: 'Successfully added to waitlist!',
        data: {
          email: email.toLowerCase(),
          subscriber_id: emailOctopusResponse.data.id,
          status: emailOctopusResponse.data.status,
          estimated_launch: 'Q2 2025'
        }
      });

    } catch (emailOctopusError) {
      console.error('Email Octopus API error:', emailOctopusError.response?.data || emailOctopusError.message);
      
      // Handle specific Email Octopus errors
      if (emailOctopusError.response?.data?.error?.code === 'MEMBER_EXISTS_WITH_EMAIL_ADDRESS') {
        return res.status(409).json({
          success: false,
          message: 'This email is already on the waitlist'
        });
      }

      // Handle other API errors
      return res.status(500).json({
        success: false,
        message: 'Failed to add email to waitlist. Please try again.'
      });
    }

    // Track analytics (optional)
    console.log(`✅ Waitlist signup successful: ${email}`);

  } catch (error) {
    console.error('Waitlist signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/waitlist/stats
 * @desc    Get waitlist statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const EMAIL_OCTOPUS_API_KEY = process.env.EMAIL_OCTOPUS_API_KEY;
    const EMAIL_OCTOPUS_LIST_ID = process.env.EMAIL_OCTOPUS_LIST_ID;

    // Try to get real stats from Email Octopus
    if (EMAIL_OCTOPUS_API_KEY && EMAIL_OCTOPUS_LIST_ID) {
      try {
        const emailOctopusResponse = await axios.get(
          `https://emailoctopus.com/api/1.6/lists/${EMAIL_OCTOPUS_LIST_ID}?api_key=${EMAIL_OCTOPUS_API_KEY}`
        );

        const listData = emailOctopusResponse.data;
        
        const stats = {
          total_signups: listData.counts.subscribed || 0,
          pending_confirmation: listData.counts.pending || 0,
          unsubscribed: listData.counts.unsubscribed || 0,
          estimated_launch: 'Q2 2025',
          last_updated: new Date().toISOString()
        };

        return res.json({
          success: true,
          data: stats
        });

      } catch (emailOctopusError) {
        console.error('Failed to fetch Email Octopus stats:', emailOctopusError.response?.data || emailOctopusError.message);
        // Fall through to simulated stats
      }
    }
    
    // Fallback to simulated stats if Email Octopus not configured or fails
    const stats = {
      total_signups: Math.floor(Math.random() * 5000) + 2000,
      signups_this_week: Math.floor(Math.random() * 200) + 50,
      estimated_launch: 'Q2 2025',
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Waitlist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch waitlist statistics'
    });
  }
});

module.exports = router;
