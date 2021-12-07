const mongoose = require('mongoose');
const validator = require('validator');

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: [true, 'Stage Name is a required field'],
        maxLength: [200, 'Comment should not exceed 200 characters!!']
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    // Parent Referencing - Referring to Applicant Model
    applicant:
    {
        type: mongoose.Schema.ObjectId,
        ref: 'Applicant',
        required: [true, 'Comment must belong to a user']
    },
    createdAt: {
        type: Date,
        default: Date.now(),   
    }
}, {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
})

commentSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'createdBy',
        select: '-__v -createdBy -role -location -archived'
    });
    next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;