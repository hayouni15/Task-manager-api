
const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.sendgridAPIKEY);
const sendEmail = (email, name) => {
    const msg = {
        to: email,
        from: 'hayouni@hayouni.com',
        subject: `welcome ${name}`,
        text: 'test',
        html: '<strong>welcome sir </strong>',
    };
    sgMail.send(msg);
}
const RemovalEmail = (email, name) => {
    const msg = {
        to: email,
        from: 'hayouni@hayouni.com',
        subject: `${name}, your account has been deleted `,
        text: 'test',
        html: '<strong>good buy </strong>',
    };
    sgMail.send(msg);
}

module.exports = {
    sendEmail,
    RemovalEmail
}
