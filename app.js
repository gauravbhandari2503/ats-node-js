const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const app = express();

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

app.use('/api', limiter);

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

module.exports = app