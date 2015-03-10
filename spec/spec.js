var _ = require("lodash");

function getManager() { return require("../dist/index"); }
function getConfig() { return require("../dist/config"); }

var lastConsoleCall;
function getLastLog() {
  var v = lastConsoleCall;
  lastConsoleCall = undefined;
  return v;
}

function peekLastLog() {
  return lastConsoleCall;
}

var oldWrite = [
  process.stderr.write,
  process.stdout.write,
  console.log
];
function redirect() {
  function logTest(args) {
    lastConsoleCall = args;
  }
  // Redirect console calls
  process.stderr.write = logTest;
  process.stdout.write = logTest;
  console.log = logTest;
}

function resetRedirects() {
  process.stderr.write = oldWrite[0];
  process.stdout.write = oldWrite[1];
  console.log = oldWrite[2];
}


describe("Manager", function() {
  it("should switch dev flags", function() {
    var manager = getManager();
    var config = getConfig();

    var initValue = config.isDev;
    manager.setDev(!initValue);
    expect(config.isDev).toBe(!initValue);
    manager.setDev(initValue);
    expect(config.isDev).toBe(initValue);
  });

  it("should return list of available levels", function() {
    var manager = getManager();
    var levels = manager.getAvailableLevels();
    expect(levels)
      .toEqual(["silly", "debug", "verbose", "info", "warn", "error"]);
  });
});

describe("logger", function() {
  beforeEach(function() {
    redirect();
  });

  afterEach(function() {
    resetRedirects();
  });

  it("should log all", function() {
    var manager = getManager();
    var logger = manager("logger1");
    var levels = manager.getAvailableLevels();
    logger.setLevel(levels[0]);

    _.each(levels, function(level, i) {
      var msg = "test" + i;
      logger.log(level, msg);
      expect(getLastLog()).toContain(msg);
      logger[level](msg);
      expect(getLastLog()).toContain(msg);
    });
  });

  it("should have a tag", function() {
    var manager = getManager();
    manager.setLevelAll = "warn";
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

  it("should not log under current level", function() {
    var manager = getManager();
    var logger = manager("logger1");
    var levels = manager.getAvailableLevels();

    _.each(levels, function(level, i) {
      if(i === levels.length - 1) {
        return;
      }
      logger.setLevel(levels[i+1]);
      logger.log(level, "test");
      expect(getLastLog()).toBeUndefined();
    });
  });

});
