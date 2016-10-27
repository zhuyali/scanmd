'use strict'

var fs = require('fs');
var koa = require('koa');
var hyperdown = require('hyperdown');
var ws = require('ws');
var http = require('http');
var child_process = require('child_process');

module.exports = function() {

  var app = koa();
  var parser = new hyperdown;
  var server = http.createServer();
  var WebSocketServer = ws.Server;
  var wss = new WebSocketServer({server: server});

  //本地使用8888端口监听
  var port = 8888;
  var url = `localhost:${port}`;

  //获取当前执行路径
  var args = process.argv.slice(2);
  var file = args[0];

  if (!fs.existsSync(file)) {
    file = file + '.md';
  }

  app.use(function *() {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      this.body = constructBody(file);
    } else {
      console.log('Please check you files~');
    }
  });

  wss.on('connection', function connection(ws) {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      fs.watchFile(file, function() {
        var content = fs.readFileSync(file, 'utf8');
        var html = parser.makeHtml(content);
        ws.send(html);
      })
    } else {
      console.log('Please check you files~');
    }
  });

  child_process.exec(`open http://${url}`);

  server.on('request', app.callback());

  server.listen(port, function() {
    console.log('Listening on ' + server.address().port);
  });

  app.on('error', function(err) {
    console.error('server error', err);
  });

  function constructBody(file) {
    var content = fs.readFileSync(file, 'utf8');
    var html = parser.makeHtml(content);
    return `<!DOCTYPE html>
    <html>
      <script src="http://cdn1.showjoy.com/assets/f2e/joyf2e/vendor/0.0.20/jquery/jquery.js" >
      </script>
      <head>
        <meta charset="UTF-8">
          <title>
            ${file}
          </title>
      </head>
      <body>
        <div style="width:80%;font-family: Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif;margin:0 auto;">
        ${html}
        </div>
      </body>
      <script>
        var socket;
        if (window.WebSocket) {
          socket = new WebSocket('ws://localhost:8888/');
          socket.onmessage = function(event) {
            $("div").html('');
            $("div").html(event.data);
          }
        } else {
          alert('Your browser does not support Websockets');
        }
      </script>
    </html>`;
  }
};

