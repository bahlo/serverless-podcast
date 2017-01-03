'use strict';

const pug = require('pug');

module.exports.updateIndex = (s3, config) => {
  const html = pug.renderFile('views/index.pug', config.podcast)

  return s3.putObject({
    Bucket:      config.bucket,
    Key:         'index.html',
    Body:        html,
    ContentType: 'text/html; charset=utf-8',
    ACL:         'public-read',
    CacheControl: 'no-cache'
  }).promise()
}

module.exports.updateError = (s3, config) => {
  const html = pug.renderFile('views/error.pug', config.podcast)

  return s3.putObject({
    Bucket:      config.bucket,
    Key:         'error.html',
    Body:        html,
    ContentType: 'text/html; charset=utf-8',
    ACL:         'public-read',
    CacheControl: 'no-cache'
  }).promise()
}

module.exports.updateFeed = (s3, config, episodes) => {
  const xml = pug.renderFile('views/feed.pug', {
    podcast: config.podcast,
    episodes
  });

  return s3.putObject({
    Bucket: config.bucket,
    Key: 'feed.xml',
    Body: xml,
    ContentType: 'text/xml; charset=utf-8',
    ACL: 'public-read',
    CacheControl: 'no-cache'
  }).promise()
}

module.exports.updatePublish = (s3, config, auth) => {
  const html = pug.renderFile('views/publish.pug', { config, auth });

  return s3.putObject({
    Bucket: config.bucket,
    Key: 'publish.html',
    Body: html,
    ContentType: 'text/html; charset=utf-8',
    ACL: 'public-read',
    CacheControl: 'max-age=3600'
  }).promise()
}
