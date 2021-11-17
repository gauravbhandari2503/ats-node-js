const express = require('express');
const router = express.Router();
const authController = require('./../controller/authController');
const applicationSourceController = require('./../controller/applicationSourceController');

router.use(authController.protect);

router.route('/')
    .get(applicationSourceController.getAllSources)
    .post(applicationSourceController.actionPerformed('create'), applicationSourceController.createSource);

router.route('/:id')
    .put(applicationSourceController.actionPerformed('update'), applicationSourceController.updateSource)
    .delete(applicationSourceController.actionPerformed('delete'), applicationSourceController.deleteSource);
    
module.exports = router;