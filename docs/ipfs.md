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

Returns: `Promise<statusResponse>` 

The statusResponse object contains:

- peername - name of pinning peer
- status - pin status 
- ipfs_peer_id - peer ID
- ipfs_peer_addresses - peer addresses   
- timestamp
- error
- attempt_count
- priority_pin - boolean indicating if pinned with priority
- metadata - pin metadata
- created - ISO date string

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

Returns: `Promise<pinResponse>`

The pinResponse object contains:

- message - pinning result message
- result - pin result object 
- listenTo - socket details to listen for pinning progress
