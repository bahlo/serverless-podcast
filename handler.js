'use strict';

const fs = require('fs'),
      Bluebird = require('bluebird'),
      pug = require('pug'),
      moment = require('moment'),
      yaml = require('js-yaml'),
      AWS = require('aws-sdk');

AWS.config.setPromisesDependency(Bluebird);
AWS.config.update({ region: 'eu-central-1' });

const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const config = yaml.safeLoad(
  fs.readFileSync(`config.${process.env.STAGE}.yml`, 'utf8'));

module.exports.generateFeed = (event, context, callback) => {
  s3.listObjects({ Bucket: config.bucket }).promise()
    // Get metadat for each object
    .then(data => {
      return Bluebird.all(data.Contents.filter(item => {
        var matches = item.Key.match(/.mp3$/);
        return matches !== null
      }).map(item => {
        return s3.headObject({
          Bucket: config.bucket,
          Key: item.Key
        }).promise()
        .then(head => {
          return Bluebird.resolve({
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
          });
        });
      }));
    })
    // Render template and put feed.xml
    .then(episodes => {
      var xml = pug.renderFile('feed.pug', {
        podcast: config.podcast,
        episodes
      });

      return s3.putObject({
        Bucket: config.bucket,
        Key: 'feed.xml',
        Body: xml,
        ContentType: 'application/rss+xml; charset=utf-8',
        ACL: 'public-read'
      }).promise()
    })
    .then(() => {
      callback(null)
    })
    .catch(err => {
      callback(err);
    });
};
