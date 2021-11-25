const ApplicationSource = require('./../models/applicationSourceModel');
const factory = require('./handlerFactory');

exports.createSource = factory.createOne(ApplicationSource);
exports.getAllSources = factory.getAll(ApplicationSource);
exports.updateSource = factory.updateOne(ApplicationSource);
exports.deleteSource = factory.deleteSoft(ApplicationSource);