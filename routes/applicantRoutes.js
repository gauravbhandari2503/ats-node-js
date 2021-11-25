const express = require('express');
const router = express.Router();
const applicantController = require('./../controller/applicantController');
const authController = require('./../controller/authController');
const commentRouter = require('./../routes/commentRoutes');
const factory = require('./../controller/handlerFactory');

// Nested routes with seprate routing file.
router.use('/:applicantId/comments', commentRouter);

router.use(authController.protect);

router.route('/')
    .get(applicantController.getApplicant)
    .post(applicantController.uploadApplicantResume, factory.actionPerformed('create'), applicantController.createApplicant);

router.get('/blacklist', applicantController.getAllBlacklistedApplicants)

router.route('/:id/blacklist')
    .put(applicantController.blacklistApplicant);

router.route('/:id/whitelist')
    .put(applicantController.whitelistApplicant);

router.route('/:id')
    .get(applicantController.updateApplicant);

module.exports = router;