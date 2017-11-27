var path = require('path')
var express = require('express')
var phantom = require('phantomjs-prebuilt')
var childProcess = require('child_process')
var objectAssign = require('object-assign')
var chalk = require('chalk')

var DEFAULT_OPTIONS = {
  port: 3000,
  root: './',
  index: 'index.html',
  static: 'static',
  captureAfterTime: 100
}

var StaticServer = function (options) {
  this.app = express()
  this.options = {}
  objectAssign(this.options, DEFAULT_OPTIONS, options)
  this.root = this.options.root
  this.port = this.options.port
  this.static = this.options.static
  this.index = this.options.index
  delete this.options.index
  delete this.options.static
  delete this.options.port
  delete this.options.root
  this.app.use('/' + this.static, express.static(this.root + '/' + this.static))
  this.app.get('*', (req, res) => {
    res.sendFile(this.root + '/' + this.index)
  })
  console.log(chalk.cyan('Listening at http://localhost:'+this.port+'\n'))
  this.app.listen(this.port)
}

var process = function (router, port, callback, options) {
  var query = router
  if (query.indexOf('?') >= 0) {
    query += '&__SSR=1'
  } else {
    query += '?__SSR=1'
  }
  var url = 'http://localhost:' + port + query
  var phantomArguments = [
    path.join(__dirname, 'render.js'),
    url,
    JSON.stringify(options)
  ]
  console.log(chalk.cyan('Start to process '+query+'\n'))
  childProcess.execFile(
    phantom.path,
    phantomArguments,
    {maxBuffer: 1048576},
    function (error, stdout, stderr) {
      if (error || stderr) {
        if (error) throw error
        if (stderr) throw stderr
      }
      callback(query, stdout)
    })
}

StaticServer.prototype.start = function (routers, callback, finishedCallback) {
  var that = this
  var ind = 0, len = routers.length
  var ts0 = +new Date
  var doit = function () {
    if (ind >= len) {
      var ets = +new Date
      console.log('all finished, cost '+(ets-ts0)/1000 + 's')
      finishedCallback && finishedCallback()
      return
    }
    var router = routers[ind]
    var ts1 = +new Date
    process(router, that.port, function (query, html) {
        callback(router, html)
        var ts2 = +new Date
        console.log(chalk.cyan(router + ' cost '+(ts2-ts1)/1000+'s '+'\n'))
        doit()
      }, that.options)
    ind++
  }
  doit()
}

module.exports = StaticServer
