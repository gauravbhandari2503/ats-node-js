const express = require('express');
const router = express.Router();
const jobController = require('./../controller/jobController');
const authController = require('./../controller/authController');
const factory = require('./../controller/handlerFactory');

router.use(authController.protect);

router.route('/')
    .get(jobController.getAllJobRoles)
    .post(factory.actionPerformed('create'), jobController.createJobRole);

router.route('/job-openings')
    .get(jobController.getAllJobOpenings)
    .post(factory.actionPerformed('create'), jobController.createJobOpening);

router.route('/job-openings/:id')
    .put(factory.actionPerformed('update'), jobController.updateJobOpening)
    .get(jobController.getJobOpening)
    .delete(factory.actionPerformed('delete'), jobController.deleteJobOpening);

router.route('/job-openings/:id/archived')
    .put(factory.actionPerformed('update'), jobController.archiveJobOpening);

router.route('/:id')
    .put(factory.actionPerformed('update'), jobController.updateJobRole)
    .delete(factory.actionPerformed('delete'), jobController.deleteJobRole)
    .get(jobController.getJobRole);

module.exports = router;