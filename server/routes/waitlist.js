const express = require('express');
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

    // TODO: Replace with actual database operation
    // For now, we'll just log the email and simulate success
    console.log(`📧 New waitlist signup: ${email}`);
    
    // Simulate database operation
    await new Promise(resolve => setTimeout(resolve, 200));

    // TODO: Add actual database logic here
    // Example:
    // const existingEmail = await supabase
    //   .from('waitlist')
    //   .select('email')
    //   .eq('email', email)
    //   .single();
    
    // if (existingEmail.data) {
    //   return res.status(409).json({
    //     success: false,
    //     message: 'This email is already on the waitlist'
    //   });
    // }

    // const { data, error } = await supabase
    //   .from('waitlist')
    //   .insert([
    //     { 
    //       email: email.toLowerCase(),
    //       signed_up_at: new Date().toISOString(),
    //       source: 'demo_page'
    //     }
    //   ]);

    // if (error) {
    //   console.error('Waitlist signup error:', error);
    //   return res.status(500).json({
    //     success: false,
    //     message: 'Failed to add email to waitlist'
    //   });
    // }

    // TODO: Send confirmation email
    // Example:
    // await sendWelcomeEmail(email);

    // Success response
    res.json({
      success: true,
      message: 'Successfully added to waitlist!',
      data: {
        email: email.toLowerCase(),
        position: Math.floor(Math.random() * 1000) + 1, // Simulated position
        estimated_launch: 'Q2 2025' // Simulated launch timeline
      }
    });

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
    // TODO: Replace with actual database queries
    // For now, return simulated stats
    
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
