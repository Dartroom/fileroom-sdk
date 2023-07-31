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

The options are:

- limit - Number of files to return
- skip - Number of files to skip
- sortDsc - Sort descending
- sortBy - Field to sort by

Returns: `Promise<{data: FileListReponse}>`

Where FileListResponse is:

```ts
interface FileListResponse {
  docs: FileDoc[];
  totalDocs: number;
  limit: number;
  offset: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}
```
### awaitUpload(id)

Wait for an uploaded file and return it when available.

```js
const file = await files.awaitUpload(fileId);
```

Parameters:

- id - The file ID to wait for

Returns: `Promise<{data: FileDoc}>` - The file document

### deleteOne(options)

Delete a file by CID or docID.

```js
await files.deleteOne({ cid: 'Qabc123...' });
```

Options:

- cid - The file CID
- docID - The file document ID

Returns: `Promise<{data: DeleteResponse}>`

Where DeleteResponse is:

```ts
interface DeleteResponse {
  deleted: boolean;
  docID?: FileDoc;
  modified?: FileDoc[];
  deletedItems?: string[];
  filesDeleted?: number;
  storageSaved?: number;
}
```

### deleteMany(cids)

Delete multiple files by CID.

```js
await files.deleteMany(['Qabc123', 'Qxyz456']);
```

Parameters:

- cids - Array of file CIDs

Returns: `Promise<{data: DeleteResponse}>`
### uploadFiles(files, options)

Upload files with progress events. 

This method returns an UploadApi instance that emits events for upload progress and results.

Parameters:

- files - The file or array of files to upload

- options - Global upload options or an array of options for each file

  - resize - Array of preview sizes to generate
  
  - replaceId - CID or docID of file to replace
  
  - resizeOptions - Sharp resize options (fit, position, etc)
  
  - name - Custom name for the file

The UploadApi instance returned has methods like `start` to control the upload.

See the [UploadApi documentation](/docs/upload.md) for full details on its usage.

### exists(search)

Check if a file exists by CID or other identifier.

```js
const exists = await files.exists('Qabc123');
```

Parameters:

- search - CID, integrity hash, or OjHash to search for

Returns: `Promise<{data: {exists: boolean}}>`
