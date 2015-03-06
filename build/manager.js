"use strict";

// Provide the appropriate logger each time we're called.
exports.getLogger = getLogger;
exports.setLevelAll = setLevelAll;
exports.getAvailableLevels = getAvailableLevels;

var _ = require("lodash")["default"];

var pkginfo = require("pkginfo-json5")["default"];

var winston = require("winston")["default"];

var getNow = require("./utils").getNow;

var defaultLevel = "verbose";
var loggers = {};
var unknownCount = 0;

// We are forcing winston to handle unhandled exceptions, therefore it is
// our responsibility to bust this limit, not winston's.
process.setMaxListeners(Infinity);

// Utility to redirect a prototype call to a member implementation.
function proxyMethod(proxyClass, implementationProperty, methodName) {
  proxyClass.prototype[methodName] = function () {
    var implementation = this[implementationProperty];
    implementation[methodName].apply(implementation, arguments);
  };
}

// Remove default (basic) console logger.
winston.remove(winston.transports.Console);

var LoggerProxy = (function () {
  function LoggerProxy(name) {
    this.name = name;
    this.consoleTransport = new winston.transports.Console({
      level: defaultLevel,
      handleExceptions: true,
      prettyPrint: true,
      colorize: true,
      timestamp: getNow,
      showMeta: true,
      label: name || undefined
    });
    this.logger = new winston.Logger({
      padLevels: true,
      transports: [this.consoleTransport]
    });
  }
  // Expose a method to allow the user to change the minimal logging level needed
  // to be displayed in the console.
  LoggerProxy.prototype.setLevel = function (level) {
    this.consoleTransport.level = level || defaultLevel;
  };
  LoggerProxy.prototype.log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i - 0] = arguments[_i];
    }
    this.logger.log.apply(this.logger, args);
  };
  return LoggerProxy;
})();

// Redirect the "log" call and the basic logging levels.
_(winston.config.npm.levels).keys().concat(["logs"]).forEach(_.partial(proxyMethod, LoggerProxy, "logger"));
function getLogger(module) {
  // Label value for the module.
  var name;
  if (!module) {
    if (!loggers.__default__) {
      loggers.__default__ = new LoggerProxy();
    }
    return loggers.__default__;
  } else if (typeof module === "string") {
    // If a string, assume it is directly the label.
    name = module;
  } else if (module) {
    // Otherwise, try the role field from the package.json(5) and then
    // the name as a last resort.
    var packageInfo = pkginfo(module, "name", "role");
    if (packageInfo.role) {
      name = packageInfo.role;
    } else if (packageInfo.name) {
      name = packageInfo.name;
    } else {
      name = "unknown-" + ++unknownCount;
    }
  }
  // Verify if a logger is already cached for that name.
  if (!loggers.hasOwnProperty(name)) {
    // Create transport for that name.
    loggers[name] = new LoggerProxy(name);
  }

  return loggers[name];
}

function setLevelAll(level) {
  defaultLevel = level;
  _.each(loggers, function (logger) {
    logger.setLevel(level);
  });
}

function getAvailableLevels() {
  return _.keys(winston.config.npm.levels);
}