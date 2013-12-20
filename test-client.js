var bws = require('./')
var stdout = require('stdout')
var multiplex = require('multiplex')
var plexer = multiplex()
var socket = bws(onReady)
plexer.pipe(bws()).pipe(stdout())

function onReady() {
  var FileListStream = require('fileliststream')
  var body = document.body

  function noop(event) {
    event.preventDefault()
    event.stopPropagation()
    return false
  }

  ['dragenter',
   'dragleave',
   'dragexit',
   'dragover'
  ].forEach(function (eventType) {
     body.addEventListener(eventType, noop)
  })

  body.addEventListener('drop', function (event) {
    event.stopPropagation()
    event.preventDefault()

    var fileList = FileListStream(event.dataTransfer.files, {output: 'arraybuffer', chunkSize: 32768})

    fileList.files.map(function(file) {
      var writeStream = plexer.createStream()
      writeStream.write(new Buffer(file.name))
      file.pipe(writeStream)
    })

    return false
  })
}
