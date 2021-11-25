const mongoose = require('mongoose');
const validator = require('validator');

const applicantSchema = new mongoose.Schema({
    blacklist: {
        blacklisted: {
            type: Boolean,
            default: false
        },
        reason: {
            type: String,
            maxLength: [150, 'Reason for blacklisting the candidate must not exceed 150 characters.'],
            default: null
        },
        blacklistedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    },
    name: {
        type: String,
        trim: true,
        required: [true, 'Applicant must have a name']
    },
    email1: {
        type: String,
        required: [function() { if (this.phone1) {return false} else { return true} }, 'Primary Email is required if contact is not filled'],
        lowercase: true,
        validate:[validator.isEmail, 'Please provide a valid email']
    },
    email2: {
        type: String,
        lowercase: true,
        validate:[validator.isEmail, 'Please provide a valid email']
    },
    phone1: {
        type: String,
        required: [function()  { if (this.email1) {return false} else { return true} }, 'Contact is required if email is not filled'],
        validate: [validator.isMobilePhone, 'Invalid Phone number']
    },
    phone2: {
        type: String,
        validate: [validator.isMobilePhone,'Invalid Phone number']
    },
    hometown: {
        type: String,
        maxLength: [100, 'Hometown must be less than 100 characters']
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
});

applicantSchema.index({email1:1}, {unique:true, sparse:true});
applicantSchema.index({email2:1}, {unique:true, sparse:true});
applicantSchema.index({phone1:1}, {unique:true, sparse:true});
applicantSchema.index({phone2:1}, {unique:true, sparse:true});

applicantSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'blacklist.blacklistedBy',
        select: '-__v -createdBy -role -location -archived'
    });
    next();
});

applicantSchema.virtual('comments', {
    ref: 'Comment',
    foreignField: 'applicant',
    localField: '_id'
})

applicantSchema.virtual('applications', {
    ref: 'Application',
    foreignField: 'applicant',
    localField: '_id'
})

const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant;