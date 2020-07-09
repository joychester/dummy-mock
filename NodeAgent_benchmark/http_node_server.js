//help info: https://github.com/nodejs/node/issues/26357
//help info: https://github.com/node-modules/agentkeepalive

const http = require('http');
const AgentKA = require('agentkeepalive');
const { exec } = require("child_process");

// Backend mock service
const backend_service_host = "127.0.0.1.9091";

const defaultAgent = new http.Agent({
  keepAlive: false
});

const optimaldefaultAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxFreeSockets: 10,
  maxSockets: 100,
  timeout: 60000
});

const keepaliveAgent = new AgentKA({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 100,
  maxFreeSockets:10,
  timeout: 60000,
  freeSocketTimeout: 15000
});

const options = {
  host: '127.0.0.1', 
  port: '9091',
  path: '/',
  method: 'GET',
  agent: optimaldefaultAgent //could be: optimaldefaultAgent, keepaliveAgent, defaultAgent or false
};

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

setInterval(() => {
  exec(`netstat -ant | grep TIME_WAIT | grep ${backend_service_host} | wc -l`, (error, stdout, stderr) => {
      console.log(`Sockets in TIME_WAIT: ${stdout}`);
  });
  exec(`netstat -ant | grep ESTABLISHED | grep ${backend_service_host} | wc -l`, (error, stdout, stderr) => {
    console.log(`Sockets in ESTABLISHED: ${stdout}`);
  });
}, 3000);
