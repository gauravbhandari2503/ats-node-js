const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

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
            return next(new AppError('Invalid action passed to the actionPerformed Middleware',404));
        }
        next();
    }
};

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id)

    if (!document) {
        return next(new AppError('No document found with that id',404));
    }

    res.status(204).json({
        status: 'success'
    });
});

exports.deleteSoft = Model => catchAsync(async (req, res, next) => {
    const deletedDoc = await Model.findByIdAndUpdate(req.params.id, {
        deleted: true,
        deletedAt: Date.now(),
        deletedBy: req.user.id
    })
    res.status(201).json({
        status: 'success',
        data: {
            data: deletedDoc
        }
    });
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const updatedDocument = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updatedDocument) {
        return next(new AppError('No Document found with that id',404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: updatedDocument
        }
    })
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: newDocument
        }
    });
});

exports.getOne = (Model,populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions)  query = query.populate(populateOptions) 

    const document = await query;
    // Tour.findOne({ _id: req.params.id}) long method

    if (!document) {
        return next(new AppError('No document found with that id',404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            document
        }
    })
})

exports.getAll = (Model) => catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.applicantId) filter = {applicant: req.params.applicantId};
    
    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    // const document = await features.query.explain();
    const document = await features.query;

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        totalRecords: document.length,
        data: {
            document
        }
    })
})