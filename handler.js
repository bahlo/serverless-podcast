'use strict';

const fs       = require('fs'),
      Bluebird = require('bluebird'),
      yaml     = require('js-yaml'),
      AWS      = require('aws-sdk');
const Episodes  = require('./lib/episodes'),
      Templates = require('./lib/templates'),
      Auth      = require('./lib/auth');

const config = yaml.safeLoad(
  fs.readFileSync(`config.${process.env.STAGE}.yml`, 'utf8'));

AWS.config.setPromisesDependency(Bluebird);
AWS.config.update({ region: config.region });

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports.updateFeed = (event, context, callback) => {
  Episodes.list(s3, config)
    .then(episodes => Episodes.fetchMetadata(s3, config, episodes))
    .then(episodes => Episodes.sort(episodes))
    .then(episodes => Templates.updateFeed(s3, config, episodes))
    .then(() => { callback(null) })
    .catch(err => { callback(err); });
};

module.exports.updateIndexError = (event, context, callback) => {
  Bluebird.all([
    Templates.updateIndex(s3, config),
    Templates.updateError(s3, config),
  ]).then(() => { callback(null) })
    .catch(err => { callback(err); });
}

module.exports.updatePublish = (event, context, callback) => {
  const expireDate   = Auth.expireDate(),
        credential   = [config.accessKeyID, expireDate.format('YYYYMMDD'),
          config.region, 's3/aws4_request'].join('/'),
        policyBase64 = Auth.policyBase64(config.bucket, expireDate,
          credential),
        signature    = Auth.signature(expireDate, config.region, policyBase64,
          config.secretAccessKey);

  Templates.updatePublish(s3, config, {
    expireDate: {
      short: expireDate.format('YYYYMMDD'),
      long: expireDate.format('YYYYMMDDT000000[Z]')
    },
    policyBase64,
    signature
  }).then(() => { callback(null) })
    .catch(err => { callback(err); });
}
