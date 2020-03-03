const sgMail = require('@sendgrid/mail')
const sendGridApiKey = process.env.SENDGRID_API_KEY
sgMail.setApiKey(sendGridApiKey)


const sendWelcomeEmail= (name,email) =>{
    sgMail.send({
        to: email,
        from: 'aviad.shiber@amdocs.com',
        subject: 'Welcome to Task Manager App',
        text: `Welcome to the Task Manager App, ${name}. Let me know how you get along with it`
    })
}

module.exports ={
    sendWelcomeEmail
}