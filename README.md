grimearchive
=========

This is the source code for grimearchive.org, a hosting site for recordings of grime mixes and sets. It's currently hosted at grimearchive.org

## Installation

This is a Node app that uses a Mongodb database. Both are required as well as FFMPeg, an audio/video editing library which can be installed with your package manager of choice. Once all three are installed run:

```shell
npm install
```

For local development:
```shell
grunt builddev
grunt work
```

For production deployment:
```shell
grunt buildprod
./bin/www
```

Linting:
```shell
grunt checkcode
```

The following environment variables must also be set:
```
COOKIE_SECRET // Secret string to use for session management
DATABASE_URL // Mongo database url
ADMIN_PASSWORD // SHA256 encypted password for admin access to mixes
AWS_S3_BUCKET // AWS S3 bucket to upload mixes to
```