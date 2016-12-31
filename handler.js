'use strict';

const AWS = require('aws-sdk');
const Bluebird = require('bluebird');
const pug = require('pug');
const moment = require('moment');

AWS.config.setPromisesDependency(Bluebird);
AWS.config.update({
  region: 'eu-central-1'
});

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports.generateFeed = (event, context, callback) => {
  s3.listObjects({ Bucket: process.env.BUCKET }).promise()
    // Get metadat for each object
    .then(data => {
      return Bluebird.all(data.Contents.filter(item => {
        var matches = item.Key.match(/.mp3$/);
        return matches !== null
      }).map(item => {
        return s3.headObject({
          Bucket: process.env.BUCKET,
          Key: item.Key
        }).promise()
        .then(head => {
          return Bluebird.resolve({
            title: head.Metadata.title || item.Key.slice(0, -4),
            description: head.Metadata.description,
            pubDate: moment(head.Metadata.date).toDate(),
            url: process.env.BASE_URL + '/' + item.Key.split(' ').join('+'),
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
        podcast: {
          title: process.env.TITLE,
          link: process.env.LINK,
          description: process.env.DESCRIPTION,
          language: process.env.LANGUAGE,
          author: process.env.AUTHOR,
          keywords: process.env.KEYWORDS,
          explicit: process.env.EXPLICIT,
          imageURL: process.env.IMAGE_URL,
          email: process.env.EMAIL,
          category: process.env.CATEGORY,
          subcategories: (process.env.SUB_CATEGORIES || '').split(','),
          episodes
        }
      });

      return s3.putObject({
        Bucket: process.env.BUCKET,
        Key: 'feed.xml',
        Body: xml,
        ContentType: 'application/rss+xml; charset=utf-8'
      }).promise()
    })
    .then(() => {
      callback(null)
    })
    .catch(err => {
      callback(err);
    });
};
