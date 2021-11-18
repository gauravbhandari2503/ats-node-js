const mongoose = require('mongoose');
const validator = require('validator');

const applicationSchema = new mongoose.Schema({
    currentSalary: {
        type: String,
        maxLength: [100, 'Current Salary must not exceed 100 characters']
    },
    expectedSalary: {
        type: String,
        maxLength: [100, 'Expected Salary must not exceed 100 characters']
    },
    applicant: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Application must belong to a user']
        }
    ],
    job: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
    },
    jobLocation: {
        type: String,
        enum: {
            values: ['HDR', 'DDN'],
            message: 'Job Location can be either HDR or DDN'
        }
    },
    applicationSource: {
        type: mongoose.Schema.ObjectId,
        ref: 'ApplicationSource',
    },
    document: [String],
    experiencYear: {
        type: String,
    },
    experiencMonth: {
        type: String,
    },
    stageName: {
        type: mongoose.Schema.ObjectId,
        ref: 'Stage',
    },
    active: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: {
            values: ['IN_PROGRESS', 'IRRELEVANT', 'FUTURE', 'FRESHER', 'ON_HOLD', 'REJECT'],
        }
    },
    reason: {
        type: String,
        maxLength: [150, 'Reason can not exceed 150 character']
    }
}, {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
})

applicationSchema.virtual('interviews', {
    ref: 'Interview',
    foreignField: 'application',
    localField: '_id'
})

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;