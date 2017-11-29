var path = require('path')
var express = require('express')
var phantom = require('phantomjs-prebuilt')
var childProcess = require('child_process')
var chalk = require('chalk')

var StaticServer = function (options) {
  this.app = express()
  this.options = options || {}
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

StaticServer.prototype.start = function (onFinish, onError) {
  var that = this
  var ts0 = +new Date
  var options = {
    dest: this.options.dest,
    routers: this.options.routers,
    asyncTime: this.options.asyncTime,
    rootId: this.options.rootId,
    lang: this.options.lang,
    logFile: this.options.logFile
  }
  var url = 'http://localhost:' + this.port
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
        onError && onError(stdout)
      } else {
        onFinish && onFinish(stdout)
      }
    })
}

module.exports = StaticServer
