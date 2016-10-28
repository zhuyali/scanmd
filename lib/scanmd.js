'use strict'

var fs = require('fs');
var koa = require('koa');
var http = require('http');
var marked = require('marked');
var WebSocketServer = require('ws').Server;
var child_process = require('child_process');

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

  if (!fs.existsSync(file)) {
    file = file + '.md';
  }

  app.use(function *() {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      this.body = constructBody(file);
    } else {
      console.log('Please check your files~');
    }
  });

  wss.on('connection', function connection(_ws) {
    ws = _ws;
  });


  fs.watchFile(file, function() {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      var content = fs.readFileSync(file, 'utf8');
      var html = marked(content);
      ws && ws.send(html);
    } else {
      console.log('Please check your files~');
    }
  })


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
    var html = marked(content);
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

