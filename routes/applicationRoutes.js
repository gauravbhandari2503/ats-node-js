const express = require('express');
const router = express.Router();
const applicationController = require('./../controller/applicationController');
const authController = require('./../controller/authController');
const factory = require('./../controller/handlerFactory');

router.use(authController.protect);

router.route('/')
    .get(applicationController.getAllApplications);

router.route('/assignee')
    .patch(applicationController.changeAssignee);

router.route('/update-application-results')
    .patch(applicationController.updateApplicationResults);
 
router.route('/:id/resume')
    .get(applicationController.getApplicationResume);

router.route('/:id/stage/')
    .patch(factory.actionPerformed('update'), applicationController.changeApplicationStage);

router.route('/status/')
    .patch(factory.actionPerformed('update'), applicationController.changeApplicationStatus);

module.exports = router;