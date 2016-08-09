const nodemailer = require('nodemailer');

module.exports = (config) => ({
  /**
   * creates an email transporter client
   *
   * @return {Object}
   */
  emailTransporter() {
    return nodemailer.createTransport({
      service: config.service,
      auth: config.auth,
    });
  },
});
