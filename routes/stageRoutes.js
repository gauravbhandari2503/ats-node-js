const express = require('express');
const router = express.Router();
const authController = require('./../controller/authController');
const stageController = require('./../controller/stageController');

router.route('/')
    .get(authController.protect, stageController.getAllStages)
    .post(authController.protect, stageController.createStage);

module.exports = router;