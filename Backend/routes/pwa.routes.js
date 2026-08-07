const express = require('express');
const router = express.Router();
const PWAInstallation = require('../models/PWAInstallation.model');

// Record PWA installation
router.post('/install', async (req, res) => {
  try {
    const { email, device, platform, timestamp } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user already has an installation record
    const existingInstallation = await PWAInstallation.findOne({ email });

    if (existingInstallation) {
      return res.status(200).json({
        success: true,
        message: 'Installation already recorded',
        data: existingInstallation
      });
    }

    // Create new installation record
    const installation = new PWAInstallation({
      email,
      device: device || null,
      platform: platform || null,
      timestamp: timestamp || new Date(),
      userAgent: req.headers['user-agent'] || null
    });

    await installation.save();

    res.status(201).json({
      success: true,
      message: 'Installation recorded successfully',
      data: installation
    });
  } catch (error) {
    console.error('Error recording PWA installation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record installation',
      error: error.message
    });
  }
});

// Get installation stats (admin endpoint)
router.get('/stats', async (req, res) => {
  try {
    const totalInstallations = await PWAInstallation.countDocuments();
    const installations = await PWAInstallation.find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: {
        total: totalInstallations,
        recent: installations
      }
    });
  } catch (error) {
    console.error('Error fetching PWA stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

module.exports = router;
