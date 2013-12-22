var bws = require('./')
var stdout = require('stdout')
var multiplex = require('multiplex')
var FileListStream = require('fileliststream')
var drop = require("drag-and-drop-files")
var through = require('through2')

var body = document.body
var plexer = multiplex(onStream)
var socket = bws(onReady)
var peerConn

plexer.pipe(bws()).pipe(stdout())

var id = ~~(Math.random() * 10000) + '' + ~~(Math.random() * 10000)
console.log('id', id)
var peer = new Peer(id, { host: 'localhost', port: 9000 })

peer.on('connection', function(conn) {
  conn.on('data', function(data) {
    console.log('chunk', data.byteLength)
    plexer.write(new Buffer(new Uint8Array(data)))
  })
})

function connect(id) {
  var conn = peer.connect(id, {reliable: true})
  console.log('connecting...')
  conn.on('open', function() {
    console.log('connected!')
    peerConn = conn
  })
}

window.connect = connect
window.peer = peer

function onReady() {
  drop(body, function(files) {

    var fileList = FileListStream(event.dataTransfer.files, {output: 'arraybuffer', chunkSize: 32768})

    fileList.files.map(function(file) {
      if (peerConn) return file.pipe(through(function(c, e, n){ peerConn.send(c); n(); }))
      var writeStream = plexer.createStream()
      writeStream.write(new Buffer(file.name))
      file.pipe(writeStream)
    })

  })
}

function onStream(stream, id) {
  console.log('remote stream', id)
  stream.on('data', function(c) {
    console.log(id, 'chunk', c.length)
  })
}
