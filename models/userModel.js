const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'A User must have an email'],
        lowercase: true,
        validate:[validator.isEmail, 'Please provide a valid email']
    },
    image: {
        type: String
    },
    contact : {
        type: Number
    },
    role: {
        type: String,
        enum: ['admin', 'recruiter', 'lead-gen', 'interviewer'],
        required: [true, 'A User must have a role']
    },
    location : {
        type: String,
        enum: ['HDR', 'DDN'],
        default: 'HDR'
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    archived: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean, 
        default: false,
        select: false // it will never show this field while sending the response
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now(),   
    },
    updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    updatedAt: {
        type: Date
    },
    deletedBy : {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    deletedAt : {
        type: Date
    }
}, {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
})

userSchema.pre(/^find/, function(next) {
    // this will point to query
    this.populate({
        path: 'createdBy',
        select: 'email location name role'
    }).populate({
        path: 'updatedBy',
        select: 'email name role'
    })

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;