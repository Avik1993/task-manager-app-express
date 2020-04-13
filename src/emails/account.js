const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY)

const msg = {
    to: 'avikaggarwal1993@outlook.com',
    from: 'avikaggarwal1993@outlook.com',
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js'
  };
sgMail.send(msg);


const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'avikaggarwal1993@gmail.com',
    subject: 'Thanks for Joining in!',
    text: `Welcome to the app, ${name}. Let me know hows the app`
  })
}

module.exports = {
  sendWelcomeEmail
}