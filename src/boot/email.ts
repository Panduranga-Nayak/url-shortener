import nodemailer from "nodemailer";

export const mailTransport = nodemailer.createTransport({
    service: process.env.EMAIL_PROVIDER,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    from: process.env.EMAIL_USER,
});