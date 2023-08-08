# fileroom-sdk

[![codecov](https://codecov.io/gh/Dartroom/fileroom-sdk/branch/38-add-ci-tests/graph/badge.svg?token=TXH86BPCH2)](https://codecov.io/gh/Dartroom/fileroom-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A package to interact with the fileroom-api for both the browser and nodejs.

- [Requirements](#requirements)
- [Installation](#installation)
- [ Basic Usage](#usage)
- [SDK Reference](#sdk-reference)
- [Tests](#tests)
- [License](#license)

## Requirements

Use of this SDK requires the following:

- Node.js 16 or higher
- Chrome 89 or higher, firefox 87 or higher, or safari 14 or higher

## Installation

### nodejs

```sh
 npm install @dartroom/fileroom-sdk
#or
    yarn add @dartroom/fileroom-sdk
#or
    pnpm add @dartroom/fileroom-sdk
```

### browser

```html
<script src="https://cdn.jsdelivr.net/npm/@dartroom/fileroom-sdk"></script>
```

```javascript
// with a CDN, the SDK is available on the window object
const { Client } = Fileroom; // window.Fileroom
let client = new Client({
  accessToken: '<your access token>',
});
```

### Usage

**Commonjs with promises**

```js
const { Client } = require('@dartroom/fileroom-sdk');

const client = new Client({
  accessToken: 'your token', // optional
});
// import the ipfs and user api
let { ipfs, user } = client;

user
  .login({ username: 'username', password: 'password' })
  .then(res => {
    // do something with the response
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
```

**ES modules or Typescript with async/await**

```typescript
import { Client } from '@dartroom/fileroom-sdk';

const client = new Client({
  accessToken: 'your token', // optional
});

// import the ipfs and user api
let { ipfs, user } = client;

try {
  let res = await user.login({ username: 'username', password: 'password' });
  // do something with the response
  console.log(res);
} catch (err) {
  console.log(err);
}
```

## SDK Reference

- [Client]
- [UserAPI]
- [IpfsAPI]
- [FilesAPI]

## Tests

First, clone the repo locally and cd into the directory

```sh
git clone https//github.com/dartroom/fileroom-sdk.git
cd fileroom-sdk
```

Next, create a .env file, and add the following environment variables

```sh
#credentials for test Fileroom Dev User
TEST_DEV_USERNAME='your test fileroom dev username' ## this can be a random username
TEST_DEV_PASSWORD= 'your test fileroom dev password' ## this can be a random password
TEST_DEV_API_KEY='any active api key for the test fileroom dev user'

# fileroom Environment
FILEROOM_ENV='test | production| beta'
TEST_FILECID= "your test file cid"

```

**Note:** Setting the FIREROOM_ENV to 'test' will run the tests against the a locally run fileroom instance, If this variable is not set, the tests will default to the fileroom production environment.

Finally, run the tests.

```sh
  npm test
  # run tests in watch mode
    npm run test:watch
```

## License

MIT License (MIT), see [LICENSE](LICENSE).

[client]: docs/client.md
[userapi]: docs/user.md
[ipfsapi]: docs/ipfs.md
[filesapi]: docs/files.md
