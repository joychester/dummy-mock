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
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxFreeSockets: 10,
  maxSockets: 100,
  timeout: 60000,
  scheduling: 'fifo'
});

const keepaliveAgent = new AgentKA({
  maxSockets: 100,
  maxFreeSockets:10,
  timeout: 60000,
  freeSocketTimeout: 30000
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

  //Fork workers
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
