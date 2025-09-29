const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.post('/signup', dataController.signup);
router.get('/users', dataController.getUsers);
router.post('/send-email', dataController.sendEmail);
router.post('/auth/google', dataController.googleAuth);

module.exports = router;