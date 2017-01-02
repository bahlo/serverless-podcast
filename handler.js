'use strict';

const fs       = require('fs'),
      Bluebird = require('bluebird'),
      yaml     = require('js-yaml'),
      AWS      = require('aws-sdk');
const Episodes  = require('./lib/episodes'),
      Templates = require('./lib/templates');

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

module.exports.updateHTML = (event, context, callback) => {
  Bluebird.all([
    Templates.updateIndex(s3, config),
    Templates.updateError(s3, config),
    Templates.updatePublish(s3, config)
  ]).then(() => { callback(null) })
    .catch(err => { callback(err); });
}
