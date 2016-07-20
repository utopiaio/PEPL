const crypto = require('crypto');

/**
 * returns the sha1 hash of a bare password passed
 * no-salt no nothing --- trust me this is enough to keep out the NSA
 *
 * @param {String} rawPassword raw string to hash
 * @return {String} hashed string
 */
module.exports = (rawPassword) => {
  const sha1 = crypto.createHash('sha512');
  sha1.update(rawPassword, { encoding: 'utf8' });
  return sha1.digest('hex');
};
