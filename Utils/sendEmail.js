import {createTransport,createTestAccount,getTestMessageUrl} from 'nodemailer'

const sendEmail=async(to,subject,message)=>{

    const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // generated ethereal user
            pass: process.env.SMTP_PASS, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        to: to, // list of receivers
        subject: subject, // Subject line
        text: message, // plain text body
        html: "<b>Hello world?</b>", // html body
    });

    
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", getTestMessageUrl());
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

}
export {sendEmail}