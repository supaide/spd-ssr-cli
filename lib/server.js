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
  routerSizeEachTime: 100,
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
  this.app.use('/' + this.static, express.static(this.root + '/' + this.static))
  this.app.get('*', (req, res) => {
    res.sendFile(this.root + '/' + this.index)
  })
  console.log(chalk.cyan('Listening at http://localhost:'+this.port+'\n'))
  this.app.listen(this.port)
}

var process = function (routers, port, callback, options) {
  options = options || {}
  options.routers = routers.join(';')
  var url = 'http://localhost:' + port
  var phantomArguments = [
    path.join(__dirname, 'render.js'),
    url,
    JSON.stringify(options)
  ]
  childProcess.execFile(
    phantom.path,
    phantomArguments,
    {maxBuffer: 1048576},
    function (error, stdout, stderr) {
      if (error || stderr) {
        if (error) throw error
        if (stderr) throw stderr
      }
      callback(stdout)
    })
}

StaticServer.prototype.start = function (routers, callback, finishedCallback) {
  var that = this
  var ind = 0, len = routers.length
  var ts0 = +new Date
  var options = {
    captureAfterTime: this.options.captureAfterTime
  }
  var doit = function () {
    var routers0 = routers.slice(ind, ind+that.options.routerSizeEachTime)
    if (routers0.length < 1) {
      var ets = +new Date
      console.log('all finished, cost '+(ets-ts0)/1000 + 's')
      finishedCallback && finishedCallback()
      return
    }
    var ts1 = +new Date
    process(routers0, that.port, function (html) {
        callback(html)
        var ts2 = +new Date
        console.log(chalk.cyan(' cost '+(ts2-ts1)/1000+'s '+'\n'))
        doit()
      }, options)
    ind += that.options.routerSizeEachTime
  }
  doit()
}

module.exports = StaticServer
