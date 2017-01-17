'use strict';

const Bluebird = require('bluebird'),
      pug      = require('pug'),
      moment   = require('moment');

module.exports.list = (s3, config) => {
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
};

module.exports.fetchMetadata = (s3, config, episodes) => {
  return Bluebird.all(episodes.map(item => {
    const params = {
      Bucket: config.bucket,
      Key: item.Key
    };

    return s3
      .headObject(params).promise()
      .then(head => {
        const matches = item.Key.match('episodes/(.+.mp3)$');
        if (matches === null || matches.length < 2) {
          return // Invalid key
        }
        const filename = matches[1];

        return {
          title: head.Metadata.title || filename,
          description: head.Metadata.description,
          pubDate: moment(head.Metadata.date).toDate(),
          url: config.podcast.baseURL + '/episodes/' +
            encodeURIComponent(filename),
          contentType: head.ContentType,
          size: item.Size,
          author: head.Metadata.author,
          duration: head.Metadata.duration,
          imageKey: head.Metadata['image-key'],
          explicit: head.Metadata.explicit
        };
      });
  }));
};

module.exports.sort = (episodes) => {
  return episodes.sort((a, b) => {
    if (a.pubDate.getTime() > b.pubDate.getTime()) {
      return -1;
    } else if (a.pubDate.getTime() < b.pubDate.getTime()) {
      return 1;
    }

    // If equal
    return 0;
  })
};
