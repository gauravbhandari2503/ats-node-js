const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handleFactory');
const APIFeatures = require('./../utils/apiFeatures');
const Email = require('./../utils/email');

exports.getAllUsers = catchAsync(async(req,res,next) => {
    let filter = {};
    req.query.deleted = {ne:'true'};
    req.query.archived = {ne:'true'};
    const features = new APIFeatures(User.find(filter), req.query).filter().sort().limitFields().paginate();
    // const document = await features.query.explain();
    const document = await features.query;
    
    const totalRecords = await User.find().countDocuments({
        $and: [
            {'deleted': { $ne: true }},
            {'archived': { $ne: true}}
        ]
    });
    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        totalRecords,
        data: {
            document
        }
    })
});

exports.getlAllArchiveUsers = catchAsync(async(req,res,next) => {
    let filter = {};
    req.query.deleted = {ne:'true'};
    req.query.archived = {ne:'false'};
    const features = new APIFeatures(User.find(filter), req.query).filter().sort().limitFields().paginate();
    // const document = await features.query.explain();
    const document = await features.query;
    
    const totalRecords = await User.find().countDocuments({
        $and: [
            {'deleted': { $ne: true }},
            {'archived': { $ne: false}}
        ]
    });    
    
    res.status(200).json({
        status: 'success',
        totalRecords,
        data: {
            document
        }
    })
});

exports.getUser = factory.getOne(User);

exports.createUser = catchAsync(async(req, res, next) => {
    req.body.createdBy = req.user.id;
    const newUser = await User.create(req.body);
    const url = `http://localhost:8080/`;
    await new Email(newUser, url).sendInvite();
    res.status(201).json({
        status: 'success',
        data: {
            data: newUser
        }
    });
});

exports.updateUser = catchAsync(async(req, res, next) => {
    req.body.updatedBy = req.user.id;
    req.body.updatedAt = Date.now();
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(201).json({
        status: 'success',
        data: {
            data: updatedUser
        }
    });
});

exports.deleteUser = factory.deleteSoft(User);


exports.archiveUser = catchAsync(async(req, res, next) => {
    const archiveUser = await User.findByIdAndUpdate(req.params.id, {
        archived: req.query.active
    }, {
        new: true,
        runValidators: true
    });
    res.status(201).json({
        status: 'success',
        data: {
            data: archiveUser
        }
    });
});
