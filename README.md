# serverless-podcast

Ever wanted to start podcasting?
Now is your chance, it doesn't get easier than going serverless.

## What you need

- An AWS account
- serverless [installed](https://serverless.com/framework/docs/providers/aws/guide/installation/) and [configured](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

## Setup

### Local
1. Run `npm install`
2. Copy `config.sample.yml` to `config.prod.yml` and edit to your needs
3. Run `serverless deploy`
4. Run `serverless invoke updateIndexError` to generate the HTML files 
   (this is only needed after config changes).
5. Run `serverless invoke updatePublish` to generate publish page (done at 00:00 every day)

## AWS
1. Enable _Static Website Hosting_ (which is currently
[not possible](http://forum.serverless.com/t/add-additional-configuration-to-an-s3-bucket-with-a-dynamic-name/705)
with serverless) and set _Index Document_ to `index.html` and _Error Document_
to `error.html`.
2. Create an IAM user with a policy (example below)
3. Add the bucket URLs and credentials of the user to your `config.prod.yml`
4. If you want to use a custom domain, you need to enable CORS (example below)

### Example IAM policy
```json
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

### Example CORS configuration
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <MaxAgeSeconds>3000</MaxAgeSeconds>
    </CORSRule>
    <CORSRule>
        <AllowedOrigin>domain.com</AllowedOrigin>
        <AllowedMethod>POST</AllowedMethod>
        <MaxAgeSeconds>3000</MaxAgeSeconds>
    </CORSRule>
</CORSConfiguration>
```

## Usage

Go to `http://mybucket.com/publish.html`, fill out the fields and click publish.
It's that easy.

## License

This project is licensed under MIT, for more information see the `LICENSE`
file.
