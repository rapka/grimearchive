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

Mix files are uploaded to AWS S3. A configuration file called `aws.json` in the root of the project with your AWS credentials. See: http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-json-file.html