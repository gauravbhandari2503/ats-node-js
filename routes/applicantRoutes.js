const express = require('express');
const router = express.Router();
const applicantController = require('./../controller/applicantController');
const authController = require('./../controller/authController');

router.use(authController.protect);

router.route('/')
    .get(applicantController.getApplicant)
    .post(applicantController.uploadApplicantResume, applicantController.actionPerformed('create'), applicantController.createApplicant);

router.route('/:id/blacklist')
    .put(applicantController.blacklistApplicant);

// router.route('/:id/blacklist')
//     .put(applicantController.whitelistCandidate);

router.route('/:id')
    .get(applicantController.updateApplicant);

module.exports = router;