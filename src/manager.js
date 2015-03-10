var pkginfo = require("pkginfo-json5");
var winston = require("winston");

import {getNow} from "./utils"
import * as config from "./config"

var defaultLevel = config.isDev ? "verbose" : "info";
var loggers = {};
var defaultLoggerName = "__default__";

// We are forcing winston to handle unhandled exceptions, therefore it is
// our responsibility to bust this limit, not winston's.
process.setMaxListeners(Infinity);

// Utility to redirect a prototype call to a member implementation.
function proxyMethod(proxyClass, implementationProperty, methodName) {
  proxyClass.prototype[methodName] = function() {
    var implementation = this[implementationProperty];
    implementation[methodName].apply(implementation, arguments);
  };
}
// Remove default (basic) console logger.
winston.remove(winston.transports.Console);

class LoggerProxy {
  constructor(name) {
    this.name = name;
    this.consoleTransport = new winston.transports.Console({
      level: defaultLevel,
      handleExceptions: true,
      prettyPrint: true,
      colorize: true,
      timestamp: getNow,
      showMeta: true,
      label: (name || undefined)
    });
    this.logger = new winston.Logger({
      padLevels: true,
      transports: [
        this.consoleTransport
      ]
    });
  }

  // Expose a method to allow the user to change the minimal logging level
  // needed to be displayed in the console.
  setLevel(level) {
    this.consoleTransport.level = level || defaultLevel;
  }

  log(...args) {
    this.logger.log.apply(this.logger, args);
  }
}

// Redirect the basic logging levels.
Object.keys(winston.config.npm.levels)
  .forEach(level => {
    proxyMethod(LoggerProxy, "logger", level);
  });

// Default values
loggers[defaultLoggerName] = new LoggerProxy();

// Provide the appropriate logger each time we're called.
export function getLogger(module) {
  // Label value for the module.
  var name;
  if (!module) {
    return loggers[defaultLoggerName];
  }
  else if (typeof module === "string") {
    // If a string, assume it is directly the label.
    name = module;
  }
  else if (module) {
    // Otherwise, try the role field from the package.json(5) and then
    // the name as a last resort.
    var packageInfo;
    try {
      packageInfo = pkginfo(module, "name", "role");
      if (packageInfo.role) {
        name = packageInfo.role;
      }
      else if (packageInfo.name) {
        name = packageInfo.name;
      }
      else {
        return loggers[defaultLoggerName];
      }
    } catch(e) {
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

export function setLevelAll(level) {
  defaultLevel = level;
  for(var loggerName in loggers) {
    if(loggers.hasOwnProperty(loggerName)) {
      loggers[loggerName].setLevel(level);
    }
  }
}

export function getAvailableLevels() {
  return Object.keys(winston.config.npm.levels);
}
