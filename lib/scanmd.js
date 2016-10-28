'use strict';

var fs = require('fs');
var koa = require('koa');
var http = require('http');
var marked = require('marked');
var WebSocketServer = require('ws').Server;
var child_process = require('child_process');

var pkg = require('../package');
var constructBody = require('./constructBody');

module.exports = function() {

  var ws = null;
  var app = koa();
  var server = http.createServer();
  var wss = new WebSocketServer({server: server});

  //本地使用8888端口监听
  var port = 8888;
  var url = `localhost:${port}`;

  //获取当前执行路径
  var args = process.argv.slice(2);
  var file = args[0];

  if (!fs.existsSync(file) && !fs.existsSync(`${file}.md`)) {
    console.log('Please check your files.');
    process.exit(1);
  } else {
    child_process.exec(`open http://${url}`);
    server.listen(port, function() {
      console.log('Listening on ' + server.address().port + '...');
    });
  }

  app.use(function *() {
    this.body = constructBody(file);
  });

  wss.on('connection', function connection(_ws) {
    ws = _ws;
  });

  fs.watchFile(file, function() {
    var content = fs.readFileSync(file, 'utf8');
    var html = marked(content);
    ws && ws.send(html);
  });

  server.on('request', app.callback());

  app.on('error', function(err) {
    console.error('server error', err);
  });

};

