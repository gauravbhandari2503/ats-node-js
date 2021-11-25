const Job = require('./../models/jobModel');
const JobOpening = require('./../models/jobOpeningModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Job opening handler functions 
exports.createJobOpening = factory.createOne(JobOpening);
exports.getAllJobOpenings = factory.getAll(JobOpening);
exports.updateJobOpening = factory.updateOne(JobOpening);
exports.deleteJobOpening = factory.deleteOne(JobOpening);
exports.getJobOpening = factory.getOne(JobOpening);

exports.archiveJobOpening = catchAsync(async(req, res, next) => {
    const archiveJob = await JobOpening.findByIdAndUpdate(req.params.id, {
        archived: req.query.active
    }, {
        new: true,
        runValidators: true
    });
    res.status(201).json({
        status: 'success',
        data: {
            data: archiveJob
        }
    });
});    

// Job roles handler function 
exports.createJobRole = factory.createOne(Job);
exports.getAllJobRoles = catchAsync(async (req, res, next) => {
    const document = await Job.find({
        $and: [
            {'deleted': { $ne: true }},
            {'active': { $ne: false}}
        ]
    }).select('-createdAt -createdBy -updatedAt -updatedBy -deletedAt -deletedBy -__v ');

    res.status(200).json({
        status: 'success',
        totalRecords: document.length,
        data: {
            document
        }
    })
});
exports.getJobRole = factory.getOne(Job);
exports.updateJobRole = factory.updateOne(Job);

exports.deleteJobRole = factory.deleteSoft(Job);