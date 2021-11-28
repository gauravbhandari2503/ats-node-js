const Stage = require('../models/stageModel');
const catchAsync = require('../utils/catchAsync');
const Applicant = require('./../models/applicantModel');
const Application = require('./../models/applicationModel');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const fs = require('fs');
const path = require('path');
const dirPath = path.join(__dirname, '../public');

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
    if (nextStage.stageName === 'Hired' && nextStage.stateId === 6) application.result.passed = true;
    application.stage = nextStage.id;
    await application.save();
    res.status(201).json({
        status:'success',
    })
});

exports.changeApplicationStatus = catchAsync(async(req, res, next) => {
    req.body.active = false;
    if (req.body.status === 'LEAD') {
        req.body.status = 'NONE';
        let tempApplication = await Application.findById(req.body.applicationId, {id: 0});
        if (!tempApplication) return next(new AppError(`No application found with id: ${req.body.applicationId}`));
        tempApplication = tempApplication.toObject();
        tempApplication.active = true;
        tempApplication.status = 'IN_PROGRESS';
        tempApplication.reason = undefined;
        tempApplication.result.passed = false;
        tempApplication.result.joiningDate = null;
        delete tempApplication.result.passed;
        const stage = await Stage.findOne({stateId: {$eq: 0}});
        tempApplication.stage = stage.id;
        delete tempApplication._id;
        const newApplication = await Application.create(tempApplication);
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
        message: 'Application status changed successfully'
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

exports.getApplicationResume = catchAsync(async(req, res, next) => {
    const application = await Application.findById(req.params.id);
    if (application.document.length <= 0) return next(new AppError('No resume found', 404));
    let file = fs.createReadStream(`${dirPath}/docs/applicants/${application.document[0]}`);
    file.pipe(res);
})