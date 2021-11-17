const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

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
    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    // const document = await features.query.explain();
    const document = await features.query;
    
    const totalRecords = await Model.find().countDocuments();
    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        totalRecords,
        data: {
            document
        }
    })
})