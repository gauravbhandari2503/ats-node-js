const express = require('express');
const router = express.Router();
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

router.route('/')
    .get(authController.protect, userController.getAllUsers)
    .post(authController.protect, userController.createUser);

router.route('/assignees')
    .get(authController.protect, userController.getAssignees);

router.route('/archived')
    .get(authController.protect, userController.getlAllArchiveUsers)

router.route('/:id')
    .put(authController.protect, userController.updateUser)
    .delete(authController.protect, userController.deleteUser)
    .get(authController.protect, userController.getUser);

router.route('/:id/archived')
    .put(authController.protect, userController.archiveUser);

module.exports = router;