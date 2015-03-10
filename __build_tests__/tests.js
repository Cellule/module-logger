"use strict";

var _ = require("lodash");

function getManager() {
  return require("../dist/index");
}
function getConfig() {
  return require("../dist/config");
}

var lastConsoleCall;
function getLastLog() {
  var v = lastConsoleCall;
  lastConsoleCall = undefined;
  return v;
}

function peekLastLog() {
  return lastConsoleCall;
}

// Redirect console calls
var oldWrite = [process.stderr.write, process.stdout.write, console.log];
function redirectConsole() {
  function logTest(args) {
    lastConsoleCall = args;
  }
  process.stderr.write = logTest;
  process.stdout.write = logTest;
  console.log = logTest;
}
function resetConsole() {
  process.stderr.write = oldWrite[0];
  process.stdout.write = oldWrite[1];
  console.log = oldWrite[2];
}

describe("Manager", function () {
  it("should switch dev flags", function () {
    var manager = getManager();
    var config = getConfig();

    var initValue = config.isDev;
    manager.setDev(!initValue);
    expect(config.isDev).toBe(!initValue);
    manager.setDev(initValue);
    expect(config.isDev).toBe(initValue);
  });

  it("should return list of available levels", function () {
    var manager = getManager();
    var levels = manager.getAvailableLevels();
    expect(levels).toEqual(["silly", "debug", "verbose", "info", "warn", "error"]);
  });

  it("should change the level of all current loggers and new ones", function () {
    var manager = getManager();
    var levels = manager.getAvailableLevels();
    var defaultLogger = manager();
    var loggerBase = manager("loggerBase");

    levels.forEach(function (level, i) {
      manager.setLevelAll(level);
      var newLogger = manager("logger" + i);
      [defaultLogger, loggerBase, newLogger].forEach(function (logger) {
        var transports = logger.logger.transports;
        _.each(transports, function (transport) {
          expect(transport.level).toBe(level);
        });
      });
    });
  });
});

var timestampRe = /\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d/;
var timestampNoSecRe = /\d\d\d\d-\d\d-\d\d \d\d:\d\d/;

describe("logger", function () {
  beforeEach(function () {
    redirectConsole();
  });

  afterEach(function () {
    resetConsole();
  });

  it("should log all", function () {
    var manager = getManager();
    var logger = manager("logger1");
    var levels = manager.getAvailableLevels();
    logger.setLevel(levels[0]);

    _.each(levels, function (level, i) {
      var msg = "test" + i;
      logger.log(level, msg);
      expect(getLastLog()).toContain(msg);
      logger[level](msg);
      expect(getLastLog()).toContain(msg);
    });
  });

  it("should have a tag", function () {
    var manager = getManager();
    manager.setLevelAll("warn");
    var logger = manager("logger1");
    var moduleLogger = manager(module);
    var noTagLogger = manager();

    logger.warn("test");
    expect(getLastLog()).toMatch(/\[logger1\]/);
    moduleLogger.warn("test");
    expect(getLastLog()).toMatch(/\[logger\]/);
    noTagLogger.warn("test");
    expect(getLastLog()).toMatch(/:\s+test/);
  });

  it("should not log under current level", function () {
    var manager = getManager();
    var logger = manager("logger1");
    var levels = manager.getAvailableLevels();

    _.each(levels, function (level, i) {
      if (i === levels.length - 1) {
        return;
      }
      logger.setLevel(levels[i + 1]);
      logger.log(level, "test");
      expect(getLastLog()).toBeUndefined();
    });
  });

  it("should show a timestamp", function () {
    var manager = getManager();
    var logger = manager("logger1");
    logger.error("test");
    expect(getLastLog()).toMatch(timestampRe);
  });

  it("should show have different dev timestamps", function () {
    var manager = getManager();
    var logger = manager("logger1");
    manager.setDev(true);
    function getTimestamp() {
      logger.error("test");
      return timestampNoSecRe.exec(getLastLog())[0];
    }
    var ts1 = getTimestamp();
    var ts2 = getTimestamp();
    manager.setDev(false);
    logger.error("test");
    var ts3 = getTimestamp();
    var ts4 = getTimestamp();

    expect(ts1).toEqual(ts2);
    expect(ts3).toEqual(ts4);
    expect(ts1).not.toEqual(ts3);
  });
});