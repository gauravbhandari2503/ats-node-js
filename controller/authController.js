const User = require('./../models/userModel');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const axios = require('axios');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createAndSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
    
    res.cookie('jwt', token, cookieOptions)
    
    res.status(statusCode).json({
        status: 'success',
        data: {
            jwt: token,
            user
        }
    })
}

const verifyIdToken = async(token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    if (userid) {
        const data = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        return data;
    } else {
        return next(new AppError('Authentication failed', 401))
    }
};

exports.login = catchAsync(async(req, res, next) => {

    const data = await verifyIdToken(req.headers.token).catch(console.error);
    let user = await User.findOne({ email: data.data.email}).select('+deleted');
    
    if (!user || user.deleted === true) {
        return next(new AppError('Invalid user', 404));
    }
    user.name = data.data.name;
    user.image = data.data.picture;
    const updatedUser = await user.save();
    createAndSendToken(updatedUser, 200, res);
});

// Protecting the routes using the middleware
exports.protect = catchAsync(async(req, res, next) => {
    let token;

    // 1) Getting the jwt token and check if it's exist
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return next(new AppError('You are not logged in! Please login to get access.',401))
    }

    // 2) Validate the token (Verification)
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // 3) Check user still exists?
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError(`JWT Token is Expired`,401))
    }

    // Grant access to protect routes
    req.user = currentUser;
    next()
})


// Roles and permission

// exports.restrictTo = (...roles) => {       //Arbitary function that can take number of arguments and store them to array
//     return (req, res, next) => {
//         // roles is an array
//         if (!roles.includes(req.user.role)) {
//             return next(new AppError('You do not have permission to perform this action',403))
//         }
//         next();
//     }
// }

