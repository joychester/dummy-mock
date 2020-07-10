//https://github.com/nodejs/node/issues/26357
//https://github.com/node-modules/agentkeepalive

const http = require('http');
const AgentKA = require('agentkeepalive');
const { exec } = require("child_process");
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const backend_service_host = "127.0.0.1.9091";

const defaultAgent = new http.Agent({
  keepAlive: false
});

const optimaldefaultAgent = new http.Agent({
  keepAlive: true, // Keep sockets around in a pool to be used by other requests in the future
  keepAliveMsecs: 30000, // specifies the initial delay for TCP Keep-Alive packets
  maxFreeSockets: 10, // Maximum number of sockets to leave open in a free state
  maxSockets: 100, // Maximum number of sockets to allow per host
  timeout: 60000, // Socket timeout in milliseconds
  scheduling: 'fifo' //Scheduling strategy to apply when picking the next free socket to use, or 'lifo'
});

const keepaliveAgent = new AgentKA({
  keepAlive: true, // Keep sockets around in a pool to be used by other requests in the future
  keepAliveMsecs: 30000, // specifies the initial delay for TCP Keep-Alive packets
  maxSockets: 100, // Maximum number of sockets to allow per host
  maxFreeSockets:10, // Maximum number of sockets (per host) to leave open in a free state
  timeout: 60000, // Sets the working socket to timeout after timeout milliseconds of inactivity on the working socket
  freeSocketTimeout: 15000, // Sets the free socket to timeout after freeSocketTimeout milliseconds of inactivity on the free socket.
  socketActiveTTL: null // Sets the socket active time to live, even if it's in use. avoid the TCP connection leak
});

const options = {
  host: '127.0.0.1', 
  port: '9091',
  path: '/',
  method: 'GET',
  agent: optimaldefaultAgent // keepaliveAgent or defaultAgent or false
};

if (cluster.isMaster) {

  setInterval(() => {
    exec(`netstat -ant | grep TIME_WAIT | grep ${backend_service_host} | wc -l`, (error, stdout, stderr) => {
        console.log(`Sockets in TIME_WAIT: ${stdout}`);
    });
    exec(`netstat -ant | grep ESTABLISHED | grep ${backend_service_host} | wc -l`, (error, stdout, stderr) => {
      console.log(`Sockets in ESTABLISHED: ${stdout}`);
    });
  }, 3000);


  console.log(`Master ${process.pid} is running`);

  //Fork workers == CPU cores, Mac OS seems only bothers 0,2,4,6 cores??
  for (let i = 0 ; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

} else {
  //handle incoming requests
  const server = http.createServer(function (request, response) {
    //console.log(request.url);
    const proxy_req = http.request(options, res => {
      //console.log('STATUS: ' + res.statusCode);
      res.setEncoding('utf-8');
      res.on('data', function (chunk) {
        //console.log('BODY: ' + chunk);
      });
      res.on('end', () => {
        response.end(`${res.statusCode}`);
      })
    });
    proxy_req.end();
  });

  // listen for incoming requests
  server.listen(5000);

  console.log('Nodejs server is running against 5000 port');
  console.log(`Worker ${process.pid} started`);
}
