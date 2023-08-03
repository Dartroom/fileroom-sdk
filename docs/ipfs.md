# IpfsAPI

The IpfsAPI allows you to interact with IPFS through Fileroom.

## Usage

Import the IpfsAPI from the client:

```js
const { ipfs } = client;
```

## Methods 

### status(cid)

Check the pinning status of a CID.

```js
const status = await ipfs.status('Qmabc123...');
```

Returns: 

```json
{
  "peername": "peer name",
  "status": "pinned", 
  "ipfs_peer_id": "peer id",
  "ipfs_peer_addresses": [
    "/ip4/127.0.0.1/tcp/4001/ipfs/QmPeerId"
  ],
  "timestamp": "ISO date string",
  "error": "",
  "attempt_count": 1,
  "priority_pin": true,
  "metadata": {},
  "created": "ISO date string"
}
```

### get(cid, options?)

Fetch a file from the gateway by CID.

```js
const stream = await ipfs.get('Qmabc123...');
```

| Option | Type | Description |
|-|-|-|
| origin | string | Gateway origin, defaults to Fileroom gateway |
| size | string | Preview size string (e.g. '200x200') |

Returns: `Promise<Stream>`

### pin(cid, options?)

Pin a CID to Fileroom's IPFS cluster.

```js 
await ipfs.pin('Qmabc123...');
```

| Option | Type | Description |
|-|-|-|
| resize | string[] | Array of preview size strings to generate on pinning |

Returns: 

```json
{
  "message": "pinned successfully",
  "result": {
    "docId": "doc id",
    "cid": "pinned cid",
    "previews": [
      {
        "cid": "preview cid 1",
        "size": "200x200" 
      },
      {
        "cid": "preview cid 2",
        "size": "400x400"
      }
    ]
  },
  "listenTo": {
    "wsUrl": "ws url",
    "event": "pinning_progress"
  }
}
```

