var system = require('system')
var page = require('webpage').create()

var url = system.args[1]
var options = JSON.parse(system.args[2])

page.settings.loadImages = false
page.settings.localToRemoteUrlAccessEnabled = true
page.settings.resourceTimeout = 15000

page.onError = function (message, trace) {
  if (options.ignoreJSErrors) return
  var pathname = url.replace(/http:\/\/localhost:\d+/, '')
  console.error('WARNING: JavaScript error while prerendering: ' + pathname + '\n' + message)
  phantom.exit(1)
}

page.open(url, function (status) {
  if (status !== 'success') {
    throw new Error('FAIL to load: ' + url)
  } else {
    var captureAfterTime = options.captureAfterTime || 10

    // CAPTURE AFTER A NUMBER OF MILLISECONDS
    setTimeout(function () {
      var html = page.evaluate(function () {
        var doctype = new window.XMLSerializer().serializeToString(document.doctype)
        var outerHTML = document.documentElement.outerHTML
        return doctype + outerHTML
      })
      returnResult(html)
    }, captureAfterTime)

  }

  function returnResult (html) {
    console.log(html.trim())
    phantom.exit()
  }

})
