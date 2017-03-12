'use strict';

const pug = require('pug');

const unescape = function(value) {
  return value
    .replace(/&auml;/g, 'ä')
    .replace(/&Auml;/g, 'Ä')
    .replace(/&uuml;/g, 'ü')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&ouml;/g, 'ö')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&szlig;/g, 'ß')
}

module.exports.updateIndex = (s3, config, episodes) => {
  let data = config.podcast
  data.episodes = episodes.map(episode => {
    episode.title = unescape(episode.title)
    episode.description = unescape(episode.description)
    episode.author = unescape(episode.author)
    return episode
  })

  const html = pug.renderFile('views/index.pug', data)

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

module.exports.updateSuccess = (s3, config) => {
  const html = pug.renderFile('views/success.pug', config.podcast)

  return s3.putObject({
    Bucket:      config.bucket,
    Key:         'success.html',
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
