const express = require('express');
const router = express.Router();
const applicationController = require('./../controller/applicationController');
const authController = require('./../controller/authController');

router.use(authController.protect);

router.route('/')
    .get(applicationController.getAllApplications);

router.route('/:id/stage/')
    .patch(applicationController.actionPerformed('update'), applicationController.changeApplicationStage);

router.route('/status/')
    .patch(applicationController.actionPerformed('update'), applicationController.changeApplicationStatus);

module.exports = router;