const mongoose = require('mongoose');
const validator = require('validator');

const applicationSourceSchema = new mongoose.Schema({
    sourceName: {
        type: String,
        required: [true, 'Application Source is a required field']
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


const ApplicationSource = mongoose.model('ApplicationSource', applicationSourceSchema);

module.exports = ApplicationSource;