const Stage = require('./../models/stageModel');
const factory = require('./handleFactory');

exports.createStage = factory.createOne(Stage);
exports.getAllStages = factory.getAll(Stage);