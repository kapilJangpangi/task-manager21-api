const sgMail = require('@sendgrid/mail')

//sgMail an object itslef

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'kapiljangpangi21@gmail.com', //in real we want a custom domain associate that with your account and use an email addrss at that domian
    subject: 'Thanks for joining in!',
    text: `welcome to the app, ${name}. Let me know how you get along with the app`
  })
}


const sendGoodbyeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'kapiljangpangi21@gmail.com',
    subject: 'Account Cancelation',
    text: `Cancelation approved. ${name} Hope to see you soon.`,
    html:'<strong>What can we do for you to be on board again</strong>'
  })
}

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeEmail
}


