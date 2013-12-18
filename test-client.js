var bws = require('./')
var stdout = require('stdout')
var socket = bws(onReady)
bws().pipe(stdout())

function onReady() {
  socket.write('hi')
}

