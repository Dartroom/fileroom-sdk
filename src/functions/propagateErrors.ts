export function propagateErrors(json: any) {
  if (json && json.errors) {
    let error = json.errors[0];
    let status = (error.status as number) || 404;
    let message = status >= 403 ? 'NOT_FOUND' : error.message;
    status = status >= 403 ? 404 : status;

    throw new Error('API_ERROR: ' + message + ' ' + status);
  }
}
