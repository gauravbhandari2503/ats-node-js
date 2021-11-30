const catchAsync = require('../utils/catchAsync');
const Interview = require('./../models/interviewModel');
const rp = require('request-promise');
const jwt = require('jsonwebtoken');
const { application } = require('express');
 
 
const payload = {
    iss: `${process.env.API_ZOOM_KEY}`,
    exp: ((new Date()).getTime() + 5000)
};

const token = jwt.sign(payload, `${process.env.API_ZOOM_SECRET}`);

exports.scheduleInterview = catchAsync(async(req, res, next) => {
    if (req.body.interviewType === 'Zoom') {
        console.log(req.body);
        email = `gaurav2503bhandari@gmail.com`;
        var options = {
            method: "POST",
            uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
            body: {
                topic: "Interview",
                type: 2,
                pre_schedule: false,
                start_time: req.body.date,
                timezone:'Asia/Kolkata',
                default_password:true,
                settings: {
                    host_video: "true",
                    participant_video: "true"
                }
            },
            auth: {
                bearer: token
            },
            headers: {
                "User-Agent": "Zoom-api-Jwt-Request",
                "content-type": "application/json"
            },
            json: true //Parse the JSON string in the response
        };

        rp(options)
        .then(async function(response) {
            console.log("response is: ", response);
            // always send join_url to the applicant and encrypted_password
            const interview = await Interview.create({
                link: response.start_url,
                application: req.body.applicationId,
                date: req.body.date,
                interviewType: 'Zoom',
                interviewer: req.body.interviewer,
                message: req.body.message
            });
            res.send({
                status:'success'
            });
        })
        .catch(function(err) {
            // API call failed...
            console.log("API call failed, reason ", err);
            res.send(404);
        });
    }
})