const mongoose = require('mongoose');
const validator = require('validator');

const stageSchema = new mongoose.Schema({
    stageName: {
        type: String,
        required: [true, 'Stage Name is a required field']
    },
    stateId: {
        type: Number,
        required: [true, 'State Id is required field'],
        min: 0,
        max: 6,
        unique: true,
    }
}, {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
})


const Stage = mongoose.model('Stage', stageSchema);

module.exports = Stage;