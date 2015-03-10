"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

// Provide the appropriate logger each time we're called.
exports.getLogger = getLogger;
exports.setLevelAll = setLevelAll;
exports.getAvailableLevels = getAvailableLevels;
var _ = require("lodash");
var pkginfo = require("pkginfo-json5");
var winston = require("winston");

var getNow = require("./utils").getNow;

var config = require("./config");

var defaultLevel = config.isDev ? "verbose" : "info";
var loggers = {};
var defaultLoggerName = "__default__";
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
    _classCallCheck(this, LoggerProxy);

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

  _createClass(LoggerProxy, {
    setLevel: {

      // Expose a method to allow the user to change the minimal logging level
      // needed to be displayed in the console.

      value: function setLevel(level) {
        this.consoleTransport.level = level || defaultLevel;
      }
    }
  });

  return LoggerProxy;
})();

// Redirect the "log" call and the basic logging levels.
_(winston.config.npm.levels).keys().concat(["log"]).forEach(_.partial(proxyMethod, LoggerProxy, "logger"));

// Default values
loggers[defaultLoggerName] = new LoggerProxy();
function getLogger(module) {
  // Label value for the module.
  var name;
  if (!module) {
    return loggers[defaultLoggerName];
  } else if (typeof module === "string") {
    // If a string, assume it is directly the label.
    name = module;
  } else if (module) {
    // Otherwise, try the role field from the package.json(5) and then
    // the name as a last resort.
    var packageInfo;
    try {
      packageInfo = pkginfo(module, "name", "role");
      if (packageInfo.role) {
        name = packageInfo.role;
      } else if (packageInfo.name) {
        name = packageInfo.name;
      } else {
        return loggers[defaultLoggerName];
      }
    } catch (e) {
      return loggers[defaultLoggerName];
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