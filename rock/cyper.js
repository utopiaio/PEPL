const crypto = require('crypto');

/**
 * returns the sha512 hash of a bare password passed
 * no-salt no nothing --- trust me this is enough to keep out the NSA
 *
 * @param {String} rawPassword raw string to hash
 * @param {String} algorithm algorithm to be used for hashing
 * @return {String} hashed string
 */
module.exports = (rawPassword, algorithm = 'sha512') => {
  const sha512 = crypto.createHash(algorithm);
  sha512.update(rawPassword, { encoding: 'utf8' });
  return sha512.digest('hex');
};
