'use strict';

const crypto = require('crypto'),
      moment = require('moment');

module.exports.policyBase64 = (bucket, expireDate, credential) => {
  const policy = {
    expiration: expireDate.toISOString(),
    conditions: [
      { bucket: bucket },
      { acl: 'public-read' },
      { 'Content-Type': 'audio/mpeg' },
      [ 'starts-with', '$key', 'episodes/'],
      [ 'starts-with', '$success_action_redirect', ''],
      { 'x-amz-algorithm': 'AWS4-HMAC-SHA256'},
      { 'x-amz-credential': credential },
      { 'x-amz-date': expireDate.format('YYYYMMDDT000000[Z]') },
      ["content-length-range", 100000, 100000000],
      [ 'starts-with', '$x-amz-meta-date', ''],
      [ 'starts-with', '$x-amz-meta-title', ''],
      [ 'starts-with', '$x-amz-meta-description', ''],
      [ 'starts-with', '$x-amz-meta-author', ''],
      [ 'starts-with', '$x-amz-meta-duration', ''],
    ]
  };

  return new Buffer(JSON.stringify(policy)).toString('base64');
};

const hmac = (key, string) => {
  var hmac = crypto.createHmac('sha256', key);
  hmac.end(string);
  return hmac.read();
}

module.exports.signature = (expireDate, region, policyBase64, secretKey) => {
  const dateKey              = hmac('AWS4' + secretKey,
    expireDate.format('YYYYMMDD'));
  const dateRegionKey        = hmac(dateKey, region);
  const dateRegionServiceKey = hmac(dateRegionKey, 's3');
  const signingKey           = hmac(dateRegionServiceKey, 'aws4_request');
  return hmac(signingKey, policyBase64).toString('hex');
}

module.exports.expireDate = () => {
  return moment().utc().add(2, 'd');
}
