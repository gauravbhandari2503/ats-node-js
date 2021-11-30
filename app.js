const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes');
const commentRouter = require('./routes/commentRoutes');
const stageRouter = require('./routes/stageRoutes');
const jobRouter = require('./routes/jobRoutes');
const sourceRouter = require('./routes/applicationSourceRoutes');
const interviewRouter = require('./routes/interviewRoutes');
const applicantRouter = require('./routes/applicantRoutes');
const applicationRouter = require('./routes/applicationRoutes');
const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');
const cors = require('cors');
const authController = require('./controller/authController');
const app = express();

app.use(cors());

// Set secuitry http header
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Api rate limiting
const limiter = rateLimit({
    max: 100,
    windowMS: 60 * 60 * 1000,
    message: 'Too many request from this ip, Please try again in an hour'
});

app.use('/api/v1/users', limiter);

// Body parser, reading data from the body into req body
app.use(express.json({
    limit: '10kb'
}));

app.use(cookieParser());

app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}));

// Data sanitization against NoSQL query injection :EX => in postman keep the password correct and use this "email": {"$gt":""}
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution (hpp: http parament pollution)
app.use(hpp({
    whitelist: [
        // specify parameter that cannnot be pollutated
    ]
}));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/jobs', jobRouter);
app.use('/api/v1/stages', stageRouter);
app.use('/api/v1/application-source', sourceRouter);
app.use('/api/v1/applicants', applicantRouter);
app.use('/api/v1/applications', applicationRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/interviews', interviewRouter);
app.get('/api/v1/login', authController.login);
app.get('/test', ((req,res) => {
    res.status(201).json({success:'true'});
}));

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));  // anything passed to next is understandable that it is an error and it will send the error to the global error handling middleware
})

// Error Handling middleware
app.use(globalErrorHandler);

module.exports = app