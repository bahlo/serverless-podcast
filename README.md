# serverless-podcast

Ever wanted to start podcasting?
Now is your chance, it doesn't get easier than going serverless.

## What you need

- An AWS account
- serverless [installed](https://serverless.com/framework/docs/providers/aws/guide/installation/) and [configured](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

## Setup

1. Run `npm install`
2. Copy `config.sample.yml` to `config.prod.yml` and edit to your needs
3. Run `serverless deploy`

You need to configure your bucket further (which seems
[not possible](http://forum.serverless.com/t/add-additional-configuration-to-an-s3-bucket-with-a-dynamic-name/705) with serverless at the moment).

1. Enable _Static Website Hosting_ and set _Index Document_ to `index.html` and
_Error Document_ to `error.html`.
2. Go to _Permissions_ and set the Bucket Policy to the following:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-bucket/*"
        }
    ]
}
```

## Usage

Upload any mp3 file to your bucket with the following metadata and the feed.xml
will update.

- `x-amz-meta-duration` (e.g. 23:42)
- `x-amz-meta-date` (e.g. 2016-12-31 02:58)
- `x-amz-meta-author`
- `x-amz-meta-description` (optional)
- `x-amz-meta-title`

## License

This project is licensed under MIT, for more information see the `LICENSE`
file.
