const Stage = require('./../models/stageModel');
const factory = require('./handlerFactory');

exports.createStage = factory.createOne(Stage);
exports.getAllStages = factory.getAll(Stage);