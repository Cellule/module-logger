import _ from "lodash"
import * as manager from "./manager"
import * as config from "./config"

// Attach all exported members to the default exported function
_(manager)
  .keys()
  .filter(member => { return member !== "getLogger"; })
  .forEach(member => { manager.getLogger[member] = manager[member]; });

manager.getLogger.setDev = config.setDev;
export default manager.getLogger;
