import * as manager from "./manager"
import * as config from "./config"

// Attach all exported members to the default exported function
Object.keys(manager)
  .filter(member => { return member !== "getLogger"; })
  .forEach(member => { manager.getLogger[member] = manager[member]; });

manager.getLogger.setDev = config.setDev;
module.exports = manager.getLogger;
