# Logger utility

## Installation

```bash
npm install
```
## Usage

### Log a message

```javascript
var logger = require("logger")(module);

// Examples.
logger.log("info", "message");
logger.log("info", "message", {anything: "Meta data!"});
logger.info("possible to directly call the level on logger");
logger.warn("Supports %s.", "util.format()'s printf-like interpolation");
```

The log message will be prepended with the current date and time in the
following format: **YYYY-MM-DD HH:MM:SS**. The timezone will be the local one
when in development, UTC otherwise.

The log message will also display between brackets the name of the package
inferred from the provided module object, to easily distinguish the emitter.

***Note:*** Any uncaught exception will be caught by the logger, at which
            point it will display a detailed trace before exiting the
            application.

### Logging levels

The following logging levels, in order of least to most critical, are allowed:

* *silly*

  Something really really specific, about something already specific. Or
  something not really noteworthy, in any case. Most of the time it's better
  to not log it at all, otherwise it would just be silly.

* *debug*

  Something pretty specific, but useful to have if having elementary problems.
  Most of the time this will log one iteration of a loop over a collection,
  for example.

* *verbose*

  Something rather general about a portion of code, but that allows to
  understand what is the flow of an application when put together with other
  verbose calls.

* *info*

  Something important to know about the application, but that is expected,
  informative and not negative.

* *warn*

  Something for which a flag needs to be raised but that is not necessarily
  critical.

* *error*

  Something critical that requires immediate attention.


By default the lowest level for which the logs are displayed is *info*, but
that is lowered to *verbose* in a development environment. If required, the
minimum level can be changed by doing the following:

```javascript
var logger = require("logger")(module);

// Examples.
logger.debug("message"); // Will not display.
logger.setLevel("silly");
logger.debug("message"); // Will display.
logger.setLevel(); // Will revert to the default level for the
                          // original environment.
```

Keep in mind that multiple modules can be using this module simultaneously and
a call to `setLevel` only affects the logger on which it is applied, use
this to your advantage.
