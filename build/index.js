"use strict";

var _ = require("lodash")["default"];

var manager = require("./manager");

// Attach all exported members to the default exported function
_(manager).keys().filter(function (member) {
  return member !== "getLogger";
}).forEach(function (member) {
  manager.getLogger[member] = manager[member];
});

exports["default"] = manager.getLogger;