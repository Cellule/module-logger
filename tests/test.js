var manager = require("../src/index");

manager.setDev(true);

var logger = manager(module);

logger.silly("127.0.0.1 - there's no place like home");
logger.debug("127.0.0.1 - there's no place like home");
logger.verbose("127.0.0.1 - there's no place like home");
logger.info("127.0.0.1 - there's no place like home");
logger.warn("127.0.0.1 - there's no place like home");
logger.error("127.0.0.1 - there's no place like home");

logger.setLevel("silly");
logger.silly("127.0.0.1 - there's no place like home");
logger.debug("127.0.0.1 - there's no place like home");

manager.setLevelAll("warn");
var logger2 = manager("logger2");

logger.log("silly", "Should not appear");
logger.log("warn", "Should appear");
logger.log("error", "Should appear");

logger2.log("silly", "Should not appear");
logger2.log("warn", "Should appear");
logger2.log("error", "Should appear");

logger2.warn.apply(logger2, manager.getAvailableLevels());

manager.setDev(false);
logger.log("warn", "Time should have changed");
