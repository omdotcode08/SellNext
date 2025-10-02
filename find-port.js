const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // Port is available
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false); // Port is in use
    });
  });
}

async function findAvailablePort(startPort = 4000) {
  for (let port = startPort; port <= startPort + 100; port++) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      console.log(`Available port found: ${port}`);
      return port;
    }
  }
  throw new Error('No available port found');
}

findAvailablePort().then(port => {
  console.log(`Use port: ${port}`);
}).catch(console.error);