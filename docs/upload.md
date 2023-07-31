The UploadApi class handles uploading files to Fileroom and provides progress events.

### Usage

Get the UploadApi instance from `files.uploadFiles()`:

```js
const upload = await files.uploadFiles(myFiles);
```

### Events

- **progress**: Emitted during upload of a single file. The handler receives a `ProgressEvent` object with progress percentages:

```js
upload.on('progress', (progressEvent) => {
  // progressEvent.overallProgress 
})
```

- **completed**: Emitted when a single file finishes uploading. The handler receives the file `UploadResult`: 

```js 
upload.on('completed', (result) => {
  // result.file 
})
```

- **error**: Emitted if there is an error uploading. The handler receives an `Error` object:

```js
upload.on('error', (err) => {
  // err 
})
```

- **globalProgress**: Emitted during upload of multiple files. The handler receives overall `ProgressEvent`:

```js
upload.on('globalProgress', (progress) => {
  // progress.overallProgress
})
```

- **allCompleted**: Emitted when all files complete. The handler receives `UploadResult[]`:

```js 
upload.on('allCompleted', (results) => {
  // results array
})
```


