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
            author: head.Metadata.author,
            size: item.Size,
            url: process.env.BASE_URL + '/' + item.Key.split(' ').join('+'),
            date: moment(head.Metadata.date).toDate(),
            contentType: head.ContentType,
            duration: head.Metadata.duration,
            description: head.Metadata.description,
          });
        });
      }));
    })
    // Render template and put feed.xml
    .then(entries => {
      var xml = pug.renderFile('feed.pug', {
        title: process.env.TITLE,
        description: process.env.DESCRIPTION,
        url: process.env.URL,
        imageURL: process.env.IMAGE_URL,
        author: {
          email: process.env.AUTHOR_EMAIL,
          name: process.env.AUTHOR_NAME
        },
        keywords: process.env.KEYWORDS,
        category: process.env.CATEGORY,
        now: new Date(),
        entries
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
