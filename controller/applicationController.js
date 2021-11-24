const Stage = require('../models/stageModel');
const catchAsync = require('../utils/catchAsync');
const Applicant = require('./../models/applicantModel');
const Application = require('./../models/applicationModel');
const AppError = require('./../utils/appError');
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

exports.getAllApplications = factory.getAll(Application);

exports.changeApplicationStage = catchAsync(async(req, res, next) => {
    const application = await Application.findById(req.params.id);
    if (application.active === false) return next(new AppError(`Invalid operation: cannot move inactive application`,403));
    if (!application) return next(new AppError(`No application found with id: ${req.params.id}`), 404);
    let currentStage = application.stage.stateId;    
    if (req.body.event === 'NEXT_STAGE') {
        currentStage += 1;
    } else if (req.body.event === 'PRV_STAGE') {
        currentStage -= 1;
    } else {
        return next(new AppError('Event not recognized', 404));
    }
    if (currentStage === 7 || currentStage === -1) return next(new AppError('Invalid operation', 403));
    const nextStage = await Stage.findOne({stateId: {$eq: currentStage}});
    application.stage = nextStage.id;
    await application.save();
    res.status(201).json({
        status:'success',
    })
});

exports.changeApplicationStatus = catchAsync(async(req, res, next) => {
    req.body.active = false;
    if (req.body.status === 'LEAD') {
        req.body.active = true;
        req.body.status = 'IN_PROGRESS';
        req.body.reason = undefined;
        const stage = await Stage.findOne({stateId: {$eq: 0}});
        req.body.stage = stage.id;
        console.log(req.body.stage);
    }

    if (req.body.status !== 'REJECT') delete req.body.reason;
    if (req.body.status === 'REJECT' && !(req.body.reason)) return next(new AppError('Reason for rejecting the candidate is required', 404));
    const application = await Application.findByIdAndUpdate(req.body.applicationId, req.body, {
        new: true,
        runValidators: true
    });

    if (!application) return next(new AppError(`No application found with id: ${req.body.applicationId}`));
    res.status(201).json({
        status:'success',
        messgae: 'Application status changed successfully'
    });
});

exports.changeAssignee = catchAsync(async(req, res, next) => {
    const application = await Application.findByIdAndUpdate(req.query.applicationId, {
        applicationAssign: req.query.applicationAssign
    }, {
        runValidators: true
    });
    if (!application) return next(new AppError(`No application found with id: ${req.params.id}`), 404);
    res.status(200).json({
        status: 'success',
    })
})