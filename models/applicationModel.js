const mongoose = require('mongoose');
const validator = require('validator');
const Stage = require('./stageModel');

const applicationSchema = new mongoose.Schema({
    currentSalary: {
        type: String,
        maxLength: [100, 'Current Salary must not exceed 100 characters']
    },
    expectedSalary: {
        type: String,
        maxLength: [100, 'Expected Salary must not exceed 100 characters']
    },
    applicant: {
        type: mongoose.Schema.ObjectId,
        ref: 'Applicant',
        required: [true, 'Application must belong to a user']
    },
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
    experienceYear: {
        type: String,
    },
    experienceMonth: {
        type: String,
    },
    stage: {
        type: mongoose.Schema.ObjectId,
        ref: 'Stage',
    },
    applicationAssign: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    active: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: {
            values: ['IN_PROGRESS', 'IRRELEVANT', 'FUTURE', 'FRESHER', 'ON_HOLD', 'REJECT', 'BLACKLIST', 'NONE'],
        },
        required: ['true', 'Application Status cannot be empty!']
    },
    result: {
        passed: {
            type: Boolean,
            default: false
        },
        joiningDate: {
            type: Date,
            default: null
        },
        joiningLocation: {
            type: String,
            enum: {
                values: ['HDR', 'DDN', 'NONE'],
                message: 'Job Location can be either HDR or DDN'
            }
        },
        offerStatus: {
            type: String,
            enum: {
                values: ['Accepted', 'Not Accepted', 'Pending'],
                message: 'INVALID OFFER STATUS',
            }
        }, 
        followUpStatus: {
            type: String,
            enum: {
                values: ['Follow-up Email', 'Follow-up Call']
            }
        }
    },
    reason: {
        type: String,
        maxLength: [150, 'Reason can not exceed 150 character']
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
}, {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
})

applicationSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'stage',
        select: '-__v'
    }).populate({
        path: 'job',
        select: '-createdAt -createdBy -__v'
    }).populate({
        path: 'applicant',
        select: '-createdAt -createdBy -__v'
    }).populate({
        path: 'applicationSource',
        select: '-createdAt -createdBy -__v'
    }).populate({
        path: 'applicationAssign',
        select: '-createdAt -createdBy -__v -role -archived -image'
    }).populate({
        path: 'createdBy',
        select: '-createdAt -createdBy -__v -location -archived -image'
    });
    next();
});

applicationSchema.virtual('interview', {
    ref: 'Interview',
    foreignField: 'application',
    localField: '_id'
});

applicationSchema.pre('save', async function(next) {
    if (this.isNew) {
        const stage = await Stage.findOne({stateId: {$eq: 0}})
        this.stage = stage.id;
    }
    next();
});


applicationSchema.pre(/^find/, function(next) {
    this.populate({
        path:'interview'
    });
    next();
})

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;