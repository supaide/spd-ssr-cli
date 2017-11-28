var system = require('system')
var page = require('webpage').create()
var fs = require('fs')

var url = system.args[1]
var options = JSON.parse(system.args[2])
if (!options.routers) {
  console.error('routers is empty\n')
  phantom.exit(1)
}

//fs.write('/Users/cyij/tmp/dasd', 'abc', 'w');
console.log(fs.read('/Users/cyij/tmp/tmp/my-project/src/pages.js.json'))
fs.makeDirectory('/Users/cyij/tmp/abc/dasd/csada')
phantom.exit()

page.settings.loadImages = false
page.settings.localToRemoteUrlAccessEnabled = true
page.settings.resourceTimeout = 15000

page.onError = function (message, trace) {
  if (options.ignoreJSErrors) return
  var pathname = url.replace(/http:\/\/localhost:\d+/, '')
  console.error('WARNING: JavaScript error while prerendering: ' + pathname + '\n' + message)
  phantom.exit(1)
}

var routers = options.routers.split(';')
var htmls = []
var ind = 0
var len = routers.length
var process = function () {
  if (ind >= len) {
    console.log(htmls.join("\n<!-- __SSR__SEP__ -->\n"))
    phantom.exit()
    return
  }
  var router = routers[ind]
  if (router.indexOf('?') >= 0) {
    router += '&__SSR=1'
  } else {
    router += '?__SSR=1'
  }
  if (router.indexOf('/') !== 0) {
    router = '/' + router
  }
  page.open(url + router, function (status) {
    if (status !== 'success') {
      throw new Error('FAIL to load: ' + url)
    }
    var captureAfterTime = options.captureAfterTime || 10
    setTimeout(function () {
      var html = page.evaluate(function () {
        var doctype = new window.XMLSerializer().serializeToString(document.doctype)
        var outerHTML = document.documentElement.outerHTML
        return doctype + outerHTML
      })
      htmls.push(html)
      process()
      ind++
    }, captureAfterTime)
  })
}

process()
