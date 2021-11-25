const express = require('express');
const router = express.Router();
const authController = require('./../controller/authController');
const applicationSourceController = require('./../controller/applicationSourceController');
const factory = require('./../controller/handlerFactory');

router.use(authController.protect);

router.route('/')
    .get(applicationSourceController.getAllSources)
    .post(factory.actionPerformed('create'), applicationSourceController.createSource);

router.route('/:id')
    .put(factory.actionPerformed('update'), applicationSourceController.updateSource)
    .delete(factory.actionPerformed('delete'), applicationSourceController.deleteSource);
    
module.exports = router;