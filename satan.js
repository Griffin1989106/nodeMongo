
var rpc = require('axon-rpc');
var axon = require('axon');
var rep = axon.socket('rep');
var req = axon.socket('req');
var debug = require('debug')('god:satan');
var events = require("events");
var util = require("util");

const SATAN_PORT = 66666;

var Satan = module.exports = {};

//
// Code switcher
//
Satan.onReady = function() {
  (function init() {
    if (process.env.DAEMON) {
      Satan.remoteWrapper();
    }
    else {
      Satan.pingDaemon(function(ab) {
	if (ab == false)
	  return Satan.launchDaemon(Satan.launchRPC);
	return Satan.launchRPC();
      });
    }
  })();
};

//
// The code that will be executed on the next process
// Here it exposes God methods
//
Satan.remoteWrapper = function() {
  // Only require here because God init himself
  var God = require('./god.js');

  // Send ready message to Satan Client
  process.send({
    online : true, success : true, pid : process.pid
  });

  var server = new rpc.Server(rep);

  rep.bind(SATAN_PORT);

  server.expose({
    prepare : function(opts, fn) {
      God.prepare(opts, function(err, clu) {
	fn(null, stringifyOnce(clu, undefined, 0));
      });
    },
    list : function(opts, fn) {
      God.getMonitorData(fn);
    },
    startId : function(opts, fn) {
      God.startProcessId(opts.id, function(err, clu) {
        fn(err, stringifyOnce(clu, undefined, 0));
      });
    },
    stop : function(opts, fn) {
      God.stopAll(fn);
    },
    killMe : function(fn) {
      console.log('Killing daemon');
      fn(null, {});
      process.exit(0);
    },
    findByScript : function(opts, fn) {
      fn(null, God.findByScript(opts.script));
    },
    daemonData: function(fn) {
      fn(null, {
        pid : process.pid
      });
    }
  });
};

Satan.launchRPC = function() {
  debug('Launching RPC client');
  Satan.client = new rpc.Client(req);
  Satan.ev = req.connect(SATAN_PORT);
  Satan.ev.on('connect', function() {
    process.emit('satan:client:ready');
  });
};

Satan.getExposedMethods = function(cb) {
  Satan.client.methods(function(err, methods) {
    cb(err, methods);
  });
};

//
// Interface to connect to the client
//
Satan.executeRemote = function(method, opts, fn) {
  Satan.client.call(method, opts, function(err, res) {
    fn(err, res);
  });
};

Satan.killDaemon = function(fn) {
  Satan.client.call('killMe', function(err, res) {
    fn(err, res);
  });
};

Satan.launchDaemon = function(cb) {
  debug('Launching daemon');

  var p = require('path');

  // Todo : Redirect daemon logs
  var child = require("child_process").fork(p.resolve(p.dirname(module.filename), 'satan.js'), [], {
    silent : false,
    detached: true,
    cwd: process.cwd(),
    env : {
      "DAEMON" : true
    },
    stdio: "ignore"
  }, function(err, stdout, stderr) {
       debug(arguments);
     });

  child.unref();

  child.once('message', function(msg) {
    process.emit('satan:daemon:ready');
    console.log(msg);
    return setTimeout(function() {cb(child)}, 100); // Put a little time out
  });
};

// TODO : do it better
Satan.pingDaemon = function(cb) {
  var req = axon.socket('req');
  var client = new rpc.Client(req);

  debug('Trying to connect to server');
  client.sock.once('reconnect attempt', function() {
    client.sock.close();
    debug('Daemon not launched');
    cb(false);
  });
  client.sock.once('connect', function() {
    client.sock.close();
    debug('Daemon alive');
    cb(true);
  });
  req.connect(SATAN_PORT);
};

// Change Circular dependies to null
function stringifyOnce(obj, replacer, indent){
  var printedObjects = [];
  var printedObjectKeys = [];

  function printOnceReplacer(key, value){
    var printedObjIndex = false;
    printedObjects.forEach(function(obj, index){
      if(obj===value){
	printedObjIndex = index;
      }
    });

    if(printedObjIndex && typeof(value)=="object"){
      return "null";
    }else{
      var qualifiedKey = key || "(empty key)";
      printedObjects.push(value);
      printedObjectKeys.push(qualifiedKey);
      if(replacer){
	return replacer(key, value);
      }else{
	return value;
      }
    }
  }
  return JSON.stringify(obj, printOnceReplacer, indent);
};

Satan.onReady();
