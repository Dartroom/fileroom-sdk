export function propagateErrors(json: any) {
  if (json && json.errors) {
    let error = json.errors[0];
    let status = (error.status as number) || 404;
    let message = error.message;

    throw new Error('API_ERROR: ' + status + ' ' + 'reason: ' + message);
  }
}
