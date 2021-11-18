const mongoose = require('mongoose');
const validator = require('validator');

const applicantSchema = new mongoose.Schema({
    blacklist: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        trim: true
    },
    email1: {
        type: String,
        unique: true,
        required: [function() { return this.phone1 === null }, 'Primary Email is required if contact is not filled'],
        lowercase: true,
        validate:[validator.isEmail, 'Please provide a valid email']
    },
    email2: {
        type: String,
        unique: true,
        lowercase: true,
        validate:[validator.isEmail, 'Please provide a valid email']
    },
    phone1: {
        type: String,
        unique: true,
        required: [function() { return this.email1 === null }, 'Contact is required if email is not filled'],
        validate: [validator.isMobilePhone(phone1, 'any', {strictMode:true})]
    },
    phone2: {
        type: String,
        unique: true,
        validate: [validator.isMobilePhone(phone1, 'any', {strictMode:true})]
    },
    hometown: {
        type: String,
        maxLength: [100, 'Hometown must be less than 100 characters']
    },

}, {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
})

applicantSchema.virtual('comments', {
    ref: 'Comment',
    foreignField: 'applicant',
    localField: '_id'
})

applicantSchema.virtual('applications', {
    ref: 'Application',
    foreignField: 'user',
    localField: '_id'
})

const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant;