# Client

The client is the main entry point to the Fileroom SDK. It is used to initialize the SDK and access the various APIs.  

## Usage

To initialize the client:

```js
const { Client } = require('@dartroom/fileroom-sdk');

const client = new Client({
  accessToken: 'your_access_token' 
});
```

The client accepts a configuration object with the following properties:

| Option | Type | Description |
|-|-|-|  
| accessToken | `string` | The access token for authentication (optional) |
| env | `'production' \| 'test' \| 'beta'` | The environment to use (optional, defaults to `'production'`) |
| timeout | `number` | The request timeout in ms (optional, defaults to `60000`) |

**Note:** The client will validate the provided access token on initialization

Once initialized, the client provides access to the various APIs:

```js
const { ipfs, files, users } = client;
```

The available APIs are:

- `ipfs` - The [IpfsAPI](ipfs.md) for interacting with IPFS
- `files` - The [FilesAPI](files.md) for managing files
- `users` - The [UsersAPI](users.md) for managing user accounts

