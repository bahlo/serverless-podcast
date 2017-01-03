# serverless-podcast

Ever wanted to start podcasting?
Now is your chance, it doesn't get easier than going serverless.

## What you need

- An AWS account
- serverless [installed](https://serverless.com/framework/docs/providers/aws/guide/installation/) and [configured](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

## Setup

### Local
- Run `npm install`
- Copy `config.sample.yml` to `config.prod.yml` and edit to your needs
- Run `serverless deploy`
- Run `serverless invoke updateHTML` to generate HTML files (this is only
   needed after config changes).

## AWS
- Enable _Static Website Hosting_ (which is currently
[not possible](http://forum.serverless.com/t/add-additional-configuration-to-an-s3-bucket-with-a-dynamic-name/705)
with serverless) and set _Index Document_ to `index.html` and _Error Document_
to `error.html`.
- Create an IAM user with a policy like this:
```json`
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::my-bucket/*"
            ]
        }
    ]
}
```
- Add the bucket URLs and credentials of the user to your `config.prod.yml`

## Usage

Go to `http://mybucket.com/publish.html`, fill out the fields and click publish.
It's that easy.

## License

This project is licensed under MIT, for more information see the `LICENSE`
file.
