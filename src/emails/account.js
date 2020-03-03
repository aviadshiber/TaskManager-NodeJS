const sgMail = require('@sendgrid/mail')
const companyEmail ='aviad.shiber@amdocs.com'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail= (name,email) =>{
    sgMail.send({
        to: email,
        from:companyEmail ,
        subject: 'Welcome to Task Manager App',
        text: `Welcome to the Task Manager App, ${name}. Let me know how you get along with it`
    })
}
const sendCancellationEmail= (name,email) =>{
    sgMail.send({
        to: email,
        from: companyEmail,
        subject: 'Task Manager App Feedback',
        text: `Hi, ${name}. Could you share with us what was wrong? thanks`
    })
}

module.exports ={
    sendWelcomeEmail,sendCancellationEmail
}