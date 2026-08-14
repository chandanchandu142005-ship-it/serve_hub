/* ==================================================================
   SERVEHUB AI CONTROLLER
   Handles AI Image Vision Analysis and natural language chat requests.
   ================================================================== */
const aiVisionService = require('../services/aiVisionService');

/**
 * POST /api/ai/analyze-image
 */
async function analyzeImage(req, res) {
  try {
    const { imageBase64, mimeType } = req.body || {};

    console.log('\n--------------------------------------------------');
    console.log('[Backend Server Log] Received POST /api/ai/analyze-image');
    console.log(`[Backend Server Log] Payload Received: mimeType=${mimeType || 'unknown'}, base64Length=${imageBase64 ? imageBase64.length : 0}`);

    if (!imageBase64) {
      console.log('[Backend Server Log] Error: Missing imageBase64 payload');
      return res.status(400).json({
        success: false,
        error: 'Image data is required. Please select or capture an image.',
      });
    }

    const result = await aiVisionService.analyzeImagePayload({ imageBase64, mimeType });
    
    console.log('[Backend Server Log] AI Vision Processing Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('--------------------------------------------------\n');

    if (result.error && result.code === 'IMAGE_TOO_LARGE') {
      return res.status(400).json(result);
    }

    if (result.error) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error('[aiController.analyzeImage Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze image. Please try again or describe your issue in text.',
    });
  }
}

module.exports = {
  analyzeImage,
};
