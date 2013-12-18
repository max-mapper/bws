var websocketStream = require('websocket-stream')
var mbs = require('multibuffer-stream')
var through = require('through')
var combiner = require('stream-combiner')
var bops = require('bops')

module.exports = function(socketAddr, onReady) {
  if (typeof socketAddr === 'function') {
    onReady = socketAddr
    socketAddr = undefined
  }
  var binarySockets = !!(window.WebSocket && (new WebSocket('ws://.')).binaryType);
  if (!binarySockets) return new Error('binary websockets not supported in current browser')
  if (!socketAddr) socketAddr = 'ws://' + location.hostname +
      (location.port ? ':' + location.port : '')
  var socket = websocketStream(socketAddr)
  if (onReady) socket.on('open', onReady)
  return combiner(socket, bufferify(), mbs.unpackStream())
}

function bufferify() {
  return through(function(typedArray, enc, next) {
    if (typedArray instanceof ArrayBuffer) typedArray = new Uint8Array(typedArray)
    var buff = new Buffer(typedArray)
    this.queue(buff)
  })
}
