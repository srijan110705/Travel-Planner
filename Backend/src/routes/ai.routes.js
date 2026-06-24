// Backend/src/routes/ai.routes.js
/*const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { verifyUser } = require('../middlewares/auth.middleware');

// We use verifyUser so only logged-in users can burn your API quota!
router.post('/generate', verifyUser, aiController.generateTravelAdvice);

module.exports = router;*/
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { verifyUser } = require('../middlewares/auth.middleware');

// Route 1: The Heavy Lifter (Generates and saves the full itinerary)
router.post('/generate', verifyUser, aiController.generateTravelAdvice);

// Route 2: The Idea Generator (Just gives suggestions, DOES NOT save to DB)
router.post('/suggest', verifyUser, aiController.suggestAlternatives);

// Route 3: The Optimizer (Sorts your database list geographically)
router.post('/optimize_route', verifyUser, aiController.getOptimalRoute);

module.exports = router;