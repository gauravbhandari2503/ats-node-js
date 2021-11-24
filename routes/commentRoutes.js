const express = require('express');
const router = express.Router( {
    mergeParams: true               // Provides access to id's of other router
});
const authController = require('./../controller/authController');
const commentController = require('./../controller/commentController');

router.use(authController.protect);

router.route('/')
    .get(commentController.getAllComments)
    .post(commentController.setCommentUserId, commentController.createComment);

router.route('/:id')
    .delete(commentController.deleteComment)
    .patch(commentController.editComment);

module.exports = router;
