var ecstatic = require('ecstatic')
var server = require('http').createServer(ecstatic(__dirname))
var uuid = require('hat')
var WebSocketServer = require('ws').Server
var websocketStream = require('websocket-stream')
var through = require('through2')
var headStream = require('head-stream')
var stdout = require('stdout')
var multiplex = require('multiplex')
var fs = require('fs')
var wss = new WebSocketServer({ noServer: true })

var binarySockets = {}

server.on('upgrade', function(req, socket, head) {
  wss.handleUpgrade(req, socket, head, function(conn) {
    var stream = websocketStream(conn)
    var plexer = multiplex(function(stream, id) {
      var hs = headStream(onHead)
      stream.pipe(hs)
      function onHead(buff, next) {
        var filename = 'uploads/' + buff.toString()
        var progress = through(function(c, e, d) {
          console.log(filename, c.length); this.push(c); d()
        }, function(n) {
          console.log(filename, 'done'); n();
        })
        var writeStream = fs.createWriteStream(filename)
        hs.pipe(progress).pipe(writeStream)
        next()
      }
    })
    
    var id = uuid();
    binarySockets[id] = stream;
    
    stream.once('end', leave);
    stream.once('error', leave);

    function leave() {
      delete binarySockets[id];
    }
    
    stream.pipe(plexer)    
  })
})

server.listen(8080)
console.log('open http://localhost:8080')