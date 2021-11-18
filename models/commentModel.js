const mongoose = require('mongoose');
const validator = require('validator');

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: [true, 'Stage Name is a required field']
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    // Parent Referencing - Referring to Applicant Model
    applicant: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Comment must belong to a user']
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now(),   
    }
}, {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
})


const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;