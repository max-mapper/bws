var bws = require('./')
var stdout = require('stdout')
var socket = bws(onReady)
bws().pipe(stdout())

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

    var fileList = FileListStream(event.dataTransfer.files)

    fileList.files[0].pipe(socket)

    return false
  })
}
