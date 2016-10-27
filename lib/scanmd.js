'use strict'

var fs = require('fs');
var koa = require('koa');
var HyperDown = require('hyperdown');
var child_process = require('child_process');

module.exports = function() {

  var port = 8888;

  //本地使用8888端口监听
  var url = `localhost:${port}`;

  //获取当前执行路径
  var args = process.argv.slice(2);
  var file = args[0];

  var parser = new HyperDown;
  var app = koa();

  if (!fs.existsSync(file)) {
    file = file + '.md';
  }

  app.use(function *() {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      var content = fs.readFileSync(file, 'utf8');
      var html = parser.makeHtml(content);
      this.body = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${file}</title></head><body><div style="width:80%;font-family: Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif;margin:0 auto;">${html}</div></body></html>`;
    } else {
      console.log('Please check you files~');
    }
  });

  app.listen(port);

  child_process.exec(`open http://${url}`);

  app.on('error', function(err) {
    console.error('server error', err);
  });
};
