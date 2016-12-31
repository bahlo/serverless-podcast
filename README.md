# serverless-podcast

Ever wanted to start podcasting?
Now is your chance, it doesn't get easier than going serverless.

## What you need

- An AWS account
- serverless [installed](https://serverless.com/framework/docs/providers/aws/guide/installation/) and [configured](https://serverless.com/framework/docs/providers/aws/guide/credentials/)
- An AWS S3 Bucket with Static Web Hosting enabled (set the index document
  to `feed.xml`) and this bucket policy (change the bucket name):

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

## Setup

1. Run `npm install`
2. Edit `config.yml` to your needs
3. Run `serverless deploy`

## Usage

Upload any mp3 file to your bucket with the following metadata and the feed.xml
will update.

- `x-amz-meta-duration` (e.g. 23:42)
- `x-amz-meta-date` (e.g. 2016-12-31 02:58)
- `x-amz-meta-author`
- `x-amz-meta-title`

## License

This project is licensed under MIT, for more information see the `LICENSE`
file.
