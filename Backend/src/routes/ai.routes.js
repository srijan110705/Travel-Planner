// Backend/src/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { verifyUser } = require('../middlewares/auth.middleware');

// We use verifyUser so only logged-in users can burn your API quota!
router.post('/generate', aiController.generateTravelAdvice);

module.exports = router;