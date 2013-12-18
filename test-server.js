var ecstatic = require('ecstatic')
var server = require('http').createServer(ecstatic(__dirname))
var uuid = require('hat')
var WebSocketServer = require('ws').Server
var websocketStream = require('websocket-stream')
var through = require('through')
var mbs = require('multibuffer-stream')
var stdout = require('stdout')
var wss = new WebSocketServer({ noServer: true })

var binarySockets = {}

server.on('upgrade', function(req, socket, head) {
  wss.handleUpgrade(req, socket, head, function(conn) {
    var stream = websocketStream(conn)
    var packStream = mbs.packStream()

    packStream.pipe(stream)
    
    var id = uuid();
    binarySockets[id] = packStream;
    
    stream.once('end', leave);
    stream.once('error', leave);

    function leave() {
      delete binarySockets[id];
    }
    
    stream.pipe(stdout())
    
    packStream.write(new Buffer('hello world'))
  })
})

server.listen(8080)
console.log('open http://localhost:8080')