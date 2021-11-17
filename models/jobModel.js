const mongoose = require('mongoose');
const validator = require('validator');

const jobsSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique: true
    },
    active: {
        type: Boolean,
        default: true,
        select: false
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

const Job = mongoose.model('Job', jobsSchema);

module.exports = Job;