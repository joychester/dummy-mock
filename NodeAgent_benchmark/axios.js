const http = require('http');
const axios = require('axios');
const { exec } = require("child_process");

const backend_service_host = "127.0.0.1.9091";

const requestConfig = {
  method: 'get',
  url: '/',
  baseURL: 'http://localhost:9091',
  httpAgent: false // or new http.Agent({ keepAlive: true })
};

//handle incoming requests
const server = http.createServer(function (request, response) {
  axios(requestConfig).then(res => {
    response.end(`${res.status}`);
  });
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
