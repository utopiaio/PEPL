const jwt = require('jsonwebtoken');

/**
 * verifies JWT on the passed header object
 *
 * @param  {Object} header
 * @param  {String} JWTHeader
 * @param  {String} secret
 * @return {Boolean | Object}
 */
const verify = (header, JWTHeader, secret) => {
  if (header.hasOwnProperty(JWTHeader) === false) {
    return false;
  }

  try {
    const decoded = jwt.verify(header[JWTHeader], secret);
    return decoded;
  } catch (e) {
    return false;
  }
};

/**
 * signs data for JWT
 *
 * @param  {Object} claim JWT payload
 * @param  {String} secret
 * @return {String}
 */
const sign = (claim, secret) => jwt.sign(claim, secret);

module.exports = {
  sign,
  verify,
};
