import WebSocket from 'isomorphic-ws';
export async function connectWS(url: string): Promise<WebSocket> {
  return new Promise(function (resolve, reject) {
    var server = new WebSocket(url);

    server.onopen = () => {
      resolve(server);
    };

    const interval = setInterval(() => {
      if (server.readyState !== 1) {
        return;
      }

      server.send('ping');
    }, 3000);

    server.onerror = (err: any) => {
      clearInterval(interval);
      reject(err);
    };

    server.onclose = () => {
      clearInterval(interval);
      console.log('connection closed');
    };
  });
}
