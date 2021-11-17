const mongoose = require('mongoose');
const validator = require('validator');

const jobsOpeningSchema = new mongoose.Schema({
    competency: {
        type: String,
        trim: true,
        required: [true, 'Competency is a required field'],
        maxLength: [100, 'Competency field must contain 100 or less characters'],
    },
    recruitingNo: {
        type: Number,
        required: [true, 'Recruiting Number is a required field'],
        max: [99999999, 'Recruiting Number is too long.'],
        unique: true
    },
    experience: {
        type: String, 
        required: [true, 'Experience is a required field'],
        maxLength: [25, 'Experience field must contain 25 or less characters'],
    },
    maxCtc: {
        type: String,
        required: [true, 'CTC is a required field'],
        maxLength: [25, 'CTC field must contain 25 or less characters'],
    },
    requiredSkill: {
        type: String,
        required: [true, 'Required Skills is a required field'],
        maxLength: [100, 'Experience field must contain 100 or less characters'],
    },
    responsibilities: {
        type: String,
        required: [true, 'Responsibilities is a required field'],
        maxLength: [100, 'Responsibilities field must contain 100 or less characters'],
    },
    searchScope: {
        type: String,
        required: [true, 'Search Scope is a required field'],
        maxLength: [100, 'Search Scope field must contain 100 or less characters'],
    },
    job: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
        required: [true, 'Job Title is a required field']
    },
    jobLocation: {
        type: String,
        required: [true,'Job Location is a required field'],
        enum: {
            values: ['HDR', 'DDN'],
            message: 'Job Location can be either HDR or DDN'
        }
    },
    priority: {
        type: String,
        required: [true,'Priority is a required field'],
        enum: {
            values: ['High', 'Medium', 'Low'],
            message: 'priority can be either high, medium or low'
        }
    },
    publishedStatus: {
        type: String,
        required: [true,'Publishing Status is a required field'],
        enum: {
            values: ['Draft', 'Published', 'Complete'],
            message: 'Publishing Status can be either Draft, Published, or Complete'
        }
    },
    archived: {
        type: Boolean,
        default: false
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

jobsOpeningSchema.pre(/^find/, function(next) {
    // this will point to query
    this.populate({
        path: 'job',
    })
    next();
});

const JobOpening = mongoose.model('JobOpening', jobsOpeningSchema);

module.exports = JobOpening;