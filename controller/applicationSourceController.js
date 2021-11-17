const ApplicationSource = require('./../models/applicationSourceModel');
const factory = require('./handleFactory');

// Middleware function 
exports.actionPerformed = (action) => {
    return (req, res, next) => {
        if (action === 'create') {
            req.body.createdBy = req.user.id;
        } else if (action === 'update') {
            req.body.updatedBy = req.user.id;
            req.body.updatedAt = Date.now();
        } else if (action === 'delete') {
            req.body.deletedBy = req.user.id;
            req.body.deletedAt = Date.now();   
        } else {
            return next(new AppError('Invalid action passed to the actionPerformed Middleware',404))
        }
        next();
    }
};

exports.createSource = factory.createOne(ApplicationSource);
exports.getAllSources = factory.getAll(ApplicationSource);
exports.updateSource = factory.updateOne(ApplicationSource);
exports.deleteSource = factory.deleteSoft(ApplicationSource);