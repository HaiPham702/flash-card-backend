const express = require('express');
const axios = require('axios');
const router = express.Router();

// N8N webhook endpoint
const N8N_WEBHOOK_URL = 'https://n8n-s2gy.onrender.com/healthz';

/**
 * GET /api/n8n/health
 * Kiểm tra trạng thái của n8n webhook
 */
router.get('/health', async (req, res) => {
  try {
    console.log('Calling n8n webhook:', N8N_WEBHOOK_URL);
    
    const response = await axios.get(N8N_WEBHOOK_URL, {
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlashCard-Server/1.0.0'
      }
    });

    console.log('n8n webhook response:', response.data);
    
    res.json({
      success: true,
      message: 'n8n webhook call successful',
      data: response.data,
      status: response.status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calling n8n webhook:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to call n8n webhook',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/n8n/webhook
 * Gửi dữ liệu đến n8n webhook (nếu cần)
 */
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log('Sending data to n8n webhook:', payload);
    
    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlashCard-Server/1.0.0'
      }
    });

    console.log('n8n webhook response:', response.data);
    
    res.json({
      success: true,
      message: 'Data sent to n8n webhook successfully',
      data: response.data,
      status: response.status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending data to n8n webhook:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send data to n8n webhook',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
