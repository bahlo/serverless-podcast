'use strict';

const fs = require('fs'),
      Bluebird = require('bluebird'),
      pug = require('pug'),
      moment = require('moment'),
      yaml = require('js-yaml'),
      AWS = require('aws-sdk');

const config = yaml.safeLoad(
  fs.readFileSync(`config.${process.env.STAGE}.yml`, 'utf8'));

AWS.config.setPromisesDependency(Bluebird);
AWS.config.update({ region: config.region });

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const listEpisodes = (s3, config) => {
  // Get all objects
  return s3
    .listObjects({ Bucket: config.bucket }).promise()
    .then(data => {
      // Filter by .mp3 suffix
      return Bluebird.all(data.Contents.filter(item => {
        const matches = item.Key.match(/.mp3$/);
        return matches !== null
      }));
    });
}

const fetchMetadata = (s3, config, episodes) => {
  return Bluebird.all(episodes.map(item => {
    const params = {
      Bucket: config.bucket,
      Key: item.Key
    };

    return s3
      .headObject(params).promise()
      .then(head => {
        return {
          title: head.Metadata.title || item.Key.slice(0, -4),
          description: head.Metadata.description,
          pubDate: moment(head.Metadata.date).toDate(),
          url: config.podcast.baseURL + '/' + item.Key.split(' ').join('+'),
          contentType: head.ContentType,
          size: item.Size,
          author: head.Metadata.author,
          duration: head.Metadata.duration,
          imageURL: head.Metadata['image-url'],
          explicit: head.Metadata.explicit
        };
      });
  }));
}

const sortEpisodes = (episodes) => {
  return episodes.sort((a, b) => {
    if (a.pubDate.getTime() > b.pubDate.getTime()) {
      return -1;
    } else if (a.pubDate.getTime() < b.pubDate.getTime()) {
      return 1;
    }

    // If equal
    return 0;
  })
}

const updateFeed = (s3, config, episodes) => {
  const xml = pug.renderFile('feed.pug', {
    podcast: config.podcast,
    episodes
  });

  return s3.putObject({
    Bucket: config.bucket,
    Key: 'feed.xml',
    Body: xml,
    ContentType: 'text/xml; charset=utf-8',
    ACL: 'public-read'
  }).promise()
}

const updateIndex = (s3, config) => {
  const html = pug.renderFile('index.pug', config.podcast)

  return s3.putObject({
    Bucket: config.bucket,
    Key: 'index.html',
    Body: html,
    ContentType: 'text/html; charset=utf-8',
    ACL: 'public-read'
  }).promise()
}

module.exports.updateFeed = (event, context, callback) => {
  listEpisodes(s3, config)
    .then(episodes => fetchMetadata(s3, config, episodes))
    .then(episodes => sortEpisodes(episodes))
    .then(episodes => updateFeed(s3, config, episodes))
    .then(() => { callback(null) })
    .catch(err => { callback(err); });
};

module.exports.updateIndex = (event, context, callback) => {
  updateIndex(s3, config)
    .then(() => { callback(null) })
    .catch(err => { callback(err); });
}
