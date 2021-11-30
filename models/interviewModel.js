const mongoose = require('mongoose');
const validator = require('validator');

const interviewSchema = new mongoose.Schema({
    link: {
        type: String,
        trim: true,
    },
    application: {
        type: mongoose.Schema.ObjectId,
        ref: 'Application',
        required: [true,'Interview scheduled for that application need to filled'],
    },
    date: {
        type: Date,
        required: [true,'Interview Date on which it will be scheduled is required'],
    },
    interviewType: {
        type: String,
        required: [true,'Interview Type is a required field'],
        enum: {
            values: ['Telephonic', 'Zoom', 'In-person'],
            message: 'Interview can be either of type Telephonic, Zoom or In-person'
        },
    },
    interviewer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,'Interviewer must be select for scheduling any interview'],
    },
    message: {
        type: String,
        maxLength: [100, 'Message field must contain 100 or less characters'],
        required: [true,'Message must be filled.'],
    }
}, {
    timestamps: true,
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
})


const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;