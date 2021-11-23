const catchAsync = require('../utils/catchAsync');
const Applicant = require('./../models/applicantModel');
const Comment = require('./../models/commentModel');
const Application = require('./../models/applicationModel');
const AppError = require('./../utils/appError');

const multer = require('multer');
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/docs/applicants')
    },
    filename: (req, file, cb) => {
        // user-id-timestamp
        const extension = file.mimetype.split('/')[1]; // extension
        cb(null, `user-${Date.now()}.${extension}`)
    }
});


const upload = multer({
    storage: multerStorage,
});

exports.uploadApplicantResume = upload.single('resume');


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

exports.createApplicant = catchAsync(async(req, res, next) => {
    // 1) Check email or phone already exist or not
    const {email1, phone1} = req.body;
    const applicant = await Applicant.findOne({
        $or: [
            {email1, phone1}
        ]
    });

    // 1.a) If exist, check any application is active against that applicant 
    if (applicant) {
        const application = await Application.find({
            $and: [
                {
                    applicant: {$eq: applicant.id},
                    active: true
                }
            ]
        })
        // 1.b) If any application is active against that applicant than show error message
        if (application.length > 0) return next(new AppError('Appication against this applicant is active', 409, application));

        // 1.c) If any application is not active against that applicant, check if applicant is blacklisted or not and then check for action status, if true create new application against that applicant
        if(applicant.blacklist.blacklisted === true) return next(new AppError('Cannot create application for the blacklisted applicant'));

        if (req.body.action === 'CREATE_NEW') {
            if (req.file) req.body.document = req.file.filename; 
            req.body.applicant = applicant.id;
            req.body.status = "IN_PROGRESS";
            const newApplication = await Application.create(req.body);
            res.status(201).json({
                status: 'success',
                message: `Application created successfully for applicant ${applicant.name}`,
                newApplication
            })
        } else {
            res.status(404).json({
                status: 'error',
                message: 'Please specify the action for creating the new application',
                name: 'ACTION_ERROR'
            });
        }
    // 2) If email or phone does not exist create one applicant and one application against that user
    } else {
        const newApplicant = await Applicant.create(req.body);
        req.body.applicant = newApplicant.id;
        if (req.body.comment) {
            await Comment.create(req.body);
        }
        req.body.status = 'IN_PROGRESS';
        if (req.file) req.body.document = req.file.filename; 
        const newApplication = await Application.create(req.body);
        res.status(201).json({
            status: 'success',
            newApplicant,
            newApplication
        })
    }
});

exports.getApplicant = catchAsync(async(req, res, next) => {

});

exports.updateApplicant = catchAsync(async(req, res, next) => {

});

exports.blacklistApplicant = catchAsync(async(req, res, next) => {
    let applicant = await Applicant.findById(req.params.id);
    if (!req.body.reason) return next(new AppError('Reason for blacklisting the candidate is missing', 404));
    applicant.blacklist.reason = req.body.reason;
    applicant.blacklist.blacklisted = true;
    applicant.blacklist.blacklistedBy = req.user.id;
    await applicant.save();
    const updateAllApplications = await Application.updateMany({ applicant: {$eq: applicant.id}}, [
        {
            $set: {
                active: false,
                status: 'NONE'
            }
        }
    ])
    res.status(201).json({
        status: 'success',
        message: `${applicant.name} Successfully Blacklisted`,
        applicant,
    })
});