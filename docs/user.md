# User API

The User API allows you to manage user accounts and authentication in Fileroom. 

## Usage

Import the UserAPI from the client:

```js
const { user } = client;
```

## Methods

### login(options) 

Log in an existing user and retrieve an access token.

There are two ways to call the login method:

With username and password:

```js
const token = await user.login({
  username: 'myusername', 
  password: 'mypassword'
});
```

With a Dartroom auth token:

```js
const token = await user.login({
  dartroomToken: 'dartroom_auth_token' 
});
```

The login options are:

| Option | Type | Description |
|-|-|-|
| username | string | The user's username |
| password | string | The user's password |
| dartroomToken | string | The user's Dartroom auth token |

One of `username` & `password` or `dartroomToken` is required.

Returns: `Promise<{data: string}>` - The returned `token` can be used to authenticate further requests.

### validateToken()

Validates the user's access token.

```js
const isValid = await user.validateToken();
```

Returns: `Promise<{isValid: boolean}>` - Returns whether the token is valid.

### create(options)

Creates a new user account.

```js
const {id, token} = await user.create({
  username: 'newuser',
  email: 'newuser@example.com',
  password: 'password123' 
});
```

The create options are:

| Option | Type | Description |
|-|-|-|
| userId | string | The Dartroom user ID (optional) |  
| email | string | The user's email address |
| password | string | The user's password |

At least `email` and `password` are required.

Returns: `Promise<{id: string, token: string}>` - The new user's ID and an access token.
### update(options)

Updates the user's account settings.

```js
await user.update({
  addIP: '192.168.0.1',
  restrictDomains: true
});
```

The update options are:

| Option | Type | Description |
|-|-|-|
| addIP | string | IP address to allow |
| removeIP | string | IP address to deny |
| addDomain | string | Domain to allow | 
| removeDomain | string | Domain to deny |
| restrictIPs | boolean | Restrict access to allowed IPs |
| restrictDomains | boolean | Restrict access to allowed domains |
| showAll | boolean | Whether to show all files or only latest |

Returns: `Promise<updateUserResponse>` - updateUserResponse is:

```ts
interface updateUserResponse {
  data: {
    updated: FileDoc; // the updated user document
  }
}
```

So it returns the updated user document.
