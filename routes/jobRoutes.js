const express = require('express');
const router = express.Router();
const jobController = require('./../controller/jobController');
const authController = require('./../controller/authController');

router.use(authController.protect);

router.route('/')
    .get(jobController.getAllJobRoles)
    .post(jobController.actionPerformed('create'), jobController.createJobRole);

router.route('/job-openings')
    .get(jobController.getAllJobOpenings)
    .post(jobController.actionPerformed('create'), jobController.createJobOpening);

router.route('/job-openings/:id')
    .put(jobController.actionPerformed('update'), jobController.updateJobOpening)
    .get(jobController.getJobOpening)
    .delete(jobController.actionPerformed('delete'), jobController.deleteJobOpening);

router.route('/job-openings/:id/archived')
    .put(jobController.actionPerformed('update'), jobController.archiveJobOpening);

router.route('/:id')
    .put(jobController.actionPerformed('update'), jobController.updateJobRole)
    .delete(jobController.actionPerformed('delete'), jobController.deleteJobRole)
    .get(jobController.getJobRole);

module.exports = router;