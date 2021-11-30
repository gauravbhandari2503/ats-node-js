const express = require('express');
const router = express.Router();
const authController = require('./../controller/authController');
const interviewController = require('./../controller/interviewController');
const factory = require('./../controller/handlerFactory');

router.route('/')
    .post(authController.protect, interviewController.scheduleInterview);

module.exports = router;