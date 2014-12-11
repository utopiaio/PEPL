var crypto = require ('crypto');

/**
 * returns the sha1 hash of a bare password passed
 * no-salt no night --- trust me this is enough to keep out the NSA
 */
module.exports = function (rawPassword) {
  var sha1 = crypto.createHash('sha1');
  sha1.update(rawPassword, {encoding: 'utf8'});
  return sha1.digest('hex');
};
