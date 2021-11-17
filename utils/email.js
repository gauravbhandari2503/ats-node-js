const nodemailer = require('nodemailer');
const pug = require('pug');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        if (user.name) {
            this.firstName = user.name.split(' ')[0];
        } else {
            this.firstName = 'User';
        }
        this.url = url;
        this.from = `Application Tracking System <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        //1) Create a transporter - service that send mail
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,
                }
            })
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
            // activate in gmail 'less secure app' option
        })
    }

    async send(template, subject) {
        // Send the actual mail

        // 1) Render HTML based on pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // 2) Define the email options
        const mailOptions = {
            from: process.env.NODE_ENV === 'production' ? process.env.SENDGRID_EMAILFROM : this.from,
            to: this.to,
            subject,
            html,
        }

        // 3) Create the transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendInvite() {
        await this.send('welcome', 'Welcome to application tracking system');
    }
}

