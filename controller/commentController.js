const Comment = require('./../models/commentModel');
const AppError = require('./../utils/appError');
const factory = require('./handleFactory');

exports.setCommentUserId = (req, res, next) => {
    // Allow nested routes
    if (!req.body.applicant) req.body.applicant = req.params.applicantId;
    if (!req.body.createdBy) req.body.createdBy = req.user.id ;
    next();
};

exports.createComment = factory.createOne(Comment);
exports.getAllComments = factory.getAll(Comment);
exports.deleteComment = factory.deleteOne(Comment);
exports.editComment = factory.updateOne(Comment); 