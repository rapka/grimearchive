grimearchive
=========

This is the source code for Grime Archive, a hosting site for recordings of grime mixes and sets. It's currently hosted at grimearchive.org.

## Installation

# Requirements

- Node 14+
- MongoDB 4+
- A valid AWS S3 bucket to store uploads

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
npm start
```

Linting:
```shell
npm run lint
```

The following environment variables are required to be set:
```
COOKIE_SECRET // Secret string to use for session management
DATABASE_URL // Mongo database url
ADMIN_PASSWORD // SHA256 encypted password for admin access to mixes
AWS_S3_BUCKET // AWS S3 bucket to upload mixes to
```