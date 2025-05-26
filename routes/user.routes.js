const express = require('express');
const router = express.Router();
const { createUser, signIn } = require('../controllers/user.controller');

router.post('/signup', createUser);
router.post('/signin', signIn)
module.exports = router;
