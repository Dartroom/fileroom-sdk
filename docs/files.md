# Files API

The Files API allows you to manage files in Fileroom.

## Usage

Import the FilesAPI from the client:

```js
const { files } = client;
```

## Methods

### list(options)

List a user's files. 

```js
const files = await files.list();
```

| Option | Description |
|-|-|  
| limit | Number of files to return |
| skip | Number of files to skip |
| sortDsc | Sort descending |
| sortBy | Field to sort by |

Returns:

```json 
{
  "data": {
    "docs": [
      {
        "_id": "63f33b3d20b07f001a5a1658",
        "name": "image.png",  
        "cid": "Qabc123",
        "size": 85910,
        ...
      }
    ],
    "totalDocs": 1,
    "limit": 10,
    "offset": 0,    
    "totalPages": 1,
    "page": 1,
    "pagingCounter": 1,  
    "hasPrevPage": false,
    "hasNextPage": false,
    "prevPage": null,
    "nextPage": null
  }
}

```

### awaitUpload(id)

Wait for an uploaded file and return it when available.

```js
const file = await files.awaitUpload(fileId);
```

| Parameter | Description |
|-|-|
| id | The file ID to wait for |

Returns: 

```json
{
  "data": {
    "_id": "63f33b3d20b07f001a5a1658",
    "name": "image.png", 
    "cid": "Qabc123",
    "size": 85910,
    ...
  }
}
```

### deleteOne(options)

Delete a file by CID or docID.

```js
await files.deleteOne({ cid: 'Qabc123...' });
```

| Option | Description |  
|-|-|
| cid | The file CID |
| docID | The file document ID |

Returns:

```json
{
  "data": {
    "deleted": true,
    "docID": "63f33b3d20b07f001a5a1658",
    "modified": [
      {
        "_id": "63f33b3d20b07f001a5a1658",
        "deleted": true
      }
    ],
    "deletedItems": [
      "Qabc123"
    ],
    "filesDeleted": 1,
    "storageSaved": 85910
  }
}
```

### deleteMany(cids)

Delete multiple files by CID.

```js
await files.deleteMany(['Qabc123', 'Qxyz456']);
```

| Parameter | Description |
|-|-|
| cids | Array of file CIDs |

Returns:

```json
{
  "data": {
    "deleted": true,
    "modified": [
      {
        "_id": "63f33b3d20b07f001a5a1658",
        "deleted": true
      },
      {
        "_id": "63f33b3d20b07f001a5a1659",
        "deleted": true  
      }
    ],
    "deletedItems": [
      "Qabc123",
      "Qxyz456" 
    ],
    "filesDeleted": 2,
    "storageSaved": 171820
  }
}
```


### uploadFiles(files, options)

Upload files with progress events. 

This method returns an UploadApi instance that emits events for upload progress and results.

| Parameter | Description |  
|-|-|
| files | The file or array of files to upload |
| options | Global upload options or an array of options for each file <br><br> - resize - Array of preview sizes to generate <br><br> - replaceId - CID or docID of file to replace <br><br> - resizeOptions - Sharp resize options (fit, position, etc) <br><br> - name - Custom name for the file |

The UploadApi instance returned has methods like `start` to control the upload.

See the [UploadApi documentation](/docs/upload.md) for full details on its usage.


### exists(search)

Check if a file exists by CID or other identifier.

```js
const exists = await files.exists('Qabc123');
```

| Parameter | Description | 
|-|-|
| search | CID, integrity hash, or OjHash to search for |

Returns:

```json
{
  "data": {
    "exists": true
  }
}
```

