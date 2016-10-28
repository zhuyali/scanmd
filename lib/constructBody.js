'use strict';

var fs = require('fs');
var marked = require('marked');

module.exports = function (file) {
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
};
