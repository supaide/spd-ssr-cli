var system = require('system')
var page = require('webpage').create()
var fs = require('fs')

var url = system.args[1]
var options = JSON.parse(system.args[2])
if (!options.routers) {
  console.error('routers is empty\n')
  phantom.exit(1)
}

var dest = options.dest
var logFile = options.logFile

if (!fs.exists(options.routers) || !fs.isFile(options.routers)) {
  console.error('router file ['+options.routers+'] is not exist\n')
  phantom.exit(1)
}

page.settings.loadImages = false
page.settings.localToRemoteUrlAccessEnabled = true
page.settings.resourceTimeout = 15000

page.onError = function (message, trace) {
  if (options.ignoreJSErrors) return
  var pathname = url.replace(/http:\/\/localhost:\d+/, '')
  console.error('WARNING: JavaScript error while prerendering: ' + pathname + '\n' + message)
  phantom.exit(1)
}

var routers = []
try {
  routers = JSON.parse(fs.read(options.routers))
} catch (e) {
  console.error('router file ['+options.routers+'] parse error: \n'+e)
  phantom.exit(1)
}

var mkdirp = function (absDir, path) {
  var paths = path.split()
  if (paths.length < 1) {
    return
  }
  var absPath = absDir + '/' + paths[0]
  if (!fs.exists(absPath) || !fs.isDirectory(absPath)) {
    if (!fs.makeDirectory(absPath)) {
      console.error('mkdir ['+absPath+'] failed.')
      phantom.exit(1)
      return
    }
  }
  if (paths.length > 1) {
    mkdirp(absPath, paths.slice(1).join('/'))
  }
}

var saveHtml = function (router, html) {
  mkdirp(dest, router)
  try {
    var file = dest+'/'+router+'/index.html'
    fs.write(file, html, 'w')
  } catch (e) {
    console.error(e)
    phantom.exit(1)
    return false
  }
  return true
}

var log = function (msg) {
  try {
    fs.write(logFile, msg+"\n", 'a')
  } catch (e) {
    console.error(e)
    phantom.exit(1)
  }
}

var htmls = []
var ind = 0
var len = routers.length
var process = function () {
  if (ind >= len) {
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
  var ts0 = +new Date
  log('Start: ['+routers[ind]+']')
  page.open(url + router, function (status) {
    if (status !== 'success') {
      throw new Error('FAIL to load: ' + url)
    }
    var asyncTime = options.asyncTime || 10
    setTimeout(function () {
      var html = page.evaluate(function () {
        var doctype = new window.XMLSerializer().serializeToString(document.doctype)
        var outerHTML = document.documentElement.outerHTML
        return doctype + outerHTML
      })
      var ts1 = +new Date
      if(saveHtml(routers[ind], html)) {
        log('End: ['+routers[ind]+'], cost '+(ts1-ts0)/1000+" seconds.\n")
        ind++
        process()
      } else {
        log('End failed: ['+routers[ind]+'], cost '+(ts1-ts0)/1000+" seconds.\n")
        phantom.exit(1) 
      }
    }, asyncTime)
  })
}

process()
