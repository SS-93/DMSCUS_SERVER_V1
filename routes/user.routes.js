const express = require('express');
const router = express.Router();
const { createUser, signIn, getMe } = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/signup', createUser);
router.post('/signin', signIn);
router.post('/login', signIn); // Add login route for frontend compatibility
router.get('/me', authenticateToken, getMe); // Add /me endpoint for AuthContext

module.exports = router;
