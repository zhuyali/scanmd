'use strict'

var child_process = require('child_process');
var fs = require('fs');
var koa = require('koa');
var HyperDown = require('hyperdown');

module.exports = function() {

  //本地使用8888端口监听
  var url = 'localhost:8888';

  //获取当前执行路径
  var args = process.argv.slice(2);
  var file = args[0];

  var parser = new HyperDown;
  var app = koa();

  if(!fs.existsSync(file)) {
    file = file + '.md';
  }


  app.use(function *() {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      var content = fs.readFileSync(file, 'utf8');
      var html = parser.makeHtml(content);
      this.body = html;
    } else {
      console.log('Please check you files~');
    }

  });

  app.listen(8888);

  child_process.exec('open http://' + url);

  app.on('error', function(err) {
    log.error('server error', err);
  });
}

