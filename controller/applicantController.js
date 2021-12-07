const catchAsync = require('../utils/catchAsync');
const Applicant = require('./../models/applicantModel');
const Comment = require('./../models/commentModel');
const Application = require('./../models/applicationModel');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const factory = require('./handlerFactory');
const multer = require('multer');
const PhoneNumber = require('awesome-phonenumber')

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

exports.createApplicant = catchAsync(async(req, res, next) => {
    // 1) Check email or phone already exist or not
    const {email1, phone1} = req.body;
    
    const applicant = await Applicant.findOne({
        $or: [
            {
                email1: { $exists:true, $eq:email1}
            },
            {
                phone1: { $exists:true, $eq:phone1}
            }
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

        if (req.body.action !== 'CREATE_NEW') return next(new AppError('Applicant already existing in the system, but do no have any active applications !', 409, application));

        if (req.file) req.body.document = req.file.filename; 
        req.body.applicant = applicant.id;
        req.body.status = "IN_PROGRESS";
        const newApplication = await Application.create(req.body);
        res.status(201).json({
            status: 'success',
            message: `Application created successfully for applicant ${applicant.name}`,
            newApplication
        })
        
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
    let query = Applicant.findById(req.params.id);
    let populateOptions = [{path: 'applications'}, {path:'comments'}];

    populateOptions.forEach(el => {
        query = query.populate(el);
    })

    const document = await query;

    if (!document) {
        return next(new AppError('No document found with that id',404));
    }
    let countryCode = {};
    if (document.phone1) countryCode.phone1 = PhoneNumber(`${document.phone1}`).getRegionCode();
    if (document.phone2) countryCode.phone2 = PhoneNumber(`${document.phone2}`).getRegionCode();

    res.status(200).json({
        status: 'success',
        data: {
            document
        },
        countryCode
    })
})

exports.mergeApplicant = catchAsync(async(req, res, next) => {
    let sourceApplicant = await Applicant.findById(req.query.sourceId);
    const targetApplicant = await Applicant.findById(req.query.targetId);
    

    if (req.query.action === 'keep') {

        await Application.deleteMany({ applicant: targetApplicant.id});
        await Comment.deleteMany({ applicant: targetApplicant.id});
        await Applicant.findByIdAndDelete(req.query.targetId);
        res.status(201).json({
            status: 'success',
            message: 'Keep action completed successfully',
        });

    } else if (req.query.action === 'keep_and_merge') {
        const targetActiveApplication = await Application.findOne({applicant: targetApplicant.id, active: true});
        const sourceActiveApplication = await Application.findOne({applicant: sourceApplicant.id, active: true});
        if (!sourceApplicant.email1) sourceApplicant.email1 = targetApplicant.email1;
        if (!sourceApplicant.email2) sourceApplicant.email2 = targetApplicant.email2;
        if (!sourceApplicant.phone1) sourceApplicant.phone1 = targetApplicant.phone1;
        if (!sourceApplicant.phone2) sourceApplicant.phone2 = targetApplicant.phone2;
        if (!sourceApplicant.hometown) sourceApplicant.hometown = targetApplicant.hometown;

        let updateToSourceActiveApplication = {};
        if (!sourceActiveApplication.job) updateToSourceActiveApplication.job = targetActiveApplication.job ? targetActiveApplication.job.id : undefined;
        if (!sourceActiveApplication.applicationSource) updateToSourceActiveApplication.applicationSource = targetActiveApplication.applicationSource ? targetActiveApplication.applicationSource.id : undefined; 
        if (!sourceActiveApplication.jobLocation) updateToSourceActiveApplication.jobLocation = targetActiveApplication.jobLocation;
        if (sourceActiveApplication.document.length < 1) updateToSourceActiveApplication.document = targetActiveApplication.document;
        
        const sourceNewApplications = await Application.updateMany({applicant: targetApplicant.id, active: false}, {
            $set: {
                applicant: sourceApplicant.id
            }
        });

        const sourceNewComments = await Comment.updateMany({applicant: targetApplicant.id}, {
            $set: {
                applicant: sourceApplicant.id
            }
        })
        await Application.findByIdAndDelete(targetActiveApplication.id);
        const sourceNewActiveApplication = await Application.findByIdAndUpdate(sourceActiveApplication.id, updateToSourceActiveApplication, {
            new: true,
            runValidators: true,
        });
        await Applicant.findByIdAndDelete(req.query.targetId);
        await sourceApplicant.save();
        res.status(201).json({
            status: 'success',
            message: 'Merge completed successfully',
        });

    } else {
        return next(new AppError('Invalid Action Performed', 403));
    }
});

exports.updateApplicant = catchAsync(async(req, res, next) => {
    // 1) Get applicant from id 
    const currentApplicant = await Applicant.findById(req.params.id);

    // 2) Get applicant from email1 and check if it matches the current applicant if not show alert to user
    if (req.body.email1) var applicantFromEmail = await Applicant.findOne({email1: req.body.email1});

    if (applicantFromEmail && applicantFromEmail.id !== currentApplicant.id) {
        return next(new AppError(`Applicant with E-mail: ${applicantFromEmail.email1} is already existing in the system !`, 409, applicantFromEmail));
    }

    // 3) Get applicant from phone1 and check if it matches the current applicant if not show alert to user
    if (req.body.phone1) var applicantFromContact = await Applicant.findOne({phone1: req.body.phone1});

    if (applicantFromContact && applicantFromContact.id !== currentApplicant.id) {
        return next(new AppError(`Applicant with contact: ${applicantFromContact.phone1} is already existing in the system !`, 409, applicantFromContact));
    }   

    // 4) if no error found on 2 and 3 then direct update the applicant and its application.
    const updatedApplicant = await Applicant.findByIdAndUpdate(currentApplicant.id, req.body, {
        new: true,
        runValidators: true
    });
    const updatedApplication = await Application.findByIdAndUpdate(req.body.applicationId, req.body, {
        new: true, 
        runValidators: true
    })

    res.status(201).json({
        status: 'success',
        message: 'Application updated successfully',
        updatedApplicant,
        updatedApplication
    });

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
                status: 'BLACKLIST'
            }
        }
    ])
    res.status(201).json({
        status: 'success',
        message: `${applicant.name} Successfully Blacklisted`,
        applicant,
    })
});

exports.whitelistApplicant = catchAsync(async(req, res, next) => {
    let applicant = await Applicant.findById(req.params.id);
    if (!applicant.blacklist.blacklisted) return next(new AppError('Applicant is already whitelisted', 406));
    applicant.blacklist.reason = undefined;
    applicant.blacklist.blacklisted = false;
    applicant.blacklist.blacklistedBy = undefined;
    await applicant.save();
    
    const updateAllApplications = await Application.updateMany({ applicant: {$eq: applicant.id}}, [
        {
            $set: {
                active: false,
            }
        }
    ])
    res.status(201).json({
        status: 'success',
        message: `${applicant.name} Successfully Whitelisted`,
        applicant
    })
})

exports.getAllBlacklistedApplicants = catchAsync(async(req, res, next) => {

    let filter = {};
    
    const features = new APIFeatures(Applicant.find({
        'blacklist.blacklisted':true
    }), req.query).sort().limitFields().paginate();
    
    const document = await features.query;

    res.status(201).json({
        status: 'success',
        document,
        totalRecords: document.length
    })
})