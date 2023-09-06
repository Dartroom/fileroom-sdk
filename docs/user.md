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

Returns:

```json
{
  "data": "xyz123..." 
}
```


### validateToken()

Validates the user's access token.

```js
const isValid = await user.validateToken(); 
```

Returns: 

```json
{
  "isValid": true
}
```

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

Returns:

```json 
{
  "id": "user123",
  "token": "xyz984..." 
}
```

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

Returns: 

```json
{
  "data": {
    "updated": {
      "addIP": "192.168.0.1",
      "restrictDomains": true 
    }
  }
}
```


### stats(options)

Get the user's account stats.

```js 
const stats = await user.stats(
  {to:'', // Date in MM/DD/YYYY format
   from:"" // Date in MM/DD/YYYY format
  }
);
```

The stats options are:

| Option | Type | Description |
|-|-|-|
| to | string | End date in MM/DD/YYYY format |
| from | string | Start date in MM/DD/YYYY format |

Returns: 

```json 
 {
  "data" :{
  "storageUsage": 2309978,
  "filesUploaded": 147,
  "uploadLimit": 1048576000000,
  "storageLimit": 100737418240000,
  "filesRecentlyStored": 0,
  "monthlyStats": [
    {
      "month": "August",
      "year": 2023,
      "bandwidthUsage": 0,
      "filesUploaded": 363,
      "requests": 363
    },
    {
      "month": "September",
      "year": 2023,
      "bandwidthUsage": 6152223847,
      "filesUploaded": 89,
      "requests": 131
    }
  ]
}

  
 }

```