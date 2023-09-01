import crypto from 'crypto';


export  function generateApiKey() {
  return crypto.randomBytes(20).toString('hex');
}
