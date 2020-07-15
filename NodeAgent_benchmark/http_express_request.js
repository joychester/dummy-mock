const express = require('express');
const request = require('request');
const { exec } = require("child_process");

const app = express();
const PORT = 5000;
const backend_service_host = "127.0.0.1.9091";

const options = {
  uri: 'http://127.0.0.1:9091/',
  method: 'GET',
  gzip: true
  //agent: keepaliveAgent // keepaliveAgent or defaultAgent or false
};

app.get('/', function(req, res) {
  //console.log('Start Calling API');
  
  request(options, function (err, response, body) {
    if(err) {
      console.log(err.message);
      return;
    }
    //console.log(body);
    res.end(`${response.statusCode}`);
  });
});

app.listen(PORT);

console.log(`Nodejs server is running against ${PORT} port`);

setInterval(() => {
  exec(`netstat -ant | grep TIME_WAIT | grep ${backend_service_host} | wc -l`, (error, stdout, stderr) => {
      console.log(`Sockets in TIME_WAIT: ${stdout}`);
  });
  exec(`netstat -ant | grep ESTABLISHED | grep ${backend_service_host} | wc -l`, (error, stdout, stderr) => {
    console.log(`Sockets in ESTABLISHED: ${stdout}`);
  });
}, 3000);
